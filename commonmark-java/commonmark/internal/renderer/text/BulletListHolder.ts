import type { BulletList } from "../../../node";

import ListHolder from "./ListHolder";

class BulletListHolder extends ListHolder {
  private readonly marker: string | undefined;

  public constructor(parent: ListHolder | null, list: BulletList) {
    super(parent);

    this.marker = list.getMarker();
  }

  public getMarker(): string | undefined {
    return this.marker;
  }
}

export default BulletListHolder;
