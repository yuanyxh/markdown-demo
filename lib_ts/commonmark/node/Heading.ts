
import { java, type int } from "jree";



export  class Heading extends Block {

    private  level:  int;

    public  accept(visitor: Visitor| null):  void {
        visitor.visit(this);
    }

    public  getLevel():  int {
        return this.level;
    }

    public  setLevel(level: int):  void {
        this.level = level;
    }
}
