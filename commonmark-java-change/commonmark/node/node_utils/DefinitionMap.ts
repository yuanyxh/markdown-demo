import { Escaping } from "../../internal";

/**
 * A map that can be used to store and look up reference definitions by a label. The labels are case-insensitive and
 * normalized, the same way as for {@link LinkReferenceDefinition} nodes.
 *
 * 可用于通过标签存储和查找参考定义的映射；
 * 标签不区分大小写，并且标准化，与 {@link LinkReferenceDefinition} 节点的方式相同
 *
 * @param <D> the type of value
 */
class DefinitionMap<D extends abstract new (...args: any) => any> {
  private readonly type: D;
  // LinkedHashMap for determinism and to preserve document order
  // 用于确定性并保留文档顺序
  private readonly definitions = new Map<string, InstanceType<D>>();

  public constructor(type: D) {
    this.type = type;
  }

  /**
   * 获取类型（限制为 Class）
   *
   * @returns
   */
  public getType(): D {
    return this.type;
  }

  /**
   * 将指定的 definitions map 全部添加至当前 definitions map
   *
   * @param that
   */
  public addAll(that: DefinitionMap<InstanceType<D>>): void {
    for (const entry of that.definitions) {
      // Note that keys are already normalized, so we can add them directly
      // 请注意，键已经标准化，因此我们可以直接添加它们
      if (!this.definitions.has(entry[0])) {
        this.definitions.set(entry[0], entry[1]);
      }
    }
  }

  /**
   * Store a new definition unless one is already in the map. If there is no definition for that label yet, return null.
   * Otherwise, return the existing definition.
   * <p>
   * The label is normalized by the definition map before storing.
   *
   * 存储新的定义，除非地图中已存在该定义
   * 如果该标签还没有定义，则返回 null; 否则，返回现有的定义
   * <p>
   * 标签在存储之前通过定义图进行归一化
   */
  public putIfAbsent(
    label: string,
    definition: InstanceType<D>
  ): InstanceType<D> {
    const normalizedLabel: string = Escaping.normalizeLabelContent(label);

    // spec: When there are multiple matching link reference definitions, the first is used
    // spec：当有多个匹配的链接引用定义时，使用第一个
    if (this.definitions.has(normalizedLabel)) {
      return this.definitions.get(normalizedLabel)!;
    }

    this.definitions.set(normalizedLabel, definition);

    return definition;
  }

  /**
   * Look up a definition by label. The label is normalized by the definition map before lookup.
   *
   * 通过标签查找定义。在查找之前，标签由定义映射标准化
   *
   * @return the value or null
   */
  public get(label: string): InstanceType<D> | undefined {
    const normalizedLabel: string = Escaping.normalizeLabelContent(label);

    return this.definitions.get(normalizedLabel);
  }

  /**
   * 获取 map 的所有键
   *
   * @returns
   */
  public keySet(): string[] {
    return Array.from(this.definitions.keys());
  }

  /**
   * 获取 map 的所有值
   *
   * @returns
   */
  public values(): InstanceType<D>[] {
    return Array.from(this.definitions.values());
  }
}

export default DefinitionMap;
