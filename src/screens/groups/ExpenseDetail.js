import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "../../hooks/useTheme";
import { useGroups } from "../../hooks/useGroups";
import Button from "../../components/common/Button";
import CustomTextInput from "../../components/common/TextInput";

const ExpenseDetail = ({ navigation }) => {
  const route = useRoute();
  const { expenseId, groupId } = route.params;
  const { theme } = useTheme();
  const { groups, deleteExpense, updateExpense } = useGroups();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editAmount, setEditAmount] = useState("");
  const [editNote, setEditNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const group = groups.find((g) => g.id === groupId);
  const expense = group?.expenses.find((e) => e.id === expenseId);

  useEffect(() => {
    if (expense) {
      setEditAmount(String(expense.amount || ""));
      setEditNote(expense.note || "");
    }
  }, [expense]);

  if (!expense) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          Expense not found
        </Text>
      </View>
    );
  }

  const expenseDate = new Date(expense.createdAt || expense.date);

  const handleDelete = () => {
    Alert.alert(
      "Delete expense",
      "This will remove the expense from the group.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExpense(groupId, expenseId);
              navigation.goBack();
            } catch (error) {
              Alert.alert("Delete failed", error.message);
            }
          },
        },
      ],
    );
  };

  const handleSaveEdit = async () => {
    const nextAmount = Number(editAmount);

    if (!Number.isFinite(nextAmount) || nextAmount <= 0) {
      Alert.alert("Invalid amount", "Enter a valid positive amount.");
      return;
    }

    try {
      setIsSaving(true);
      await updateExpense(groupId, expenseId, {
        amount: nextAmount,
        note: editNote,
      });
      setIsEditModalVisible(false);
      Alert.alert("Expense updated", "Your changes have been saved.");
    } catch (error) {
      Alert.alert("Update failed", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentInner}
      >
        {/* Amount Card */}
        <View
          style={[styles.amountCard, { backgroundColor: theme.primaryLight }]}
        >
          <Text style={[styles.amountLabel, { color: theme.primary }]}>
            Amount
          </Text>
          <Text style={[styles.amountValue, { color: theme.primary }]}>
            ₹{expense.amount}
          </Text>
        </View>

        {/* Details */}
        <View
          style={[
            styles.detailSection,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <MaterialCommunityIcons
                name="account"
                size={20}
                color={theme.primary}
              />
              <View style={styles.detailText}>
                <Text
                  style={[styles.detailLabel, { color: theme.textSecondary }]}
                >
                  Paid by
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {expense.paidBy}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <MaterialCommunityIcons
                name="calendar"
                size={20}
                color={theme.primary}
              />
              <View style={styles.detailText}>
                <Text
                  style={[styles.detailLabel, { color: theme.textSecondary }]}
                >
                  Date
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {expenseDate.toLocaleString("en-IN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.detailRow}>
            <View style={styles.detailLeft}>
              <MaterialCommunityIcons
                name="text"
                size={20}
                color={theme.primary}
              />
              <View style={styles.detailText}>
                <Text
                  style={[styles.detailLabel, { color: theme.textSecondary }]}
                >
                  Note
                </Text>
                <Text style={[styles.detailValue, { color: theme.text }]}>
                  {expense.note}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Group Info */}
        <View
          style={[
            styles.groupSection,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <View style={styles.groupRow}>
            <MaterialCommunityIcons
              name="account-group"
              size={20}
              color={theme.primary}
            />
            <View style={styles.groupText}>
              <Text style={[styles.groupLabel, { color: theme.textSecondary }]}>
                Group
              </Text>
              <Text style={[styles.groupName, { color: theme.text }]}>
                {group?.name}
              </Text>
            </View>
          </View>
          <Text style={[styles.memberCount, { color: theme.textSecondary }]}>
            {group?.members.length} members
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.danger + "20",
                borderColor: theme.danger,
              },
            ]}
            onPress={handleDelete}
          >
            <MaterialCommunityIcons
              name="trash-can-outline"
              size={20}
              color={theme.danger}
            />
            <Text style={[styles.actionText, { color: theme.danger }]}>
              Delete
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: theme.primary + "20",
                borderColor: theme.primary,
              },
            ]}
            onPress={() => setIsEditModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="pencil-outline"
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.actionText, { color: theme.primary }]}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View
            style={[styles.modalSheet, { backgroundColor: theme.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Edit expense
              </Text>
              <TouchableOpacity
                onPress={() => setIsEditModalVisible(false)}
                accessibilityLabel="Close edit expense"
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
            >
              <CustomTextInput
                label="Amount"
                placeholder="Enter amount"
                value={editAmount}
                onChangeText={(value) =>
                  setEditAmount(value.replace(/[^0-9.]/g, ""))
                }
                keyboardType="numeric"
              />
              <CustomTextInput
                label="Note"
                placeholder="What's this for?"
                value={editNote}
                onChangeText={setEditNote}
                multiline
                numberOfLines={3}
              />
            </ScrollView>

            <View style={[styles.modalActions, { borderTopColor: theme.border }]}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setIsEditModalVisible(false)}
                disabled={isSaving}
                style={styles.modalButton}
              />
              <Button
                title="Save"
                onPress={handleSaveEdit}
                loading={isSaving}
                disabled={isSaving}
                style={styles.modalButton}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentInner: {
    padding: 16,
  },
  amountCard: {
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: "bold",
  },
  detailSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  detailLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    gap: 12,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
  },
  groupSection: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  groupRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  groupText: {
    flex: 1,
  },
  groupLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  groupName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  memberCount: {
    fontSize: 12,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.45)",
  },
  modalSheet: {
    maxHeight: "82%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    padding: 16,
  },
  modalButton: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});

export default ExpenseDetail;
