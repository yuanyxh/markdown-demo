import type { Visitor } from "./interfaces/Visitor";

import Node from "./abstracts/Node";

class Image extends Node {
  private destination = "";
  private title: string | undefined;

  public constructor(destination = "", title: string | undefined) {
    super();
    this.destination = destination;
    this.title = title;
  }

  public override accept(visitor: Visitor) {
    visitor.visit(this);
  }

  public getDestination(): string {
    return this.destination;
  }

  public setDestination(destination: string) {
    this.destination = destination;
  }

  public getTitle(): string | undefined {
    return this.title;
  }

  public setTitle(title: string) {
    this.title = title;
  }

  protected toStringAttributes(): string {
    return "destination=" + this.destination + ", title=" + this.title;
  }
}

export default Image;
