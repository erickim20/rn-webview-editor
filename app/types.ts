/** Selection context from WebView editor (must match editor/types.ts) */
export type SelectionContext = {
  empty: boolean;
  from: number;
  to: number;
  activeMarks: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strike: boolean;
    code: boolean;
    linkHref?: string;
  };
  parent: {
    nodeType: string;
    attrs?: Record<string, unknown>;
  };
  inTable: boolean;
  inList: boolean;
  canUndo: boolean;
  canRedo: boolean;
};
