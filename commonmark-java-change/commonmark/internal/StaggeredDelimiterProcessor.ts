import type { DelimiterProcessor, DelimiterRun } from "../parser";

/**
 * An implementation of DelimiterProcessor that dispatches all calls to two or more other DelimiterProcessors
 * depending on the length of the delimiter run. All child DelimiterProcessors must have different minimum
 * lengths. A given delimiter run is dispatched to the child with the largest acceptable minimum length. If no
 * child is applicable, the one with the largest minimum length is chosen.
 *
 * DelimiterProcessor 的实现，它将所有调用分派给两个或多个其他 DelimiterProcessor，取决于分隔符运行的长度
 * 所有子 DelimiterProcessor 必须具有不同的最小值长度
 * 给定的分隔符运行将分派给具有最大可接受最小长度的子级
 * 如果没有适用，选择最小长度最大的
 */
class StaggeredDelimiterProcessor implements DelimiterProcessor {
  private readonly delim: string;
  private minLength = 0;
  private processors: DelimiterProcessor[] = []; // in reverse getMinLength order

  public constructor(delim: string) {
    this.delim = delim;
  }

  /**
   * 获取开始的分割符
   *
   * @returns
   */
  public getOpeningCharacter(): string {
    return this.delim;
  }

  /**
   * 获取结束的分割符
   *
   * @returns
   */
  public getClosingCharacter(): string {
    return this.delim;
  }

  /**
   * 获取分割符应被处理的最小长度
   *
   * @returns
   */
  public getMinLength(): number {
    return this.minLength;
  }

  /**
   * 添加分割符处理器
   *
   * @param dp
   */
  public add(dp: DelimiterProcessor) {
    let len = dp.getMinLength();
    let added = false;

    for (let i = 0; i < this.processors.length; i++) {
      const p = this.processors[i];
      const pLen = p.getMinLength();

      if (len > pLen) {
        this.processors.splice(i, 0, dp);
        added = true;
        break;
      } else if (len === pLen) {
        throw Error(
          "Cannot add two delimiter processors for char '" +
            this.delim +
            "' and minimum length " +
            len +
            "; conflicting processors: " +
            p +
            ", " +
            dp
        );
      }
    }

    if (!added) {
      this.processors.push(dp);
      this.minLength = len;
    }
  }

  /**
   * 查找分割符处理器
   *
   * @param len
   * @returns
   */
  private findProcessor(len: number): DelimiterProcessor {
    for (const p of this.processors) {
      if (p.getMinLength() <= len) {
        return p;
      }
    }

    return this.processors[0];
  }

  /**
   * 运行分割符处理器
   *
   * @param openingRun
   * @param closingRun
   * @returns
   */
  public process(openingRun: DelimiterRun, closingRun: DelimiterRun): number {
    return this.findProcessor(openingRun.length()).process(
      openingRun,
      closingRun
    );
  }
}

export default StaggeredDelimiterProcessor;
