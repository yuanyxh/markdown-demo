export function isNotUnDef<T>(data: T | undefined): data is T {
  return typeof data !== "undefined";
}

export function isUnDef(data: any): data is undefined {
  return typeof data === "undefined";
}
