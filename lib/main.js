"use babel";
/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
import { CompositeDisposable } from "atom";
import ExpandRegion from "./expand-region";
import Selector from "./selector";

module.exports = {
  subscriptions: null,

  config: {
    commands: {
      type: "array",
      default: [
        {
          command: "editor:select-word",
          recursive: false,
        },
        {
          command: "expand-region:select-word-include-dash",
          recursive: false,
        },
        {
          command: "expand-region:select-word-include-dash-and-dot",
          recursive: false,
        },
        {
          command: "expand-region:select-fold",
          recursive: true,
        },
        {
          command: "expand-region:select-inside-paragraph",
          recursive: false,
        },
        {
          command: "expand-region:select-inside-single-quotes",
          recursive: false,
        },
        {
          command: "expand-region:select-around-single-quotes",
          recursive: false,
        },
        {
          command: "expand-region:select-inside-double-quotes",
          recursive: false,
        },
        {
          command: "expand-region:select-around-double-quotes",
          recursive: false,
        },
        {
          command: "expand-region:select-inside-parentheses",
          recursive: true,
        },
        {
          command: "expand-region:select-around-parentheses",
          recursive: true,
        },
        {
          command: "expand-region:select-inside-curly-brackets",
          recursive: true,
        },
        {
          command: "expand-region:select-around-curly-brackets",
          recursive: true,
        },
        {
          command: "expand-region:select-inside-square-brackets",
          recursive: true,
        },
        {
          command: "expand-region:select-around-square-brackets",
          recursive: true,
        },
      ],
      items: {
        type: "object",
        properties: {
          command: {
            type: "string",
          },
          once: {
            type: "boolean",
          },
        },
      },
    },
  },

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.expandRegion = new ExpandRegion();

    // Register command that toggles this view
    return this.subscriptions.add(
      atom.commands.add("atom-text-editor", {
        "expand-region:expand": this.expandRegion.expand,
        "expand-region:shrink": this.expandRegion.shrink,
        "expand-region:select-word-include-dash"(event) {
          return Selector.select(event, "Word", ["-"]);
        },
        "expand-region:select-word-include-dash-and-dot"(event) {
          return Selector.select(event, "Word", ["-", "."]);
        },
        "expand-region:select-tag-attribute"(event) {
          return Selector.select(event, "Word", ["-", ".", '"', "=", "/"]);
        },
        "expand-region:select-scope"(event) {
          return Selector.select(event, "Scope");
        },
        "expand-region:select-fold"(event) {
          return Selector.select(event, "Fold");
        },
        "expand-region:select-inside-paragraph"(event) {
          return Selector.select(event, "InsideParagraph");
        },
        "expand-region:select-inside-single-quotes"(event) {
          return Selector.select(event, "InsideQuotes", "'", false);
        },
        "expand-region:select-inside-double-quotes"(event) {
          return Selector.select(event, "InsideQuotes", '"', false);
        },
        "expand-region:select-inside-back-ticks"(event) {
          return Selector.select(event, "InsideQuotes", "`", false);
        },
        "expand-region:select-inside-parentheses"(event) {
          return Selector.select(event, "InsideBrackets", "(", ")", false);
        },
        "expand-region:select-inside-curly-brackets"(event) {
          return Selector.select(event, "InsideBrackets", "{", "}", false);
        },
        "expand-region:select-inside-angle-brackets"(event) {
          return Selector.select(event, "InsideBrackets", "<", ">", false);
        },
        "expand-region:select-inside-square-brackets"(event) {
          return Selector.select(event, "InsideBrackets", "[", "]", false);
        },
        "expand-region:select-inside-tags"(event) {
          return Selector.select(event, "InsideBrackets", ">", "<", false);
        },
        "expand-region:select-around-single-quotes"(event) {
          return Selector.select(event, "InsideQuotes", "'", true);
        },
        "expand-region:select-around-double-quotes"(event) {
          return Selector.select(event, "InsideQuotes", '"', true);
        },
        "expand-region:select-around-back-ticks"(event) {
          return Selector.select(event, "InsideQuotes", "`", true);
        },
        "expand-region:select-around-parentheses"(event) {
          return Selector.select(event, "InsideBrackets", "(", ")", true);
        },
        "expand-region:select-around-curly-brackets"(event) {
          return Selector.select(event, "InsideBrackets", "{", "}", true);
        },
        "expand-region:select-around-angle-brackets"(event) {
          return Selector.select(event, "InsideBrackets", "<", ">", true);
        },
        "expand-region:select-around-square-brackets"(event) {
          return Selector.select(event, "InsideBrackets", "[", "]", true);
        },
      })
    );
  },

  deactivate() {
    if (this.subscriptions != null) {
      this.subscriptions.dispose();
    }
    return (this.subscriptions = null);
  },
};
