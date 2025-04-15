import type { OrderedList } from '@/node';

import { isNotUnDef } from '@helpers/index';

import ListHolder from './ListHolder';

class OrderedListHolder extends ListHolder {
  private readonly delimiter: string;
  private counter: number;

  constructor(parent: ListHolder | null, list: OrderedList) {
    super(parent);

    const markerDelimiter = list.getMarkerDelimiter();
    const markerStartNumber = list.getMarkerStartNumber();

    this.delimiter = isNotUnDef(markerDelimiter) ? markerDelimiter : '.';
    this.counter = isNotUnDef(markerStartNumber) ? markerStartNumber : 1;
  }

  getDelimiter(): string {
    return this.delimiter;
  }

  getCounter(): number {
    return this.counter;
  }

  increaseCounter() {
    this.counter++;
  }
}

export default OrderedListHolder;
