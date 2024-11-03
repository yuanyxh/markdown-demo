


import { java, JavaObject } from "jree";



export abstract  class AbstractBlockParser extends JavaObject implements BlockParser {

    public  isContainer():  boolean {
        return false;
    }

    public  canHaveLazyContinuationLines():  boolean {
        return false;
    }

    public  canContain(childBlock: Block| null):  boolean {
        return false;
    }

    public  addLine(line: SourceLine| null):  void {
    }

    public  addSourceSpan(sourceSpan: SourceSpan| null):  void {
        getBlock().addSourceSpan(sourceSpan);
    }

    public  getDefinitions():  java.util.List<DefinitionMap<unknown>> | null {
        return java.util.List.of();
    }

    public  closeBlock():  void {
    }

    public  parseInlines(inlineParser: InlineParser| null):  void {
    }

}
