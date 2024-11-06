class OrderedListHolder extends ListHolder {
  private readonly delimiter: string | null;
  private counter: int;

  public constructor(parent: ListHolder | null, list: OrderedList | null) {
    super(parent);
    this.delimiter =
      list.getMarkerDelimiter() !== null ? list.getMarkerDelimiter() : ".";
    this.counter =
      list.getMarkerStartNumber() !== null ? list.getMarkerStartNumber() : 1;
  }

  public getDelimiter(): string | null {
    return this.delimiter;
  }

  public getCounter(): int {
    return this.counter;
  }

  public increaseCounter(): void {
    this.counter++;
  }
}

export default OrderedListHolder;
