import type { Visitor } from './interfaces/Visitor';

import ListBlock from './ListBlock';

class BulletList extends ListBlock {
  private marker: string | undefined;

  public constructor() {
    super('bullet-list');
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  /**
   * @return the bullet list marker that was used, e.g. {@code -}, {@code *} or {@code +}, if available, or null otherwise
   */
  public getMarker(): string | undefined {
    return this.marker;
  }

  /**
   * @param marker
   */
  public setMarker(marker?: string) {
    this.marker = marker;
  }
}

export default BulletList;
