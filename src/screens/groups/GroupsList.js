import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { useGroups } from "../../hooks/useGroups";
import CreateGroupModal from "../../components/groups/CreateGroupModal";

const GroupsList = ({ navigation }) => {
  const { theme } = useTheme();
  const { groups, addGroup, analytics } = useGroups();

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const renderGroupCard = ({ item }) => {
    const totalExpense = item.expenses.reduce(
      (sum, exp) => sum + exp.amount,
      0,
    );

    return (
      <TouchableOpacity
        style={[
          styles.groupCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
        onPress={() => navigation.navigate("GroupDetail", { groupId: item.id })}
      >
        <View style={styles.groupHeader}>
          <View style={styles.groupInfo}>
            <Text style={[styles.groupName, { color: theme.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.groupDesc, { color: theme.textSecondary }]}>
              {item.description}
            </Text>
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={theme.textSecondary}
          />
        </View>

        <View style={styles.groupStats}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="account-multiple"
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>
              {item.members.length} members
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialCommunityIcons
              name="receipt"
              size={16}
              color={theme.primary}
            />
            <Text style={[styles.statText, { color: theme.textSecondary }]}>
              {item.expenses.length} expenses
            </Text>
          </View>
        </View>

        <View
          style={[styles.amountBar, { backgroundColor: theme.primaryLight }]}
        >
          <Text style={[styles.amountText, { color: theme.primary }]}>
            ₹{totalExpense}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <View>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Groups
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            {analytics.totalGroups} groups • ₹{analytics.totalExpenses} total
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.createButton, { backgroundColor: theme.primary }]}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <MaterialCommunityIcons
            name="plus"
            size={24}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Groups List */}
      <FlatList
        data={groups}
        renderItem={renderGroupCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="inbox"
              size={64}
              color={theme.textSecondary}
            />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No groups yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textSecondary }]}>
              Tap + to create your first group
            </Text>
          </View>
        }
      />

      <CreateGroupModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreateGroup={addGroup}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  createButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: 16,
  },
  groupCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  groupHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  groupDesc: {
    fontSize: 12,
  },
  groupStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    fontSize: 12,
  },
  amountBar: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  amountText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default GroupsList;
