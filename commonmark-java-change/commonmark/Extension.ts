/**
 * Base interface for a parser/renderer extension.
 * <p>
 * Doesn't have any methods itself, but has specific sub interfaces to
 * configure parser/renderer. This base interface is for convenience, so that a list of extensions can be built and then
 * used for configuring both the parser and renderer in the same way.
 */

/**
 * Parser/Renderer 扩展的基本接口。
 * <p>
 * 本身没有任何方法，但有特定的子接口
 * 配置 Parser/Renderer；这个基本接口是为了方便起见，以便可以构建扩展列表，然后
 * 用于以相同的方式配置解析器和渲染器
 */
export interface Extension {}
