import ContentView from './contentview';

abstract class InlineView extends ContentView {
  abstract children: InlineView[];
}

export default InlineView;
