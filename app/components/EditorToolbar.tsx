import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import type { SelectionContext } from "../types";

type Props = {
  context: SelectionContext | null;
  onExec: (command: string, payload?: Record<string, unknown>) => void;
  onOpenPalette: () => void;
  onHideKeyboard: () => void;
  onPaste: () => void;
  onOpenFontSettings: () => void;
};

export function EditorToolbar({
  context,
  onExec,
  onOpenPalette,
  onHideKeyboard,
  onPaste,
  onOpenFontSettings,
}: Props) {
  return (
    <View className="flex-row items-center gap-1 px-2 py-1.5 bg-muted border-t border-border">
      <ToolButton label="↶" disabled={!context?.canUndo} onPress={() => onExec("undo")} />
      <ToolButton label="↷" disabled={!context?.canRedo} onPress={() => onExec("redo")} />
      <View className="w-px h-5 bg-border mx-1" />
      <ToolButton label="+" onPress={onOpenPalette} />
      <ToolButton label="Aa" onPress={onOpenFontSettings} />
      <ToolButton label="Paste" onPress={onPaste} />
      <ToolButton label="⌨" onPress={onHideKeyboard} />
    </View>
  );
}

function ToolButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`px-2.5 py-2 rounded-md ${disabled ? "opacity-40" : ""}`}
      activeOpacity={0.7}
    >
      <Text className={`text-sm font-medium text-foreground ${disabled ? "text-muted-foreground" : ""}`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
