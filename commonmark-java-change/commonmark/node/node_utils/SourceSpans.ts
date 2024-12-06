import type MarkdownNode from "../abstracts/MarkdownNode";

import SourceSpan from "./SourceSpan";

/**
 * A list of source spans that can be added to. Takes care of merging adjacent source spans.
 *
 * 可添加的源范围列表；负责合并相邻的源跨度
 *
 * @since 0.16.0
 */
class SourceSpans {
  private sourceSpans: SourceSpan[] | null = null;

  /**
   * 获取 SourceSpan 列表
   *
   * @returns
   */
  public getSourceSpans(): SourceSpan[] {
    return this.sourceSpans ? this.sourceSpans : [];
  }

  /**
   * 添加指定节点的 SourceSpan 列表
   *
   * @param nodes
   */
  public addAllFrom(nodes: MarkdownNode[]): void {
    for (const node of nodes) {
      this.addAll(node.getSourceSpans());
    }
  }

  /**
   * 添加 SourceSpan 列表
   *
   * @param other
   * @returns
   */
  public addAll(other: SourceSpan[]) {
    if (other.length === 0) {
      return;
    }

    if (!this.sourceSpans) {
      this.sourceSpans = [];
    }

    if (this.sourceSpans.length === 0) {
      this.sourceSpans.push(...other);
    } else {
      const lastIndex = this.sourceSpans.length - 1;
      const a = this.sourceSpans[lastIndex];
      const b = other[0];
      if (a.getInputIndex() + a.getLength() === b.getInputIndex()) {
        this.sourceSpans[lastIndex] = SourceSpan.of(
          a.getLineIndex(),
          a.getColumnIndex(),
          a.getInputIndex(),
          a.getLength() + b.getLength()
        );

        this.sourceSpans.push(...other.slice(1, other.length));
      } else {
        this.sourceSpans.push(...other);
      }
    }
  }

  /**
   * 返回空的 SourceSpans
   *
   * @returns
   */
  public static empty(): SourceSpans {
    return new SourceSpans();
  }
}

export default SourceSpans;
