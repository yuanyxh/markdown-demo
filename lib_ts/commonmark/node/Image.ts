import Node from "./Node";
import { Visitor } from "./Visitor";

class Image extends Node {
  private destination = "";
  private title = "";

  public constructor(destination = "", title = "") {
    super();
    this.destination = destination;
    this.title = title;
  }

  public accept(visitor: Visitor) {
    visitor.visit(this);
  }

  public getDestination(): string {
    return this.destination;
  }

  public setDestination(destination: string) {
    this.destination = destination;
  }

  public getTitle(): string {
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
