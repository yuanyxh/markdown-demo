import ListHolder from "./ListHolder";
import { BulletList } from "../../../node";

class BulletListHolder extends ListHolder {
  private readonly marker: string | null;

  public constructor(parent: ListHolder, list: BulletList) {
    super(parent);
    this.marker = list.getMarker();
  }

  public getMarker(): string | null {
    return this.marker;
  }
}

export default BulletListHolder;
