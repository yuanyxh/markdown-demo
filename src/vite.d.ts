/// <reference types="vite/client" />

declare type InputType =
  | 'insertText'
  | 'insertReplacementText'
  | 'insertLineBreak'
  | 'insertParagraph'
  | 'insertOrderedList'
  | 'insertUnorderedList'
  | 'insertFromYank'
  | 'insertFromDrop'
  | 'insertFromPaste'
  | 'insertTranspose'
  | 'insertCompositionText'
  | 'insertLink'
  | 'deleteWordBackward'
  | 'deleteWordForward'
  | 'deleteSoftLineBackward'
  | 'deleteSoftLineForward'
  | 'deleteEntireSoftLine'
  | 'deleteHardLineBackward'
  | 'deleteHardLineForward'
  | 'deleteByDrag'
  | 'deleteByCut'
  | 'deleteContent'
  | 'deleteContentBackward'
  | 'deleteContentForward'
  | 'historyUndo'
  | 'historyRedo'
  | 'formatBold'
  | 'formatItalic'
  | 'formatUnderline'
  | 'formatStrikeThrough'
  | 'formatSuperscript'
  | 'formatSubscript'
  | 'formatJustifyFull'
  | 'formatJustifyCenter'
  | 'formatJustifyRight'
  | 'formatJustifyLeft'
  | 'formatIndent'
  | 'formatOutdent'
  | 'formatRemove'
  | 'formatSetBlockTextDirection'
  | 'formatSetInlineTextDirection'
  | 'formatBackColor'
  | 'formatFontColor'
  | 'formatFontName'
  | 'insertHorizontalRule'
  | 'insertFromPasteAsQuotation';

declare type HandleEventType = 'viewselectionchange' | InputType;

declare interface ViewEventDetails {
  type: HandleEventType;
  range: StaticRange;
}

declare interface HTMLElementEventMap {
  modify: CustomEvent<ViewEventDetails>;
  viewselectionchange: CustomEvent<ViewEventDetails>;
}
