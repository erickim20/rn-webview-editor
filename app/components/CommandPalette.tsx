import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

export type CommandItem = {
  id: string;
  label: string;
  command: string;
  payload?: Record<string, unknown>;
};

const COMMANDS: CommandItem[] = [
  { id: "table", label: "Table", command: "insertTable", payload: { rows: 3, cols: 3, withHeaderRow: true } },
  { id: "hr", label: "Divider", command: "insertHorizontalRule" },
  { id: "code", label: "Code block", command: "toggleCodeBlock" },
  { id: "quote", label: "Quote", command: "toggleBlockquote" },
  { id: "h1", label: "Heading 1", command: "toggleHeading", payload: { level: 1 } },
  { id: "h2", label: "Heading 2", command: "toggleHeading", payload: { level: 2 } },
  { id: "h3", label: "Heading 3", command: "toggleHeading", payload: { level: 3 } },
  { id: "bullet", label: "Bullet list", command: "toggleBulletList" },
  { id: "ordered", label: "Numbered list", command: "toggleOrderedList" },
  { id: "p", label: "Paragraph", command: "setParagraph" },
];

type Props = {
  visible: boolean;
  initialQuery?: string;
  onClose: () => void;
  onSelect: (command: string, payload?: Record<string, unknown>) => void;
};

export function CommandPalette({ visible, initialQuery = "", onClose, onSelect }: Props) {
  const [query, setQuery] = useState(initialQuery);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter((c) => c.label.toLowerCase().includes(q));
  }, [query]);

  const handleSelect = useCallback(
    (item: CommandItem) => {
      onSelect(item.command, item.payload);
      onClose();
    },
    [onSelect, onClose]
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center p-6 bg-overlay"
      >
        <TouchableOpacity className="absolute inset-0" onPress={onClose} activeOpacity={1} />
        <View className="bg-background rounded-xl max-h-[360px] overflow-hidden">
          <TextInput
            className="px-4 py-3 text-base text-foreground border-b border-border"
            placeholder="Search commands…"
            placeholderTextColor="#999"
            value={query}
            onChangeText={setQuery}
            autoFocus
            autoCapitalize="none"
            autoCorrect={false}
          />
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                className="px-4 py-3"
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text className="text-base text-foreground">{item.label}</Text>
              </TouchableOpacity>
            )}
            className="max-h-[280px]"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
