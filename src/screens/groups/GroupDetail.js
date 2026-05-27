import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useGroups } from "../../hooks/useGroups";
import CustomTextInput from "../../components/common/TextInput";
import Button from "../../components/common/Button";
import MemberPicker from "../../components/groups/MemberPicker";

const getExpenseTime = (expense) => {
  const rawDate = expense.createdAt || expense.date;
  const parsedDate = new Date(rawDate);
  const timestamp = parsedDate.getTime();

  return Number.isFinite(timestamp) ? timestamp : 0;
};

const GroupDetail = ({ navigation }) => {
  const route = useRoute();
  const { groupId } = route.params;
  const { theme } = useTheme();
  const { user } = useAuth();
  const { groups, addExpense, addMemberToGroup, removeMemberFromGroup } =
    useGroups();

  const group = groups.find((g) => g.id === groupId);
  const chatScrollRef = useRef(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [showMemberManager, setShowMemberManager] = useState(false);
  const [membersToAdd, setMembersToAdd] = useState([]);
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNote, setExpenseNote] = useState("");
  const [splitType, setSplitType] = useState("equal");
  const [splitValues, setSplitValues] = useState({});

  const orderedExpenses = useMemo(
    () =>
      [...(group?.expenses || [])].sort(
        (a, b) => getExpenseTime(a) - getExpenseTime(b),
      ),
    [group?.expenses],
  );

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          Group not found
        </Text>
      </View>
    );
  }

  const handleAddExpense = async () => {
    if (!expenseAmount.trim()) {
      Alert.alert("Required", "Please enter an amount");
      return;
    }

    try {
      await addExpense(groupId, {
        title: "Split Expense",
        amount: parseFloat(expenseAmount),
        note: expenseNote || "No note",
        paidByUserId: user?.id || group.members[0]?.id,
        participants: group.members.map((member) => member.id),
        splitType,
        splitValues,
      });
      setExpenseAmount("");
      setExpenseNote("");
      setSplitType("equal");
      setSplitValues({});
      setModalVisible(false);
      Alert.alert("Success", "Expense added!");
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const totalExpenses = group.expenses.reduce(
    (sum, exp) => sum + exp.amount,
    0,
  );

  const handleAddMembers = async () => {
    if (membersToAdd.length === 0) {
      Alert.alert("No members selected", "Search and select a verified user.");
      return;
    }

    await Promise.all(
      membersToAdd.map((member) => addMemberToGroup(groupId, member)),
    );
    setMembersToAdd([]);
    Alert.alert("Members added", "Selected users were added to the group.");
  };

  const handleRemoveMember = (member) => {
    Alert.alert("Remove member", `Remove ${member.name} from ${group.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => removeMemberFromGroup(groupId, member.id),
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Group Header */}
      <View
        style={[
          styles.groupHeader,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.backButton,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Go back"
          activeOpacity={0.75}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>
        <View style={styles.groupHeaderText}>
          <Text style={[styles.groupName, { color: theme.text }]}>
            {group.name}
          </Text>
          <Text style={[styles.groupMeta, { color: theme.textSecondary }]}>
            {group.members.length} members • ₹{totalExpenses}
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.manageButton, { borderColor: theme.border }]}
          onPress={() => setShowMemberManager(!showMemberManager)}
        >
          <MaterialCommunityIcons
            name={showMemberManager ? "account-minus" : "account-plus"}
            size={20}
            color={theme.primary}
          />
        </TouchableOpacity>
      </View>

      {showMemberManager && (
        <View
          style={[
            styles.memberPanel,
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}
        >
          <Text style={[styles.memberPanelTitle, { color: theme.text }]}>
            Members
          </Text>
          {group.members.map((member) => (
            <View
              key={member.id}
              style={[
                styles.memberRow,
                {
                  backgroundColor: theme.background,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.memberInfo}>
                <Text style={[styles.memberName, { color: theme.text }]}>
                  {member.name}
                </Text>
                <Text
                  style={[styles.memberMeta, { color: theme.textSecondary }]}
                >
                  {member.mobile} · {member.upiId}
                </Text>
              </View>
              <TouchableOpacity onPress={() => handleRemoveMember(member)}>
                <MaterialCommunityIcons
                  name="trash-can-outline"
                  size={20}
                  color={theme.danger}
                />
              </TouchableOpacity>
            </View>
          ))}

          <MemberPicker
            title="Add verified users"
            selectedMembers={membersToAdd}
            onChangeSelectedMembers={setMembersToAdd}
            excludedMemberIds={group.members.map((member) => member.id)}
          />
          <Button title="Add selected members" onPress={handleAddMembers} />
        </View>
      )}

      {/* Chat-like Expenses List */}
      <ScrollView
        ref={chatScrollRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() =>
          chatScrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {orderedExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="inbox"
              size={48}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No expenses yet
            </Text>
          </View>
        ) : (
          orderedExpenses.map((expense) => {
            const isOwnExpense =
              expense.paidByUserId === user?.id || expense.paidBy === "You";

            return (
              <View
                key={expense.id}
                style={[
                  styles.messageRow,
                  isOwnExpense ? styles.ownMessageRow : styles.otherMessageRow,
                ]}
              >
                <TouchableOpacity
                  style={[
                    styles.expenseBubble,
                    isOwnExpense ? styles.ownBubble : styles.otherBubble,
                    {
                      backgroundColor: isOwnExpense
                        ? theme.primary
                        : theme.surface,
                      borderColor: isOwnExpense ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() =>
                    navigation.navigate("ExpenseDetail", {
                      expenseId: expense.id,
                      groupId,
                    })
                  }
                  activeOpacity={0.78}
                >
                  <Text
                    style={[
                      styles.senderName,
                      {
                        color: isOwnExpense
                          ? theme.surface
                          : theme.textSecondary,
                      },
                    ]}
                  >
                    {isOwnExpense ? "You" : expense.paidBy}
                  </Text>
                  <Text
                    style={[
                      styles.amount,
                      { color: isOwnExpense ? theme.surface : theme.primary },
                    ]}
                  >
                    ₹{expense.amount}
                  </Text>
                  <Text
                    style={[
                      styles.note,
                      {
                        color: isOwnExpense
                          ? theme.surface
                          : theme.textSecondary,
                      },
                    ]}
                  >
                    {expense.note}
                  </Text>
                  <Text
                    style={[
                      styles.date,
                      {
                        color: isOwnExpense
                          ? theme.surface
                          : theme.textSecondary,
                      },
                    ]}
                  >
                {new Date(expense.createdAt || expense.date).toLocaleString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Split Expense Button */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.splitButton, { backgroundColor: theme.primary }]}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="cash-plus" size={20} color="#fff" />
          <Text style={styles.splitButtonText}>Split Expense</Text>
        </TouchableOpacity>
      </View>

      {/* Split Expense Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View
            style={[styles.modalContent, { backgroundColor: theme.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Add Expense
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons
                  name="close"
                  size={24}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
            >
              <CustomTextInput
                label="Amount"
                placeholder="Enter amount"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                keyboardType="numeric"
              />

              <CustomTextInput
                label="Note"
                placeholder="What's this for?"
                value={expenseNote}
                onChangeText={setExpenseNote}
                multiline
                numberOfLines={3}
              />

              <Text style={[styles.inputLabel, { color: theme.text }]}>
                Split type
              </Text>
              <View style={styles.splitTabs}>
                {["equal", "exact", "percentage"].map((type) => {
                  const isActive = splitType === type;
                  return (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.splitTab,
                        {
                          backgroundColor: isActive
                            ? theme.primary
                            : theme.background,
                          borderColor: isActive ? theme.primary : theme.border,
                        },
                      ]}
                      onPress={() => {
                        setSplitType(type);
                        setSplitValues({});
                      }}
                    >
                      <Text
                        style={[
                          styles.splitTabText,
                          { color: isActive ? theme.surface : theme.text },
                        ]}
                      >
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {splitType !== "equal" &&
                group.members.map((member) => (
                  <CustomTextInput
                    key={member.id}
                    label={`${member.name} ${splitType === "percentage" ? "%" : "amount"}`}
                    placeholder={splitType === "percentage" ? "0" : "0.00"}
                    value={splitValues[member.id]?.toString() || ""}
                    onChangeText={(value) =>
                      setSplitValues({
                        ...splitValues,
                        [member.id]: value.replace(/[^0-9.]/g, ""),
                      })
                    }
                    keyboardType="numeric"
                  />
                ))}
            </ScrollView>

            <View style={styles.modalButtons}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: 8 }}
              />
              <Button
                title="Add"
                onPress={handleAddExpense}
                style={{ flex: 1, marginLeft: 8 }}
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
  groupHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
  },
  groupHeaderText: {
    flex: 1,
    marginRight: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  manageButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  groupName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  groupMeta: {
    fontSize: 12,
  },
  memberPanel: {
    borderBottomWidth: 1,
    padding: 16,
  },
  memberPanelTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  memberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  memberInfo: {
    flex: 1,
    marginRight: 12,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "700",
  },
  memberMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 12,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  ownMessageRow: {
    justifyContent: "flex-end",
  },
  otherMessageRow: {
    justifyContent: "flex-start",
  },
  expenseBubble: {
    maxWidth: "82%",
    minWidth: 190,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  ownBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    alignSelf: "flex-start",
    fontSize: 16,
    fontWeight: "700",
    opacity: 0.9,
  },
  amount: {
    alignSelf: "flex-end",
    fontSize: 22,
    fontWeight: "800",
  },
  note: {
    fontSize: 12,
    lineHeight: 17,
    opacity: 0.92,
  },
  date: {
    alignSelf: "flex-end",
    fontSize: 10,
    opacity: 0.82,
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
    borderRadius: 12,
    gap: 8,
  },
  splitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    maxHeight: "82%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  splitTabs: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  splitTab: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
  },
  splitTabText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  modalButtons: {
    flexDirection: "row",
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});

export default GroupDetail;
