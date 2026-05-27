import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../../hooks/useTheme";
import { useGroups } from "../../hooks/useGroups";

const AnalyticsDashboard = ({ navigation }) => {
  const { theme } = useTheme();
  const { groups, analytics } = useGroups();

  const renderStatCard = (label, value, icon, color) => (
    <View
      style={[
        styles.statCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
    >
      <View style={styles.statIconContainer}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
        {label}
      </Text>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Analytics
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Overview of your groups and expenses
          </Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            "Total Groups",
            analytics.totalGroups,
            "account-multiple",
            theme.primary,
          )}
          {renderStatCard(
            "Total Members",
            analytics.totalMembers,
            "people",
            theme.secondary,
          )}
          {renderStatCard(
            "Total Expenses",
            `₹${analytics.totalExpenses}`,
            "receipt",
            theme.warning,
          )}
          {renderStatCard(
            "Top Payer",
            analytics.topPayerName,
            "trophy",
            theme.danger,
          )}
        </View>

        {/* Group Breakdown */}
        <View
          style={[
            styles.section,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Group Breakdown
          </Text>
          {analytics.groupBreakdown.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No groups to analyze
            </Text>
          ) : (
            analytics.groupBreakdown.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.breakdownItem,
                  {
                    backgroundColor: theme.background,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() =>
                  navigation.navigate("GroupAnalytics", { groupId: item.id })
                }
              >
                <View style={styles.breakdownInfo}>
                  <Text style={[styles.breakdownName, { color: theme.text }]}>
                    {item.name}
                  </Text>
                  <View style={styles.breakdownMeta}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="account-multiple"
                        size={12}
                        color={theme.primary}
                      />
                      <Text
                        style={[
                          styles.metaText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {item.members} members
                      </Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons
                        name="receipt"
                        size={12}
                        color={theme.primary}
                      />
                      <Text
                        style={[
                          styles.metaText,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {item.totalExpenses} expenses
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.breakdownAmount}>
                  <Text
                    style={[styles.breakdownTotal, { color: theme.primary }]}
                  >
                    ₹{item.total}
                  </Text>
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={20}
                    color={theme.textSecondary}
                  />
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Top Payer Info */}
        {analytics.topPayerAmount > 0 && (
          <View
            style={[
              styles.section,
              {
                backgroundColor: theme.primaryLight,
                borderColor: theme.primary,
              },
            ]}
          >
            <View style={styles.topPayerIcon}>
              <MaterialCommunityIcons
                name="crown"
                size={32}
                color={theme.primary}
              />
            </View>
            <Text style={[styles.topPayerLabel, { color: theme.primary }]}>
              Top Spender
            </Text>
            <Text style={[styles.topPayerName, { color: theme.primary }]}>
              {analytics.topPayerName}
            </Text>
            <Text style={[styles.topPayerAmount, { color: theme.primary }]}>
              ₹{analytics.topPayerAmount}
            </Text>
          </View>
        )}
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
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "48%",
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  statIconContainer: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
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
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 20,
  },
  breakdownItem: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownName: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
  },
  breakdownMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
  },
  breakdownAmount: {
    alignItems: "flex-end",
    gap: 4,
  },
  breakdownTotal: {
    fontSize: 16,
    fontWeight: "bold",
  },
  topPayerIcon: {
    alignItems: "center",
    marginBottom: 8,
  },
  topPayerLabel: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 4,
  },
  topPayerName: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  topPayerAmount: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default AnalyticsDashboard;
