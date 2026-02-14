import type { ToNative, FromNative } from "./types";

const isReactNative = (): boolean => {
  try {
    return typeof (window as unknown as { ReactNativeWebView?: unknown }).ReactNativeWebView !== "undefined";
  } catch {
    return false;
  }
};

export function postToNative(message: ToNative): void {
  if (!isReactNative()) return;
  const payload = JSON.stringify(message);
  (window as unknown as { ReactNativeWebView?: { postMessage: (s: string) => void } }).ReactNativeWebView?.postMessage(
    payload
  );
}

export function setupBridge(
  onMessage: (msg: FromNative) => void
): void {
  if (!isReactNative()) return;
  const w = window as unknown as { ReactNativeWebView?: { postMessage: (s: string) => void }; document: Document };
  const handler = (event: MessageEvent) => {
    try {
      const data = typeof event.data === "string" ? event.data : null;
      if (!data) return;
      const parsed = JSON.parse(data) as FromNative;
      if (parsed && typeof parsed.type === "string") onMessage(parsed);
    } catch {
      // ignore
    }
  };
  window.addEventListener("message", handler);
}
