import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../common/Button";
import CustomTextInput from "../common/TextInput";
import { useTheme } from "../../hooks/useTheme";
import MemberPicker from "./MemberPicker";

const CreateGroupModal = ({ visible, onClose, onCreateGroup }) => {
  const { theme } = useTheme();
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [isCreating, setIsCreating] = useState(false);

  const resetForm = () => {
    setGroupName("");
    setGroupDescription("");
    setSelectedMembers([]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      Alert.alert("Group name required", "Please enter a group name.");
      return;
    }

    try {
      setIsCreating(true);
      await onCreateGroup(groupName, groupDescription, selectedMembers);
      resetForm();
      onClose();
      Alert.alert("Group created", "Your new group is ready to use.");
    } catch (error) {
      Alert.alert("Create group failed", error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.text }]}>
                Create group
              </Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Add verified members and start splitting expenses.
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.closeButton,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}
              onPress={handleClose}
              accessibilityLabel="Close create group"
              activeOpacity={0.75}
            >
              <MaterialCommunityIcons
                name="close"
                size={22}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          >
            <CustomTextInput
              label="Group name"
              placeholder="e.g., Goa Trip"
              value={groupName}
              onChangeText={setGroupName}
            />
            <CustomTextInput
              label="Description"
              placeholder="What's this group for?"
              value={groupDescription}
              onChangeText={setGroupDescription}
            />
            <MemberPicker
              selectedMembers={selectedMembers}
              onChangeSelectedMembers={setSelectedMembers}
            />
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Button
              title="Cancel"
              variant="secondary"
              onPress={handleClose}
              disabled={isCreating}
              style={styles.footerButton}
            />
            <Button
              title="Create"
              onPress={handleCreate}
              loading={isCreating}
              disabled={isCreating}
              style={styles.footerButton}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  sheet: {
    maxHeight: "88%",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  footer: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    padding: 16,
  },
  footerButton: {
    flex: 1,
  },
});

export default CreateGroupModal;
