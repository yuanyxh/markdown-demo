import ContentView from './contentview';

abstract class InlineView extends ContentView {
  public abstract children: InlineView[];
}

export default InlineView;
