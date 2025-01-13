import TextPlugin from './text-plugin';
import HtmlBlockPlugin from './html-block-plugin';
import HrPlugin from './hr-plugin';
import CodePlugin from './code-plugin';
import FallbackPlugin from './fallback-plugin';
import EmphasisPlugin from './emphasis-plugin';

export const defaultPlugins = [
  TextPlugin,
  EmphasisPlugin,
  HtmlBlockPlugin,
  HrPlugin,
  CodePlugin,
  FallbackPlugin
];
