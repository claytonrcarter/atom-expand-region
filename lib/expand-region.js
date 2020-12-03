"use babel";
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import _ from "underscore-plus";

export default class ExpandRegion {
  constructor() {
    this.expand = this.expand.bind(this);
    this.shrink = this.shrink.bind(this);
  }

  editor = null;
  editorElement = null;
  lastSelections = [];
  currentIndex = 0;
  lastEditor = null;

  expand(event) {
    this.editorElement = event.currentTarget;
    this.editor = this.editorElement.getModel();

    if (!this.isActive()) {
      this.candidates = this.computeCandidates();
    }

    // console.log("candidates");
    // this.candidates.forEach((v, k) => {
    //   console.log(`'${k.getText()}'`);
    //   v.ranges.forEach((r) =>
    //     console.log(`'${this.editor.getTextInBufferRange(r)}'`)
    //   );
    // });

    this.editor.expandSelectionsForward((selection) => {
      const candidate = this.candidates.get(selection);
      if (!candidate) {
        return;
      }
      const currentRange = selection.getBufferRange();
      for (let i = 0; i < candidate.ranges.length; i++) {
        if (currentRange.compare(candidate.ranges[i]) === 1) {
          candidate.index = i;
          return selection.setBufferRange(candidate.ranges[i], {
            autoscroll: false,
          });
        }
      }
    });

    this.saveState();
    this.currentIndex++;
  }

  shrink(event) {
    this.editorElement = event.currentTarget;
    this.editor = this.editorElement.getModel();
    if (!this.isActive()) {
      return;
    }
    if (this.currentIndex === 0) {
      return;
    }

    this.currentIndex--;
    this.candidates.forEach((candidate, selection) => {
      let range;
      if (selection.destroyed) {
        if (candidate.ranges.length > this.currentIndex) {
          this.candidates.delete(selection);
          range = candidate.ranges[this.currentIndex];
          selection = this.editor.addSelectionForBufferRange(range, {
            autoscroll: false,
          });
          if (range.isEmpty()) {
            selection.clear();
          }
          return this.candidates.set(selection, candidate);
        }
      } else if (candidate.ranges.length > this.currentIndex) {
        range = candidate.ranges[this.currentIndex];
        selection.setBufferRange(range, { autoscroll: false });
        if (range.isEmpty()) {
          return selection.clear();
        }
      }
    });

    return this.saveState();
  }

  saveState() {
    this.lastSelections = this.editor
      .getSelections()
      .map((selection) => selection.getBufferRange());
    return (this.lastEditor = this.editor);
  }

  computeCandidates() {
    let ranges, selectionRange;
    this.lastSelections = [];
    this.currentIndex = 0;
    const candidates = new Map();

    const results = {};
    // console.log("trying these commands");
    for (let { command, recursive } of this.getCommands()) {
      // console.log(command);
      const object = this.computeRanges(command, recursive);
      // Object.keys(object).forEach((k) =>
      //   object[k].forEach((r) => {
      //     console.log(`'${this.editor.getTextInBufferRange(r)}'`);
      //   })
      // );
      for (selectionRange in object) {
        ranges = object[selectionRange];
        if (results[selectionRange] == null) {
          results[selectionRange] = [];
        }
        results[selectionRange].push(...(ranges || []));
      }
    }

    for (let selection of this.editor.getSelections()) {
      selectionRange = selection.getBufferRange();
      const candidate = { ranges: [selectionRange] };
      //index: 0

      if (results[selectionRange] != null) {
        candidate.ranges.push(...(results[selectionRange] || []));
      }

      candidates.set(selection, candidate);
    }

    return this.uniq(candidates);
  }

  uniq(candidates) {
    candidates.forEach(function (candidate) {
      candidate.ranges.sort((a, b) => b.compare(a));
      return (candidate.ranges = _.uniq(candidate.ranges, true, (v) =>
        v.toString()
      ));
    });
    return candidates;
  }

  isActive() {
    if (this.editor !== this.lastEditor) {
      return false;
    }
    if (this.lastSelections.length === 0) {
      return false;
    }

    const selections = this.editor.getSelections();
    if (this.lastSelections.length !== selections.length) {
      return false;
    }

    return selections.every((s, i) =>
      s.getBufferRange().isEqual(this.lastSelections[i])
    );
  }

  computeRanges(command, recursive) {
    let selection;
    if (recursive == null) {
      recursive = false;
    }
    const state = new Map();
    const results = {};
    const ranges = [];

    for (selection of this.editor.getSelections()) {
      state.set(selection, selection.getBufferRange());
    }

    const scrollTop = this.editorElement.getScrollTop();

    this.editor.transact(() => {
      atom.commands.dispatch(this.editorElement, command);

      for (selection of this.editor.getSelections()) {
        results[state.get(selection)] = [selection.getBufferRange()];
      }

      const selection2string = (selection) =>
        selection.getBufferRange().toString();

      if (recursive) {
        while (1) {
          const prevRanges = this.editor.getSelections().map(selection2string);
          atom.commands.dispatch(this.editorElement, command);
          const currentRanges = this.editor
            .getSelections()
            .map(selection2string);
          if (_.isEqual(prevRanges, currentRanges)) {
            break;
          }

          for (selection of this.editor.getSelections()) {
            results[state.get(selection)].push(selection.getBufferRange());
          }
        }
      }

      if (this.editorElement.getScrollTop() !== scrollTop) {
        this.editorElement.setScrollTop(scrollTop);
      }
      return this.editor.abortTransaction();
    });

    // restore
    state.forEach((range, selection) => {
      if (selection.destroyed) {
        return this.editor.addSelectionForBufferRange(range);
      } else {
        return selection.setBufferRange(range);
      }
    });

    return results;
  }

  getCommands() {
    const scopeDescriptor = this.editor.getRootScopeDescriptor();
    // console.log("scope", scopeDescriptor.scopes);
    const commands = atom.config.get("expand-region.commands", {
      scope: scopeDescriptor,
    });
    const { registeredCommands } = atom.commands;
    return commands.filter(({ command }) => registeredCommands[command]);
  }
}
