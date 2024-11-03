


import { java, type int } from "jree";



export  class OrderedListHolder extends ListHolder {
    private readonly  delimiter:  java.lang.String | null;
    private  counter:  int;

    public  constructor(parent: ListHolder| null, list: OrderedList| null) {
        super(parent);
        this.delimiter = list.getMarkerDelimiter() !== null ? list.getMarkerDelimiter() : ".";
        this.counter = list.getMarkerStartNumber() !== null ? list.getMarkerStartNumber() : 1;
    }

    public  getDelimiter():  java.lang.String | null {
        return this.delimiter;
    }

    public  getCounter():  int {
        return this.counter;
    }

    public  increaseCounter():  void {
        this.counter++;
    }
}
