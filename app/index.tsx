import * as Clipboard from "expo-clipboard";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Keyboard, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import "../global.css";
import { CommandPalette } from "./components/CommandPalette";
import { EditorToolbar } from "./components/EditorToolbar";
import { FontSettingsSheet } from "./components/FontSettingsSheet";
import { editorHtml } from "./editorHtml";
import type { SelectionContext } from "./types";

type ToWeb =
  | { type: "INIT"; doc?: unknown }
  | { type: "EXEC"; command: string; payload?: Record<string, unknown> }
  | { type: "SET_THEME"; theme: "light" | "dark" }
  | { type: "FOCUS" };

export default function Index() {
  const webRef = useRef<WebView>(null);
  const [ready, setReady] = useState(false);
  const [selectionContext, setSelectionContext] = useState<SelectionContext | null>(null);
  const [paletteVisible, setPaletteVisible] = useState(false);
  const [fontSheetVisible, setFontSheetVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const queueRef = useRef<ToWeb[]>([]);

  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });
    const hide = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const post = useCallback((msg: ToWeb) => {
    const payload = JSON.stringify(msg);
    const script = `(function(){try{var w=window;if(w.postMessage)w.postMessage(${JSON.stringify(payload)},'*');}catch(e){}})();`;
    webRef.current?.injectJavaScript(script);
  }, []);

  const flushQueue = useCallback(() => {
    queueRef.current.forEach((msg) => post(msg));
    queueRef.current = [];
  }, [post]);

  const send = useCallback(
    (msg: ToWeb) => {
      if (!ready) {
        queueRef.current.push(msg);
        return;
      }
      post(msg);
    },
    [ready, post]
  );

  const handleMessage = useCallback(
    (event: { nativeEvent: { data: string } }) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === "READY") {
          setReady(true);
          flushQueue();
          return;
        }
        if (data.type === "DOC_CHANGED") {
          // Persist or sync doc: data.doc
          return;
        }
        if (data.type === "SELECTION_CHANGED") {
          setSelectionContext(data.context ?? null);
          return;
        }
        if (data.type === "REQUEST_UI" && data.payload?.type === "commandPalette") {
          setPaletteVisible(true);
          return;
        }
      } catch {
        // ignore
      }
    },
    [flushQueue]
  );

  const handleExec = useCallback(
    (command: string, payload?: Record<string, unknown>) => {
      send({ type: "EXEC", command, payload });
      setPaletteVisible(false);
    },
    [send]
  );

  const handleKeyboardToggle = useCallback(() => {
    if (keyboardHeight > 0) {
      webRef.current?.injectJavaScript(
        "(function(){try{var e=document.activeElement;if(e&&e.blur)e.blur();}catch(err){}})();true;"
      );
      Keyboard.dismiss();
    } else {
      send({ type: "FOCUS" });
    }
  }, [keyboardHeight, send]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await Clipboard.getStringAsync();
      if (text) send({ type: "EXEC", command: "insertText", payload: { text } });
    } catch {
      // ignore
    }
  }, [send]);

  const handleOpenFontSettings = useCallback(() => {
    setFontSheetVisible(true);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom"]}>
      <View className="flex-1 min-h-0 border">
        <WebView
          ref={webRef}
          source={{ html: editorHtml }}
          className="flex-1"
          scrollEnabled
          keyboardDisplayRequiresUserAction={false}
          hideKeyboardAccessoryView
          onMessage={handleMessage}
          originWhitelist={["*"]}
          allowFileAccess
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
      <View className="absolute left-0 right-0" style={{ bottom: keyboardHeight }}>
        <EditorToolbar
          context={selectionContext}
          onExec={handleExec}
          onOpenPalette={() => setPaletteVisible(true)}
          onHideKeyboard={handleKeyboardToggle}
          onPaste={handlePaste}
          onOpenFontSettings={handleOpenFontSettings}
        />
      </View>
      <CommandPalette visible={paletteVisible} onClose={() => setPaletteVisible(false)} onSelect={handleExec} />
      <FontSettingsSheet
        visible={fontSheetVisible}
        context={selectionContext}
        onClose={() => setFontSheetVisible(false)}
        onExec={handleExec}
      />
    </SafeAreaView>
  );
}
