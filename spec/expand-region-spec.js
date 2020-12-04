/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * DS202: Simplify dynamic range loops
 * DS205: Consider reworking code to avoid use of IIFEs
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
const path = require("path");

describe("ExpandRegion", () => {
  let activationPromise, editor, editorElement;

  beforeEach(() => {
    activationPromise = atom.packages.activatePackage("expand-region");

    waitsForPromise(() =>
      atom.packages.loadPackage("expand-region").loadSettings()
    );
  });

  describe("php", () => {
    beforeEach(() => {
      waitsForPromise(() => atom.packages.activatePackage("language-php"));
      waitsForPromise(() =>
        atom.workspace
          .open(path.join(__dirname, "fixtures", "sample.php"))
          .then(function (_editor) {
            editor = _editor;
            editorElement = atom.views.getView(_editor);
          })
      );
    });

    describe("activate", () => {
      beforeEach(() => editor.setCursorScreenPosition([8, 34]));

      it("expand selection", () => {
        atom.commands.dispatch(editorElement, "expand-region:expand");

        waitsForPromise(() => activationPromise);

        runs(() => {
          expect(editor.getSelectedText()).toBe("arg2");

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedText()).toBe("$arg2");

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedText()).toBe("$arg1 + $arg2");

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedText()).toBe("($arg1 + $arg2)");

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedText()).toBe(
            "($arg1 + $arg2) * $arg1 - $arg2"
          );

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedText()).toBe(
            "(($arg1 + $arg2) * $arg1 - $arg2)"
          );

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [7, 5],
            [9, 4],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [7, 4],
            [9, 5],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [7, 0],
            [8, 57],
          ]);

          // ??
          // atom.commands.dispatch(editorElement, "expand-region:expand");
          // expect(editor.getSelectedScreenRange()).toEqual([
          //   [7, 0],
          //   [9, 5],
          // ]);

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [5, 1],
            [15, 0],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [5, 0],
            [14, 5],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [5, 0],
            [15, 1],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [4, 0],
            [10, 0],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [0, 0],
            [16, 0],
          ]);
        });
      });
    });
  });

  describe("coffeescript", () => {
    beforeEach(() => {
      waitsForPromise(() =>
        atom.workspace
          .open(path.join(__dirname, "fixtures", "sample.coffee"))
          .then(function (_editor) {
            editor = _editor;
            editorElement = atom.views.getView(_editor);
          })
      );
    });

    describe("activate", function () {
      beforeEach(() => editor.setCursorScreenPosition([3, 15]));

      it("expand selection", function () {
        atom.commands.dispatch(editorElement, "expand-region:expand");

        waitsForPromise(() => activationPromise);

        runs(() => {
          expect(editor.getSelectedText()).toBe("arg2");

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedText()).toBe("arg1 + arg2");

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedText()).toBe("(arg1 + arg2)");

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedText()).toBe("(arg1 + arg2) * arg1");

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedText()).toBe("((arg1 + arg2) * arg1)");

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [2, 0],
            [3, 33],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [2, 0],
            [4, 0],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [0, 8],
            [8, 0],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [0, 7],
            [8, 1],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:expand");
          expect(editor.getSelectedScreenRange()).toEqual([
            [0, 0],
            [6, 33],
          ]);
        });
      });

      it("shrink selection", () => {
        atom.commands.dispatch(editorElement, "expand-region:expand");

        waitsForPromise(() => activationPromise);

        runs(() => {
          for (let i = 0; i <= 8; i++) {
            atom.commands.dispatch(editorElement, "expand-region:expand");
          }
          expect(editor.getSelectedScreenRange()).toEqual([
            [0, 0],
            [6, 33],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:shrink");
          expect(editor.getSelectedScreenRange()).toEqual([
            [0, 7],
            [8, 1],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:shrink");
          expect(editor.getSelectedScreenRange()).toEqual([
            [0, 8],
            [8, 0],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:shrink");
          expect(editor.getSelectedScreenRange()).toEqual([
            [2, 0],
            [4, 0],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:shrink");
          expect(editor.getSelectedScreenRange()).toEqual([
            [2, 0],
            [3, 33],
          ]);

          atom.commands.dispatch(editorElement, "expand-region:shrink");
          expect(editor.getSelectedText()).toBe("((arg1 + arg2) * arg1)");

          atom.commands.dispatch(editorElement, "expand-region:shrink");
          expect(editor.getSelectedText()).toBe("(arg1 + arg2) * arg1");

          atom.commands.dispatch(editorElement, "expand-region:shrink");
          expect(editor.getSelectedText()).toBe("(arg1 + arg2)");

          atom.commands.dispatch(editorElement, "expand-region:shrink");
          expect(editor.getSelectedText()).toBe("arg1 + arg2");

          atom.commands.dispatch(editorElement, "expand-region:shrink");
          expect(editor.getSelectedText()).toBe("arg2");

          atom.commands.dispatch(editorElement, "expand-region:shrink");
          expect(editor.getCursorScreenPosition()).toEqual([3, 15]);
        });
      });
    });

    describe("multiple cursors", () => {
      const validResults = [
        [
          [
            [3, 13],
            [3, 17],
          ],
          [
            [6, 13],
            [6, 17],
          ],
        ],
        [
          [
            [3, 6],
            [3, 17],
          ],
          [
            [6, 6],
            [6, 17],
          ],
        ],
        [
          [
            [3, 5],
            [3, 18],
          ],
          [
            [6, 5],
            [6, 18],
          ],
        ],
        [
          [
            [3, 5],
            [3, 25],
          ],
          [
            [6, 5],
            [6, 25],
          ],
        ],
        [
          [
            [3, 4],
            [3, 26],
          ],
          [
            [6, 4],
            [6, 26],
          ],
        ],
        [
          [
            [2, 0],
            [3, 33],
          ],
          [
            [5, 0],
            [6, 33],
          ],
        ],
        [
          [
            [2, 0],
            [4, 0],
          ],
          [
            [5, 0],
            [7, 0],
          ],
        ],
        [
          [
            [0, 8],
            [8, 0],
          ],
        ],
        [
          [
            [0, 7],
            [8, 1],
          ],
        ],
        [
          [
            [0, 0],
            [6, 33],
          ],
        ],
      ];

      beforeEach(() => editor.setCursorScreenPosition([3, 15]));

      it("expand selection", () => {
        editor.addCursorAtBufferPosition([6, 15]);
        atom.commands.dispatch(editorElement, "expand-region:expand");

        waitsForPromise(() => activationPromise);

        runs(() => {
          validResults.forEach((result) => {
            expect(editor.getSelectedBufferRanges()).toEqual(result);
            atom.commands.dispatch(editorElement, "expand-region:expand");
          });
        });
      });

      it("shrink selection", () => {
        editor.addCursorAtBufferPosition([6, 15]);
        atom.commands.dispatch(editorElement, "expand-region:expand");

        waitsForPromise(() => activationPromise);

        runs(() => {
          const count = validResults.length - 2;
          for (let i = 0; i <= count; i++) {
            atom.commands.dispatch(editorElement, "expand-region:expand");
          }

          validResults.reverse().forEach((result) => {
            expect(editor.getSelectedBufferRanges()).toEqual(result);
            atom.commands.dispatch(editorElement, "expand-region:shrink");
          });
        });
      });
    });
  });
});
