import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { postToNative, setupBridge } from "./bridge";
import { getSelectionContext, shouldEmitSelectionContext } from "./selectionContext";
import { executeCommand } from "./commandRouter";
import type { FromNative, SelectionContext } from "./types";

const DOC_DEBOUNCE_MS = 300;
let docDebounceTimer: ReturnType<typeof setTimeout> | null = null;

function getDefaultDoc() {
  return {
    type: "doc",
    content: [{ type: "paragraph", content: [] }],
  };
}

function createEditor(container: HTMLElement, initialDoc?: unknown): Editor {
  const doc = initialDoc && typeof initialDoc === "object" && initialDoc !== null ? initialDoc : getDefaultDoc();

  const editor = new Editor({
    element: container,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: false,
      }),
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: false }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: doc as object,
    editorProps: {
      attributes: {
        "data-placeholder": "Write something…",
      },
      handleDOMEvents: {
        keydown(view, event) {
          if (event.key === "/") {
            const { from } = view.state.selection;
            const slice = view.state.doc.slice(Math.max(0, from - 1), from);
            const text = slice.content.textBetween(0, slice.content.size, "", " ");
            if (text === "" || /\s$/.test(text)) {
              event.preventDefault();
              const rect = view.coordsAtPos(from);
              postToNative({
                type: "REQUEST_UI",
                payload: { type: "commandPalette", query: "", anchorRect: rect as unknown as DOMRect },
              });
              return true;
            }
          }
          return false;
        },
      },
    },
  });

  editor.on("update", () => {
    if (docDebounceTimer) clearTimeout(docDebounceTimer);
    docDebounceTimer = setTimeout(() => {
      docDebounceTimer = null;
      postToNative({ type: "DOC_CHANGED", doc: editor.getJSON() });
    }, DOC_DEBOUNCE_MS);
  });

  editor.on("selectionUpdate", () => {
    const context = getSelectionContext(editor.state);
    context.canUndo = editor.can().undo();
    context.canRedo = editor.can().redo();
    shouldEmitSelectionContext(context, (ctx: SelectionContext) => {
      postToNative({ type: "SELECTION_CHANGED", context: ctx });
    });
  });

  return editor;
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") {
    root.style.setProperty("--editor-bg", "#1a1a1a");
    root.style.setProperty("--editor-fg", "#e5e5e5");
    root.style.setProperty("--editor-border", "#333");
    root.style.setProperty("--editor-muted", "#a3a3a3");
    root.style.setProperty("--editor-muted-bg", "#262626");
    root.style.setProperty("--editor-link", "#60a5fa");
  } else {
    root.style.setProperty("--editor-bg", "#fff");
    root.style.setProperty("--editor-fg", "#111");
    root.style.setProperty("--editor-border", "#ccc");
    root.style.setProperty("--editor-muted", "#666");
    root.style.setProperty("--editor-muted-bg", "#f0f0f0");
    root.style.setProperty("--editor-link", "#0066cc");
  }
}

function run(initialDoc?: unknown): Editor {
  const root = document.getElementById("root");
  if (!root) throw new Error("No #root");
  const el = document.createElement("div");
  el.className = "ProseMirror-wrap";
  root.appendChild(el);

  const editor = createEditor(el, initialDoc);

  postToNative({ type: "READY" });
  postToNative({ type: "INIT", doc: editor.getJSON() });
  const ctx = getSelectionContext(editor.state);
  ctx.canUndo = editor.can().undo();
  ctx.canRedo = editor.can().redo();
  postToNative({ type: "SELECTION_CHANGED", context: ctx });

  return editor;
}

let editorInstance: Editor | null = null;
const messageQueue: FromNative[] = [];

function handleFromNative(msg: FromNative): void {
  if (!editorInstance) {
    messageQueue.push(msg);
    return;
  }
  if (msg.type === "INIT") {
    if (msg.doc) editorInstance.commands.setContent(msg.doc as object);
    return;
  }
  if (msg.type === "EXEC") {
    executeCommand(editorInstance, msg.command, msg.payload);
    return;
  }
  if (msg.type === "SET_THEME") {
    applyTheme(msg.theme);
    return;
  }
  if (msg.type === "FOCUS") {
    editorInstance.commands.focus();
    return;
  }
}

setupBridge(handleFromNative);
editorInstance = run();

while (messageQueue.length > 0) {
  const msg = messageQueue.shift();
  if (msg) handleFromNative(msg);
}
