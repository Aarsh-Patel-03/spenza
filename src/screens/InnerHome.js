import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../hooks/useTheme";
import { useAuth } from "../hooks/useAuth";
import { useGroups } from "../hooks/useGroups";
import CreateGroupModal from "../components/groups/CreateGroupModal";

// ─── helpers ────────────────────────────────────────────────────────────────

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12)
    return { label: "Good morning", icon: "weather-sunny" };
  if (hour >= 12 && hour < 17)
    return { label: "Good afternoon", icon: "weather-partly-cloudy" };
  if (hour >= 17 && hour < 21)
    return { label: "Good evening", icon: "weather-sunset" };
  return { label: "Good night", icon: "weather-night" };
};

const getRelativeTime = (dateString) => {
  if (!dateString) return null;
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

const GROUP_EMOJIS = ["🏕️", "🏠", "🍕", "✈️", "🎮", "🎉", "🏋️", "📚"];
const getEmoji = (id) => GROUP_EMOJIS[id % GROUP_EMOJIS.length];

// ─── sub-components ──────────────────────────────────────────────────────────

const SummaryCards = ({ groups, theme }) => {
  const { totalOwed, totalOwedToYou } = useMemo(() => {
    let totalOwed = 0;
    let totalOwedToYou = 0;
    groups.forEach((g) => {
      g.expenses?.forEach((e) => {
        const amount = parseFloat(e.amount) || 0;
        if (e.paidBy === "You") {
          totalOwedToYou += amount;
        } else {
          totalOwed += amount;
        }
      });
    });
    return { totalOwed, totalOwedToYou };
  }, [groups]);

  return (
    <View style={styles.summaryRow}>
      <View
        style={[
          styles.statCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.statLabelRow}>
          <MaterialCommunityIcons
            name="arrow-up-circle-outline"
            size={14}
            color={theme.textSecondary}
          />
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            You owe
          </Text>
        </View>
        <Text style={[styles.statValue, { color: "#D85A30" }]}>
          ₹{totalOwed.toLocaleString()}
        </Text>
      </View>
      <View
        style={[
          styles.statCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={styles.statLabelRow}>
          <MaterialCommunityIcons
            name="arrow-down-circle-outline"
            size={14}
            color={theme.textSecondary}
          />
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Owed to you
          </Text>
        </View>
        <Text style={[styles.statValue, { color: theme.primary }]}>
          ₹{totalOwedToYou.toLocaleString()}
        </Text>
      </View>
    </View>
  );
};

const RecentGroupCard = ({ group, theme, onPress, index }) => {
  const total =
    group.expenses?.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0) ||
    0;
  const lastActivity = group.expenses?.[group.expenses.length - 1]?.date;
  const relTime = getRelativeTime(lastActivity);

  return (
    <TouchableOpacity
      style={[
        styles.groupCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.groupAvatar, { backgroundColor: theme.background }]}>
        <Text style={styles.groupEmoji}>{getEmoji(index)}</Text>
      </View>
      <View style={styles.groupCardInfo}>
        <Text
          style={[styles.groupCardName, { color: theme.text }]}
          numberOfLines={1}
        >
          {group.name}
        </Text>
        <View style={styles.groupCardMeta}>
          {relTime && (
            <>
              <View
                style={[styles.liveDot, { backgroundColor: theme.primary }]}
              />
              <Text
                style={[
                  styles.groupCardMetaText,
                  { color: theme.textSecondary },
                ]}
              >
                {relTime} ·{" "}
              </Text>
            </>
          )}
          <Text
            style={[styles.groupCardMetaText, { color: theme.textSecondary }]}
          >
            {group.members?.length ?? 0} members
          </Text>
        </View>
      </View>
      <View style={styles.groupCardRight}>
        <Text style={[styles.groupCardAmount, { color: theme.primary }]}>
          ₹{total.toLocaleString()}
        </Text>
        <Text
          style={[styles.groupCardAmountLabel, { color: theme.textSecondary }]}
        >
          total
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const BottomNav = ({ activeTab, onTabChange, theme }) => {
  const tabs = [
    { key: "home", label: "Home", icon: "home-outline", activeIcon: "home" },
    {
      key: "groups",
      label: "Groups",
      icon: "account-group-outline",
      activeIcon: "account-group",
    },
    {
      key: "analytics",
      label: "Analytics",
      icon: "chart-bar",
      activeIcon: "chart-bar",
    },
    {
      key: "profile",
      label: "Profile",
      icon: "account-outline",
      activeIcon: "account",
    },
  ];

  return (
    <View
      style={[
        styles.bottomNav,
        { backgroundColor: theme.surface, borderTopColor: theme.border },
      ]}
    >
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab.key;
        if (idx === 2) {
          return (
            <React.Fragment key={tab.key}>
              {/* FAB placeholder in center */}
              <View style={styles.fabSlot} />
              <TouchableOpacity
                style={styles.navItem}
                onPress={() => onTabChange(tab.key)}
                accessibilityLabel={tab.label}
              >
                {isActive && (
                  <View
                    style={[styles.navPip, { backgroundColor: theme.primary }]}
                  />
                )}
                <MaterialCommunityIcons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={24}
                  color={isActive ? theme.primary : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.navLabel,
                    { color: isActive ? theme.primary : theme.textSecondary },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        }
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.navItem}
            onPress={() => onTabChange(tab.key)}
            accessibilityLabel={tab.label}
          >
            {isActive && (
              <View
                style={[styles.navPip, { backgroundColor: theme.primary }]}
              />
            )}
            <MaterialCommunityIcons
              name={isActive ? tab.activeIcon : tab.icon}
              size={24}
              color={isActive ? theme.primary : theme.textSecondary}
            />
            <Text
              style={[
                styles.navLabel,
                { color: isActive ? theme.primary : theme.textSecondary },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Floating action button pinned to center */}
      <View style={styles.fabWrapper} pointerEvents="box-none">
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          accessibilityLabel="Add expense"
          onPress={() =>
            Alert.alert("Add expense", "Navigate to add expense flow")
          }
        >
          <MaterialCommunityIcons name="plus" size={26} color={theme.surface} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── main screen ─────────────────────────────────────────────────────────────

const InnerHome = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { groups, addGroup } = useGroups();

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  const greeting = getGreeting();

  // Sort groups by most recent expense date descending
  const recentGroups = useMemo(() => {
    return [...groups]
      .sort((a, b) => {
        const aDate = a.expenses?.[a.expenses.length - 1]?.date ?? "";
        const bDate = b.expenses?.[b.expenses.length - 1]?.date ?? "";
        return bDate.localeCompare(aDate);
      })
      .slice(0, 3);
  }, [groups]);

  const unsettledCount = groups.filter((g) => g.expenses?.length > 0).length;

  const navigateToGroupDetail = (groupId) => {
    navigation.navigate("GroupsTab", {
      screen: "GroupDetail",
      params: { groupId },
    });
  };

  return (
    <View
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollArea,
          { backgroundColor: theme.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting */}
        <View style={styles.greetingBlock}>
          <View
            style={[
              styles.greetingTag,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <MaterialCommunityIcons
              name={greeting.icon}
              size={13}
              color={theme.primary}
            />
            <Text style={[styles.greetingTagText, { color: theme.primary }]}>
              {greeting.label}
            </Text>
          </View>
          <Text style={[styles.greetingMain, { color: theme.text }]}>
            Hey {user?.name?.split(" ")[0] || "there"},{"\n"}ready to settle up?
          </Text>
          <Text style={[styles.greetingSub, { color: theme.textSecondary }]}>
            {unsettledCount > 0
              ? `You have ${unsettledCount} active group${unsettledCount !== 1 ? "s" : ""}`
              : "All clear — no active groups yet"}
          </Text>
        </View>

        {/* Summary cards */}
        <SummaryCards groups={groups} theme={theme} />

        {/* Recent groups */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              Recent groups
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("GroupsTab", { screen: "GroupsList" })
              }
            >
              <Text style={[styles.seeAll, { color: theme.primary }]}>
                See all
              </Text>
            </TouchableOpacity>
          </View>

          {recentGroups.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <MaterialCommunityIcons
                name="account-group-outline"
                size={36}
                color={theme.textSecondary}
              />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No groups yet. Create your first one below!
              </Text>
            </View>
          ) : (
            recentGroups.map((group, idx) => (
              <RecentGroupCard
                key={group.id}
                group={group}
                theme={theme}
                index={idx}
                onPress={() => navigateToGroupDetail(group.id)}
              />
            ))
          )}
        </View>

        {/* Create group */}
        <View style={styles.sectionBlock}>
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: theme.primary }]}
            onPress={() => setIsCreateModalVisible(true)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons
              name="plus"
              size={20}
              color={theme.surface}
            />
            <Text style={[styles.createBtnText, { color: theme.surface }]}>
              Create new group
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CreateGroupModal
        visible={isCreateModalVisible}
        onClose={() => setIsCreateModalVisible(false)}
        onCreateGroup={addGroup}
      />
    </View>
  );
};

// ─── styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  // Top bar
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  topBarActions: {
    flexDirection: "row",
    gap: 6,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Scroll
  scrollArea: {
    padding: 16,
    paddingBottom: 24,
    gap: 20,
  },

  // Greeting
  greetingBlock: {
    paddingTop: 4,
  },
  greetingTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
  },
  greetingTagText: {
    fontSize: 12,
    fontWeight: "500",
  },
  greetingMain: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
    lineHeight: 30,
    marginBottom: 6,
  },
  greetingSub: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Summary
  summaryRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },

  // Section
  sectionBlock: {},
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 13,
    fontWeight: "500",
  },

  // Group card
  groupCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  groupAvatar: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  groupEmoji: {
    fontSize: 20,
  },
  groupCardInfo: {
    flex: 1,
    minWidth: 0,
  },
  groupCardName: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 3,
  },
  groupCardMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  liveDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 5,
  },
  groupCardMetaText: {
    fontSize: 12,
  },
  groupCardRight: {
    alignItems: "flex-end",
  },
  groupCardAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  groupCardAmountLabel: {
    fontSize: 11,
    marginTop: 1,
  },

  // Empty state
  emptyCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 32,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },

  // Create group
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  // Bottom nav
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingBottom: 8,
    position: "relative",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 4,
    position: "relative",
  },
  navPip: {
    position: "absolute",
    top: 0,
    width: 20,
    height: 2,
    borderRadius: 2,
  },
  navLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  fabSlot: {
    width: 64,
  },
  fabWrapper: {
    position: "absolute",
    left: "50%",
    top: -22,
    transform: [{ translateX: -28 }],
    width: 56,
    height: 56,
    zIndex: 10,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
});

export default InnerHome;
