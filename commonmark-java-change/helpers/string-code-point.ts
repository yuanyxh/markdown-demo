/**
 * String.fromCodePoint 的包装函数
 *
 * @param codes
 * @returns
 */
function fromCodePoint(...codes: number[]) {
  try {
    return String.fromCodePoint(...codes);
  } catch (e) {
    if (e instanceof RangeError) {
      return String.fromCharCode(0xfffd);
    }

    throw e;
  }
}

export default fromCodePoint;
