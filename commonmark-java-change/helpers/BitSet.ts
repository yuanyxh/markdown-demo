class BitSet {
  private readonly values: boolean[] = [];

  public constructor(values?: boolean[]) {
    if (values) {
      this.values = values;
    }
  }

  set(index: number) {
    while (index >= this.values.length) {
      this.values.push(false);
    }

    this.values[index] = true;
  }

  get(index: number) {
    return this.values[index] || false;
  }

  clone() {
    return new BitSet(this.values.slice(0));
  }
}

export default BitSet;
