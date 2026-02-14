import type { EditorState } from "@tiptap/pm/state";
import type { SelectionContext } from "./types";

const THROTTLE_MS = 100;

let lastSent: SelectionContext | null = null;
let lastSentTime = 0;

function shallowEqual(a: SelectionContext, b: SelectionContext): boolean {
  if (a.empty !== b.empty || a.from !== b.from || a.to !== b.to) return false;
  const am = a.activeMarks;
  const bm = b.activeMarks;
  if (
    am.bold !== bm.bold ||
    am.italic !== bm.italic ||
    am.underline !== bm.underline ||
    am.strike !== bm.strike ||
    am.code !== bm.code ||
    am.linkHref !== bm.linkHref
  )
    return false;
  if (a.parent.nodeType !== b.parent.nodeType) return false;
  if (a.inTable !== b.inTable || a.inList !== b.inList) return false;
  if (a.canUndo !== b.canUndo || a.canRedo !== b.canRedo) return false;
  return true;
}

export function getSelectionContext(state: EditorState): SelectionContext {
  const { selection, doc } = state;
  const { from, to, empty } = selection;
  const $from = selection.$from;
  const parent = $from.parent;
  const parentType = parent.type.name;

  let inTable = false;
  let inList = false;
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    const name = node.type.name;
    if (name === "table" || name === "tableRow" || name === "tableCell" || name === "tableHeader") inTable = true;
    if (name === "bulletList" || name === "orderedList" || name === "listItem") inList = true;
  }

  const activeMarks = {
    bold: state.doc.rangeHasMark(from, to, state.schema.marks.bold),
    italic: state.doc.rangeHasMark(from, to, state.schema.marks.italic),
    underline: state.doc.rangeHasMark(from, to, state.schema.marks.underline),
    strike: state.doc.rangeHasMark(from, to, state.schema.marks.strike),
    code: state.doc.rangeHasMark(from, to, state.schema.marks.code),
    linkHref: (() => {
      const linkMark = state.schema.marks.link;
      if (!linkMark || !state.doc.rangeHasMark(from, to, linkMark)) return undefined;
      const mark = $from.marks().find((m) => m.type === linkMark);
      return (mark?.attrs as { href?: string })?.href ?? undefined;
    })(),
  };

  const parentAttrs: Record<string, unknown> = {};
  if (parentType === "heading" && parent.attrs.level) parentAttrs.level = parent.attrs.level;

  return {
    empty,
    from,
    to,
    activeMarks,
    parent: { nodeType: parentType, attrs: Object.keys(parentAttrs).length ? parentAttrs : undefined },
    inTable,
    inList,
    canUndo: false,
    canRedo: false,
  };
}

export function shouldEmitSelectionContext(
  context: SelectionContext,
  send: (context: SelectionContext) => void
): void {
  const now = Date.now();
  if (lastSent && shallowEqual(lastSent, context)) {
    if (now - lastSentTime < THROTTLE_MS) return;
  }
  lastSentTime = now;
  lastSent = context;
  send(context);
}
