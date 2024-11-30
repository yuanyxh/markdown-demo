declare type TSourcePos = [[number, number], [number, number]];

declare type TListType = "bullet" | "ordered";

declare type TFromCodePoint = (typeof String)["fromCharCode"];

declare type TAttrs = [string, string][];

declare interface IListData {
  delimiter?: string;
  start?: number;
  tight?: boolean;
  type?: TListType;
  bulletChar?: string;
  padding?: number;
  markerOffset?: number;
}

declare interface IParserOptions {
  time?: boolean;
  smart?: boolean;
}
