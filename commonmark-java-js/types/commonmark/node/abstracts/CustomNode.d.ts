import type { Visitor } from '../interfaces/Visitor';
import Node from './Node';
declare abstract class CustomNode extends Node {
    accept(visitor: Visitor): void;
}
export default CustomNode;
