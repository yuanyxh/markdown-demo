class Appendable {
  private data = '';

  constructor(initStr?: string) {
    if (initStr !== undefined) {
      this.data += initStr;
    }
  }

  append(str: string, start = 0, end = str.length) {
    this.data += str.substring(start, end);
  }

  length() {
    return this.data.length;
  }

  toString() {
    return this.data;
  }
}

export default Appendable;
