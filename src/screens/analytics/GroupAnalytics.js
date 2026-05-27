import React from "react";
import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRoute } from "@react-navigation/native";
import { useTheme } from "../../hooks/useTheme";
import { useGroups } from "../../hooks/useGroups";

const GroupAnalytics = () => {
  const route = useRoute();
  const { groupId } = route.params;
  const { theme } = useTheme();
  const { groups } = useGroups();

  const group = groups.find((g) => g.id === groupId);

  if (!group) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>
          Group not found
        </Text>
      </View>
    );
  }

  const totalExpenses = group.expenses.reduce(
    (sum, exp) => sum + exp.amount,
    0,
  );
  const perPersonShare =
    group.members.length > 0 ? totalExpenses / group.members.length : 0;

  // Calculate payer breakdown
  const payerBreakdown = group.expenses.reduce((acc, expense) => {
    const existing = acc.find((item) => item.paidBy === expense.paidBy);
    if (existing) {
      existing.total += expense.amount;
      existing.count += 1;
    } else {
      acc.push({ paidBy: expense.paidBy, total: expense.amount, count: 1 });
    }
    return acc;
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Group Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.groupName, { color: theme.text }]}>
            {group.name}
          </Text>
          <Text
            style={[styles.groupDescription, { color: theme.textSecondary }]}
          >
            {group.description}
          </Text>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <View
            style={[
              styles.stat,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <MaterialCommunityIcons
              name="receipt"
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Total Expenses
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              ₹{totalExpenses}
            </Text>
          </View>

          <View
            style={[
              styles.stat,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <MaterialCommunityIcons
              name="account-multiple"
              size={20}
              color={theme.secondary}
            />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Members
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {group.members.length}
            </Text>
          </View>

          <View
            style={[
              styles.stat,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <MaterialCommunityIcons
              name="calculator"
              size={20}
              color={theme.warning}
            />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Per Person
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              ₹{perPersonShare.toFixed(0)}
            </Text>
          </View>

          <View
            style={[
              styles.stat,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <MaterialCommunityIcons
              name="cash-multiple"
              size={20}
              color={theme.primary}
            />
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
              Transactions
            </Text>
            <Text style={[styles.statValue, { color: theme.text }]}>
              {group.expenses.length}
            </Text>
          </View>
        </View>

        {/* Payer Breakdown */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Payer Breakdown
          </Text>
          {payerBreakdown.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No transactions yet
            </Text>
          ) : (
            payerBreakdown.map((item, index) => (
              <View
                key={index}
                style={[styles.payerItem, { borderColor: theme.border }]}
              >
                <View style={styles.payerInfo}>
                  <View
                    style={[
                      styles.payerAvatar,
                      { backgroundColor: theme.primaryLight },
                    ]}
                  >
                    <Text style={[styles.avatarText, { color: theme.primary }]}>
                      {item.paidBy.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.payerDetails}>
                    <Text style={[styles.payerName, { color: theme.text }]}>
                      {item.paidBy}
                    </Text>
                    <Text
                      style={[
                        styles.transactionCount,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {item.count} transaction{item.count > 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <View style={styles.payerAmount}>
                  <Text style={[styles.amountText, { color: theme.primary }]}>
                    ₹{item.total}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Members List */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Members
          </Text>
          {group.members.map((member, index) => (
            <View
              key={index}
              style={[styles.memberItem, { borderColor: theme.border }]}
            >
              <View
                style={[
                  styles.memberAvatar,
                  {
                    backgroundColor: theme.secondaryLight || theme.primaryLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.avatarText,
                    { color: theme.secondary || theme.primary },
                  ]}
                >
                  {member.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.memberDetails}>
                <Text style={[styles.memberName, { color: theme.text }]}>
                  {member.name}
                </Text>
                <Text
                  style={[styles.memberPhone, { color: theme.textSecondary }]}
                >
                  {member.mobile}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  groupName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  groupDescription: {
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
    minWidth: "48%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 12,
    textAlign: "center",
    paddingVertical: 16,
  },
  payerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  payerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  payerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  payerDetails: {
    flex: 1,
  },
  payerName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  transactionCount: {
    fontSize: 11,
  },
  payerAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  memberPhone: {
    fontSize: 11,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  errorText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
});

export default GroupAnalytics;
