declare module "mdurl/encode.js" {
  type TEncode = (url: string) => string;

  const encode: TEncode;

  export default encode;
}
