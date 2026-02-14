/** Bridge message types between WebView (editor) and React Native */

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

export type ToNative =
  | { type: "READY" }
  | { type: "INIT"; doc: unknown }
  | { type: "DOC_CHANGED"; doc: unknown }
  | { type: "SELECTION_CHANGED"; context: SelectionContext }
  | { type: "REQUEST_UI"; payload: { type: string; query?: string; anchorRect?: DOMRect } };

export type FromNative =
  | { type: "INIT"; doc?: unknown }
  | { type: "EXEC"; command: string; payload?: Record<string, unknown> }
  | { type: "SET_THEME"; theme: "light" | "dark" }
  | { type: "FOCUS" };
