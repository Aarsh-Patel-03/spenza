import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { useGroups } from "../hooks/useGroups";
import CustomTextInput from "../components/common/TextInput";
import Button from "../components/common/Button";

const GroupDetail = () => {
  const { theme } = useTheme();
  const { groups, addExpense } = useGroups();
  const route = useRoute();
  const navigation = useNavigation();
  const { groupId } = route.params;

  const group = groups.find((g) => g.id === groupId);
  const [modalVisible, setModalVisible] = useState(false);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          Group not found
        </Text>
      </View>
    );
  }

  const handleAddExpense = () => {
    if (!expenseAmount.trim()) {
      Alert.alert("Amount required", "Please enter an expense amount.");
      return;
    }

    try {
      addExpense(groupId, {
        title: "Split Expense",
        amount: expenseAmount,
        note: expenseNote || "No note provided",
        paidBy: "You", // In a real app, this would be the current user
      });
      setExpenseAmount("");
      setExpenseNote("");
      setModalVisible(false);
      Alert.alert("Expense added", "The expense has been recorded.");
    } catch (error) {
      Alert.alert("Add expense failed", error.message);
    }
  };

  const totalExpenses = group.expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.groupName, { color: theme.text }]}>
            {group.name}
          </Text>
          <Text style={[styles.groupMeta, { color: theme.textSecondary }]}>
            {group.members.length} members • ₹{totalExpenses} total
          </Text>
        </View>
      </View>

      {/* Chat-like expense list */}
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {group.expenses.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="cash-multiple"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No expenses yet. Add your first split expense!
            </Text>
          </View>
        ) : (
          group.expenses.map((expense) => (
            <View
              key={expense.id}
              style={[
                styles.expenseBubble,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.expenseHeader}>
                <Text style={[styles.expenseTitle, { color: theme.text }]}>
                  {expense.title}
                </Text>
                <Text style={[styles.expenseAmount, { color: theme.primary }]}>
                  ₹{expense.amount}
                </Text>
              </View>
              <Text
                style={[styles.expenseNote, { color: theme.textSecondary }]}
              >
                {expense.note}
              </Text>
              <View style={styles.expenseFooter}>
                <Text
                  style={[styles.expenseBy, { color: theme.textSecondary }]}
                >
                  Paid by {expense.paidBy}
                </Text>
                <Text
                  style={[styles.expenseDate, { color: theme.textSecondary }]}
                >
                  {new Date(expense.date).toLocaleDateString()}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Split Expense Button */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.splitButton, { backgroundColor: theme.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="cash-plus"
            size={20}
            color={theme.surface}
          />
          <Text style={[styles.splitButtonText, { color: theme.surface }]}>
            Split Expense
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Add Split Expense
              </Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <CustomTextInput
              label="Amount"
              placeholder="Enter amount (e.g. 500)"
              value={expenseAmount}
              onChangeText={setExpenseAmount}
              keyboardType="numeric"
            />

            <CustomTextInput
              label="Note (optional)"
              placeholder="What was this for?"
              value={expenseNote}
              onChangeText={setExpenseNote}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Add Expense"
                onPress={handleAddExpense}
                style={{ flex: 1, marginLeft: 8 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerContent: {
    flex: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: "700",
  },
  groupMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 16,
    lineHeight: 22,
  },
  expenseBubble: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  expenseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  expenseTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  expenseNote: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  expenseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expenseBy: {
    fontSize: 12,
  },
  expenseDate: {
    fontSize: 12,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  splitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  splitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeButton: {
    padding: 4,
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});

export default GroupDetail;
