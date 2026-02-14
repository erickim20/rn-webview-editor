import React from "react";
import { View, Text, Modal, TouchableOpacity, ScrollView } from "react-native";
import type { SelectionContext } from "../types";

type Props = {
  visible: boolean;
  context: SelectionContext | null;
  onClose: () => void;
  onExec: (command: string, payload?: Record<string, unknown>) => void;
};

export function FontSettingsSheet({ visible, context, onClose, onExec }: Props) {
  const m = context?.activeMarks;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="absolute left-0 right-0 bottom-0 bg-background rounded-t-xl pb-6 px-3">
        <View className="flex-row items-center justify-center mb-2 relative">
          <View className="w-9 h-1 rounded-full bg-border" />
          <TouchableOpacity
            onPress={onClose}
            className="absolute right-0 py-2 px-1"
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text className="text-base font-semibold text-accent">Done</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Text style</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2 py-1">
            <ToolButton label="Bold" active={m?.bold} onPress={() => onExec("toggleBold")} />
            <ToolButton label="Italic" active={m?.italic} onPress={() => onExec("toggleItalic")} />
            <ToolButton label="Underline" active={m?.underline} onPress={() => onExec("toggleUnderline")} />
            <ToolButton label="Strike" active={m?.strike} onPress={() => onExec("toggleStrike")} />
            <ToolButton label="Code" active={m?.code} onPress={() => onExec("toggleCode")} />
          </View>
        </ScrollView>
        <Text className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Block</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          <View className="flex-row gap-2 py-1">
            <ToolButton label="Paragraph" onPress={() => onExec("setParagraph")} />
            <ToolButton label="H1" onPress={() => onExec("toggleHeading", { level: 1 })} />
            <ToolButton label="H2" onPress={() => onExec("toggleHeading", { level: 2 })} />
            <ToolButton label="H3" onPress={() => onExec("toggleHeading", { level: 3 })} />
            <ToolButton label="Quote" onPress={() => onExec("toggleBlockquote")} />
            <ToolButton label="Code block" onPress={() => onExec("toggleCodeBlock")} />
            <ToolButton label="Bullets" onPress={() => onExec("toggleBulletList")} />
            <ToolButton label="Numbers" onPress={() => onExec("toggleOrderedList")} />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function ToolButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-3.5 py-2.5 rounded-lg ${active ? "bg-border" : "bg-muted"}`}
      activeOpacity={0.7}
    >
      <Text className={`text-sm text-foreground ${active ? "font-bold" : "font-medium"}`}>{label}</Text>
    </TouchableOpacity>
  );
}
