import type { OrderedList } from '@/node';
import ListHolder from './ListHolder';
declare class OrderedListHolder extends ListHolder {
    private readonly delimiter;
    private counter;
    constructor(parent: ListHolder | null, list: OrderedList);
    getDelimiter(): string;
    getCounter(): number;
    increaseCounter(): void;
}
export default OrderedListHolder;
