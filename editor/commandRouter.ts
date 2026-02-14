import type { Editor } from "@tiptap/core";

export type CommandPayload = Record<string, unknown>;

export function executeCommand(editor: Editor, command: string, payload?: CommandPayload): boolean {
  const c = payload ?? {};

  switch (command) {
    case "toggleBold":
      return editor.chain().focus().toggleBold().run();
    case "toggleItalic":
      return editor.chain().focus().toggleItalic().run();
    case "toggleUnderline":
      return editor.chain().focus().toggleUnderline().run();
    case "toggleStrike":
      return editor.chain().focus().toggleStrike().run();
    case "toggleCode":
      return editor.chain().focus().toggleCode().run();
    case "setLink": {
      const href = (c.href as string) ?? "";
      return href ? editor.chain().focus().setLink({ href }).run() : false;
    }
    case "unsetLink":
      return editor.chain().focus().unsetLink().run();

    case "setParagraph":
      return editor.chain().focus().setParagraph().run();
    case "toggleHeading": {
      const level = Math.min(3, Math.max(1, (c.level as number) ?? 1));
      return editor.chain().focus().toggleHeading({ level }).run();
    }
    case "toggleBulletList":
      return editor.chain().focus().toggleBulletList().run();
    case "toggleOrderedList":
      return editor.chain().focus().toggleOrderedList().run();
    case "toggleBlockquote":
      return editor.chain().focus().toggleBlockquote().run();
    case "toggleCodeBlock":
      return editor.chain().focus().toggleCodeBlock().run();

    case "insertTable":
      return editor
        .chain()
        .focus()
        .insertTable({ rows: (c.rows as number) ?? 3, cols: (c.cols as number) ?? 3, withHeaderRow: (c.withHeaderRow as boolean) ?? true })
        .run();
    case "insertHorizontalRule":
      return editor.chain().focus().setHorizontalRule().run();
    case "insertImage":
      return editor.chain().focus().setImage({ src: (c.src as string) ?? "" }).run();
    case "insertText":
      return editor.chain().focus().insertContent((c.text as string) ?? "").run();

    case "undo":
      return editor.chain().focus().undo().run();
    case "redo":
      return editor.chain().focus().redo().run();

    case "addRowAfter":
      return editor.chain().focus().addRowAfter().run();
    case "addRowBefore":
      return editor.chain().focus().addRowBefore().run();
    case "addColumnAfter":
      return editor.chain().focus().addColumnAfter().run();
    case "addColumnBefore":
      return editor.chain().focus().addColumnBefore().run();
    case "deleteRow":
      return editor.chain().focus().deleteRow().run();
    case "deleteColumn":
      return editor.chain().focus().deleteColumn().run();
    case "deleteTable":
      return editor.chain().focus().deleteTable().run();
    case "mergeCells":
      return editor.chain().focus().mergeCells().run();
    case "splitCell":
      return editor.chain().focus().splitCell().run();
    case "toggleHeaderRow":
      return editor.chain().focus().toggleHeaderRow().run();
    case "toggleHeaderColumn":
      return editor.chain().focus().toggleHeaderColumn().run();

    default:
      return false;
  }
}
