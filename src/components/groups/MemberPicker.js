import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CustomTextInput from "../common/TextInput";
import { useGroups } from "../../hooks/useGroups";
import { useTheme } from "../../hooks/useTheme";

const EMPTY_MEMBER_IDS = [];

const MemberPicker = ({
  selectedMembers,
  onChangeSelectedMembers,
  excludedMemberIds = EMPTY_MEMBER_IDS,
  title = "Add verified members",
}) => {
  const { theme } = useTheme();
  const { searchVerifiedUsers } = useGroups();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const selectedIdKey = useMemo(
    () => selectedMembers.map((member) => member.id).join("|"),
    [selectedMembers],
  );
  const excludedIdKey = useMemo(
    () => excludedMemberIds.join("|"),
    [excludedMemberIds],
  );

  useEffect(() => {
    let isActive = true;

    const runSearch = async () => {
      if (!query.trim()) {
        setResults((currentResults) =>
          currentResults.length === 0 ? currentResults : [],
        );
        return;
      }

      const selectedIds = new Set(selectedIdKey ? selectedIdKey.split("|") : []);
      const excludedIds = new Set(excludedIdKey ? excludedIdKey.split("|") : []);

      setIsSearching(true);
      try {
        const users = await searchVerifiedUsers(query);
        if (isActive) {
          setResults(
            users.filter(
              (user) => !selectedIds.has(user.id) && !excludedIds.has(user.id),
            ),
          );
        }
      } finally {
        if (isActive) {
          setIsSearching(false);
        }
      }
    };

    runSearch();

    return () => {
      isActive = false;
    };
  }, [excludedIdKey, query, searchVerifiedUsers, selectedIdKey]);

  const addMember = (member) => {
    onChangeSelectedMembers([...selectedMembers, member]);
    setQuery("");
  };

  const removeMember = (memberId) => {
    onChangeSelectedMembers(
      selectedMembers.filter((member) => member.id !== memberId),
    );
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <CustomTextInput
        label="Search by mobile, UPI ID, or name"
        placeholder="e.g. 9876543210 or aarsh@upi"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
      />

      {!!query.trim() && (
        <View
          style={[
            styles.resultsBox,
            { backgroundColor: theme.background, borderColor: theme.border },
          ]}
        >
          {isSearching ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Searching verified users...
            </Text>
          ) : results.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No verified user found
            </Text>
          ) : (
            results.map((member) => (
              <TouchableOpacity
                key={member.id}
                style={styles.resultRow}
                onPress={() => addMember(member)}
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
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  size={22}
                  color={theme.primary}
                />
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      <View style={styles.selectedList}>
        {selectedMembers.length === 0 ? (
          <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
            Add at least one verified member before creating the group.
          </Text>
        ) : (
          selectedMembers.map((member) => (
            <View
              key={member.id}
              style={[
                styles.selectedChip,
                { backgroundColor: theme.background, borderColor: theme.border },
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
              <TouchableOpacity onPress={() => removeMember(member.id)}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={22}
                  color={theme.textSecondary}
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  resultsBox: {
    borderWidth: 1,
    borderRadius: 10,
    marginTop: -6,
    marginBottom: 12,
    overflow: "hidden",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
  },
  selectedList: {
    gap: 8,
    marginBottom: 12,
  },
  selectedChip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
  },
  memberInfo: {
    flex: 1,
    minWidth: 0,
  },
  memberName: {
    fontSize: 14,
    fontWeight: "700",
  },
  memberMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 12,
    lineHeight: 18,
    padding: 12,
  },
});

export default MemberPicker;
