class BulletListHolder extends ListHolder {
  private readonly marker: string | null;

  public constructor(parent: ListHolder | null, list: BulletList | null) {
    super(parent);
    this.marker = list.getMarker();
  }

  public getMarker(): string | null {
    return this.marker;
  }
}

export default BulletListHolder;
