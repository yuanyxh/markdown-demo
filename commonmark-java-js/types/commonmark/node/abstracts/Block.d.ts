import Node from './Node';
/**
 * Block nodes such as paragraphs, list blocks, code blocks etc.
 */
declare abstract class Block extends Node {
    isBlock(): boolean;
    getParent(): Block | null;
    setParent(parent: Node): void;
}
export default Block;
