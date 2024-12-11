class Appendable {
  private data = "";

  public constructor(initStr?: string) {
    if (initStr !== undefined) {
      this.data += initStr;
    }
  }

  public append(str: string, start = 0, end = str.length) {
    this.data += str.substring(start, end);
  }

  public length() {
    return this.data.length;
  }

  public toString() {
    return this.data;
  }
}

export default Appendable;
