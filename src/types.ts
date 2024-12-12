import type { Block } from "../commonmark-java-change/commonmark";

declare global {
  interface IChangeRange {
    start: number;
    end: number;
  }

  interface ICommonAncestor {
    element: HTMLElement;
    blockAncestor: Block;
  }

  type TCursorDir = "forward" | "back";
}
