import type { OrderedList } from "../../../node";

import ListHolder from "./ListHolder";
import { isNotUnDef } from "../../../../helpers";

class OrderedListHolder extends ListHolder {
  private readonly delimiter: string;
  private counter: number;

  public constructor(parent: ListHolder | null, list: OrderedList) {
    super(parent);

    const markerDelimiter = list.getMarkerDelimiter();
    const markerStartNumber = list.getMarkerStartNumber();

    this.delimiter = isNotUnDef(markerDelimiter) ? markerDelimiter : ".";
    this.counter = isNotUnDef(markerStartNumber) ? markerStartNumber : 1;
  }

  public getDelimiter(): string {
    return this.delimiter;
  }

  public getCounter(): number {
    return this.counter;
  }

  public increaseCounter() {
    this.counter++;
  }
}

export default OrderedListHolder;
