/**
 * Any node that has implemented the getLiteral and setLiteral methods.
 */
export interface LiteralNode {
  getLiteral(): string;
  setLiteral(literal: string): void;
}
