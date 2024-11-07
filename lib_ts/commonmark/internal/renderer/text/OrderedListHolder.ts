import { OrderedList } from "../../../node";
import ListHolder from "./ListHolder";

class OrderedListHolder extends ListHolder {
  private readonly delimiter: string;
  private counter = -1;

  public constructor(parent: ListHolder, list: OrderedList) {
    super(parent);
    this.delimiter =
      list.getMarkerDelimiter() !== "" ? list.getMarkerDelimiter() : ".";
    this.counter =
      list.getMarkerStartNumber() !== -1 ? list.getMarkerStartNumber() : 1;
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
