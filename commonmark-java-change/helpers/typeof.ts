/**
 * 判断数据不是 undefined
 *
 * @param data
 * @returns
 */
export function isNotUnDef<T>(data: T | undefined): data is T {
  return typeof data !== "undefined";
}

/**
 * 判断数据是 undefined
 *
 * @param data
 * @returns
 */
export function isUnDef(data: any): data is undefined {
  return typeof data === "undefined";
}
