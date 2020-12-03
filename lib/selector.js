"use babel";
/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _ from "underscore-plus";
import { Range, Point } from "atom";

export default class Selector {
  static select(event, type, ...args) {
    const editor =
      typeof event.currentTarget.getModel === "function"
        ? event.currentTarget.getModel()
        : undefined;
    if (!editor) {
      return;
    }

    const method = `select${type}`;
    return editor.expandSelectionsForward((selection) => {
      return this[method](selection, ...Array.from(args));
    });
  }

  static selectWord(selection, includeCharacters) {
    if (includeCharacters == null) {
      includeCharacters = [];
    }
    let nonWordCharacters = atom.config.get("editor.nonWordCharacters", {
      scope: selection.cursor.getScopeDescriptor(),
    });
    for (let char of Array.from(includeCharacters)) {
      nonWordCharacters = nonWordCharacters.replace(char, "");
    }
    const wordRegex = new RegExp(
      `[^\\s${_.escapeRegExp(nonWordCharacters)}]+`,
      "g"
    );
    const options = { wordRegex, includeNonWordCharacters: false };
    selection.setBufferRange(
      selection.cursor.getCurrentWordBufferRange(options)
    );
    selection.wordwise = true;
    return (selection.initialScreenRange = selection.getScreenRange());
  }

  static selectScope(selection) {
    let scopes = selection.cursor.getScopeDescriptor().getScopesArray();
    if (!scopes) {
      return;
    }

    const selectionRange = selection.getBufferRange();
    scopes = scopes.slice().reverse();
    const { editor } = selection;

    for (let scope of Array.from(scopes)) {
      const scopeRange = editor.bufferRangeForScopeAtPosition(
        scope,
        selection.cursor.getBufferPosition()
      );

      if (
        (scopeRange != null
          ? scopeRange.containsRange(selectionRange)
          : undefined) &&
        !(scopeRange != null ? scopeRange.isEqual(selectionRange) : undefined)
      ) {
        selection.setBufferRange(scopeRange);
        return;
      }
    }
  }

  static selectFold(selection) {
    // SEE: https://github.com/atom/atom/blob/d36c102ca09fac19e43e64050ec722200829f8d5/src/text-editor.js#L4013-L4026
    const selectionRange = selection.getBufferRange();
    const { editor } = selection;
    const { languageMode } = editor;

    for (
      let currentRow = selectionRange.start.row,
        asc = selectionRange.start.row <= 0;
      asc ? currentRow <= 0 : currentRow >= 0;
      asc ? currentRow++ : currentRow--
    ) {
      const { start, end } =
        languageMode.getFoldableRangeContainingPoint(
          Point(currentRow, Infinity),
          editor.getTabLength()
        ) || {};
      if (start == null) {
        continue;
      }
      const foldRange = new Range(
        [start.row, 0],
        [end.row, editor.lineTextForBufferRow(end.row).length]
      );
      if (
        (foldRange != null
          ? foldRange.containsRange(selectionRange)
          : undefined) &&
        !(foldRange != null ? foldRange.isEqual(selectionRange) : undefined)
      ) {
        selection.setBufferRange(foldRange);
        return;
      }
    }
  }

  static selectInsideParagraph(selection) {
    const range = selection.cursor.getCurrentParagraphBufferRange();
    if (range == null) {
      return;
    }
    selection.setBufferRange(range);
    return selection.selectToBeginningOfNextParagraph();
  }

  static selectInsideQuotes(selection, char, includeQuotes) {
    const findOpeningQuote = function (pos) {
      const start = pos.copy();
      pos = pos.copy();
      while (pos.row >= 0) {
        const line = editor.lineTextForBufferRow(pos.row);
        if (pos.column === -1) {
          pos.column = line.length - 1;
        }
        while (pos.column >= 0) {
          if (line[pos.column] === char) {
            if (pos.column === 0 || line[pos.column - 1] !== "\\") {
              if (isStartQuote(pos)) {
                return pos;
              } else {
                return lookBackwardOnLine(start) || lookForwardOnLine(start);
              }
            }
          }
          --pos.column;
        }
        pos.column = -1;
        --pos.row;
      }
      return lookForwardOnLine(start);
    };

    var isStartQuote = function (end) {
      const line = editor.lineTextForBufferRow(end.row);
      const numQuotes =
        line
          .substring(0, end.column + 1)
          .replace(`'${char}`, "")
          .split(char).length - 1;
      return numQuotes % 2;
    };

    var lookForwardOnLine = function (pos) {
      const line = editor.lineTextForBufferRow(pos.row);

      const index = line.substring(pos.column).indexOf(char);
      if (index >= 0) {
        pos.column += index;
        return pos;
      }
      return null;
    };

    var lookBackwardOnLine = function (pos) {
      const line = editor
        .lineTextForBufferRow(pos.row)
        .substring(0, pos.column);

      const index = line.lastIndexOf(char);
      if (index >= 0) {
        pos.column += index - line.length;
        return pos;
      }
      return null;
    };

    const findClosingQuote = function (start) {
      const end = start.copy();
      const escaping = false;

      while (end.row < editor.getLineCount()) {
        const endLine = editor.lineTextForBufferRow(end.row);
        while (end.column < endLine.length) {
          if (endLine[end.column] === "\\") {
            ++end.column;
          } else if (endLine[end.column] === char) {
            if (includeQuotes) {
              --start.column;
            }
            if (includeQuotes) {
              ++end.column;
            }
            return end;
          }
          ++end.column;
        }
        end.column = 0;
        ++end.row;
      }
    };

    var { editor, cursor } = selection;
    const start = findOpeningQuote(cursor.getBufferPosition());
    if (start != null) {
      ++start.column; // skip the opening quote
      const end = findClosingQuote(start);
      if (end != null) {
        return selection.setBufferRange([start, end]);
      }
    }
  }

  static selectInsideBrackets(selection, beginChar, endChar, includeBrackets) {
    const findOpeningBracket = function (pos) {
      pos = pos.copy();
      let depth = 0;
      while (pos.row >= 0) {
        const line = editor.lineTextForBufferRow(pos.row);
        if (pos.column === -1) {
          pos.column = line.length - 1;
        }
        while (pos.column >= 0) {
          switch (line[pos.column]) {
            case endChar:
              ++depth;
              break;
            case beginChar:
              if (--depth < 0) {
                return pos;
              }
              break;
          }
          --pos.column;
        }
        pos.column = -1;
        --pos.row;
      }
    };

    const findClosingBracket = function (start) {
      const end = start.copy();
      let depth = 0;
      while (end.row < editor.getLineCount()) {
        const endLine = editor.lineTextForBufferRow(end.row);
        while (end.column < endLine.length) {
          switch (endLine[end.column]) {
            case beginChar:
              ++depth;
              break;
            case endChar:
              if (--depth < 0) {
                if (includeBrackets) {
                  --start.column;
                }
                if (includeBrackets) {
                  ++end.column;
                }
                return end;
              }
              break;
          }
          ++end.column;
        }
        end.column = 0;
        ++end.row;
      }
    };

    var { editor, cursor } = selection;
    const start = findOpeningBracket(cursor.getBufferPosition());
    if (start != null) {
      ++start.column; // skip the opening quote
      const end = findClosingBracket(start);
      if (end != null) {
        return selection.setBufferRange([start, end]);
      }
    }
  }
}
