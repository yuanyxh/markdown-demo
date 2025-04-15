import type { Visitor } from '../interfaces/Visitor';
import Block from './Block';
declare abstract class CustomBlock extends Block {
    accept(visitor: Visitor): void;
}
export default CustomBlock;
