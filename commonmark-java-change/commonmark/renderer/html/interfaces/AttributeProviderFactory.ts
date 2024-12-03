import type { AttributeProvider } from "./AttributeProvider";
import type { AttributeProviderContext } from "./AttributeProviderContext";

/**
 * Factory for instantiating new attribute providers when rendering is done.
 *
 * 用于在渲染完成时实例化新属性提供程序的工厂
 */
export interface AttributeProviderFactory {
  /**
   * Create a new attribute provider.
   *
   * @param context for this attribute provider
   * @return an AttributeProvider
   */
  create(context: AttributeProviderContext): AttributeProvider;
}
