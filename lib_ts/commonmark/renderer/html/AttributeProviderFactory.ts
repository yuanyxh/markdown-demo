
import { java } from "jree";



/**
 * Factory for instantiating new attribute providers when rendering is done.
 */
 interface AttributeProviderFactory {

    /**
     * Create a new attribute provider.
     *
     * @param context for this attribute provider
     * @return an AttributeProvider
     */
      create(context: AttributeProviderContext| null): AttributeProvider;
}
