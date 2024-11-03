


import { java } from "jree";



export  class BulletListHolder extends ListHolder {
    private readonly  marker:  java.lang.String | null;

    public  constructor(parent: ListHolder| null, list: BulletList| null) {
        super(parent);
        this.marker = list.getMarker();
    }

    public  getMarker():  java.lang.String | null {
        return this.marker;
    }
}
