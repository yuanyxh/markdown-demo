/** 源码位置 */
declare type TSourcePos = [[number, number], [number, number]];

/** 列表类型 */
declare type TListType = "bullet" | "ordered";

/** fromCharCode 函数类型 */
declare type TFromCodePoint = (typeof String)["fromCharCode"];

/** 属性 */
declare type TAttrs = [string, string][];

/** 列表数据 */
declare interface IListData {
  delimiter?: string;
  start?: number;
  tight?: boolean;
  type?: TListType;
  bulletChar?: string;
  padding?: number;
  markerOffset?: number;
}

/** 解析参数 */
declare interface IParserOptions {
  /** 是否输出解析运行时间 */
  time?: boolean;
  /**
   * 如果为 true，则 " 将变为 “，-- 将更改为短破折号， --- 将更改为长破折号，并且 ... 将更改为省略号
   */
  smart?: boolean;
}
