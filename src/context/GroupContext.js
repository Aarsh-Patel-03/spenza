import React, {
  useCallback,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { isFirebaseConfigured } from "../config/firebase";
import { useAuth } from "../hooks/useAuth";
import * as groupService from "../services/groupService";
import {
  calculateBalances,
  calculateSettlements,
  calculateSplits,
} from "../services/expenseCalculator";

export const GroupContext = createContext();

const generateId = (prefix) =>
  `${prefix}-${Math.random().toString(36).substr(2, 9)}`;

const verifiedUsers = groupService.mockVerifiedUsers;

const initialGroups = [
  {
    id: "group-goa-trip",
    name: "Goa Trip",
    description: "Beach trip expense sharing for the weekend.",
    members: [
      { id: "user-aarsh", name: "Aarsh", mobile: "9876543210", upiId: "aarsh@upi" },
      { id: "user-sneha", name: "Sneha", mobile: "9876501234", upiId: "sneha@upi" },
      { id: "user-rohit", name: "Rohit", mobile: "9876512345", upiId: "rohit@upi" },
    ],
    expenses: [
      {
        id: "expense-1",
        title: "Dinner at beach shack",
        amount: 2200,
        note: "Seafood and drinks",
        paidBy: "Aarsh",
        date: "2026-05-12",
      },
      {
        id: "expense-2",
        title: "Taxi to hotel",
        amount: 950,
        note: "Split between all members",
        paidBy: "Sneha",
        date: "2026-05-13",
      },
    ],
  },
  {
    id: "group-udev-house",
    name: "Weekend House",
    description: "Shared apartment expenses with roommates.",
    members: [
      { id: "user-anya", name: "Anya", mobile: "9876523456", upiId: "anya@upi" },
      { id: "user-rahul", name: "Rahul", mobile: "9876534567", upiId: "rahul@upi" },
      { id: "user-vikram", name: "Vikram", mobile: "9876545678", upiId: "vikram@upi" },
    ],
    expenses: [
      {
        id: "expense-3",
        title: "Grocery shopping",
        amount: 1800,
        note: "Kitchen supplies for the week",
        paidBy: "Rahul",
        date: "2026-05-10",
      },
      {
        id: "expense-4",
        title: "Utility bill",
        amount: 1450,
        note: "Electricity and water split",
        paidBy: "Anya",
        date: "2026-05-11",
      },
    ],
  },
];

const isValidMobile = (mobile) => /^\d{10}$/.test(mobile.trim());

const normalizeMember = (member) => ({
  id: member.id,
  name: member.name,
  mobile: member.mobile,
  upiId: member.upiId,
});

export const GroupProvider = ({ children }) => {
  const { user } = useAuth();
  const [groups, setGroups] = useState(initialGroups);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);

  useEffect(() => {
    if (!isFirebaseConfigured || !user?.id) {
      return undefined;
    }

    setIsSyncing(true);
    const unsubscribe = groupService.subscribeToUserGroups(
      user.id,
      (nextGroups) => {
        setGroups(nextGroups);
        setIsSyncing(false);
        setSyncError(null);
      },
      (error) => {
        setSyncError(error.message);
        setIsSyncing(false);
      },
    );

    return unsubscribe;
  }, [user?.id]);

  const searchVerifiedUsers = useCallback(async (query) => {
    const digits = query?.replace(/\D/g, "") ?? "";

    if (!digits) {
      return [];
    }

    return groupService.searchUsersByMobile(digits);
  }, []);

  const addGroup = async (name, description, members = []) => {
    const trimmedName = name?.trim();
    if (!trimmedName) {
      throw new Error("Group name is required.");
    }
    if (!members.length) {
      throw new Error("Add at least one verified member to create a group.");
    }

    const creator = {
      id: user?.id || "user-aarsh",
      name: user?.name || "You",
      mobile: user?.mobile || "9999999999",
      upiId: user?.upiId || "",
    };
    const newGroup = await groupService.createGroup({
      name: trimmedName,
      description,
      creator,
      members: members.map(normalizeMember),
    });

    if (isFirebaseConfigured) {
      return newGroup;
    }

    setGroups((existingGroups) => [newGroup, ...existingGroups]);
    return newGroup.id;
  };

  const addMemberToGroup = async (groupId, member) => {
    const normalizedMember = normalizeMember(member);

    if (isFirebaseConfigured) {
      await groupService.addMember(groupId, normalizedMember);
      return;
    }

    setGroups((existingGroups) =>
      existingGroups.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        const alreadyExists = group.members.some(
          (existingMember) => existingMember.id === normalizedMember.id,
        );

        if (alreadyExists) {
          return group;
        }

        return {
          ...group,
          members: [...group.members, normalizedMember],
        };
      }),
    );
  };

  const removeMemberFromGroup = async (groupId, memberId) => {
    const group = groups.find((item) => item.id === groupId);
    const nextMembers =
      group?.members.filter((member) => member.id !== memberId) || [];

    if (isFirebaseConfigured) {
      await groupService.removeMember(groupId, nextMembers);
      return;
    }

    setGroups((existingGroups) =>
      existingGroups.map((existingGroup) => {
        if (existingGroup.id !== groupId) {
          return existingGroup;
        }

        return {
          ...existingGroup,
          members: nextMembers,
        };
      }),
    );
  };

  const addExpense = async (
    groupId,
    {
      title,
      amount,
      note,
      paidBy,
      paidByUserId,
      participants,
      splitType = "equal",
      splitValues = {},
    },
  ) => {
    const group = groups.find((item) => item.id === groupId);

    if (!group) {
      throw new Error("Group not found.");
    }

    const payerId =
      paidByUserId ||
      group.members.find((member) => member.name === paidBy)?.id ||
      user?.id;
    const participantIds =
      participants?.length > 0
        ? participants
        : group.members.map((member) => member.id);

    if (isFirebaseConfigured) {
      await groupService.addExpense({
        group,
        title,
        amount,
        note,
        paidByUserId: payerId,
        participants: participantIds,
        splitType,
        splitValues,
      });
      return;
    }

    const splits = calculateSplits({
      amount,
      paidByUserId: payerId,
      participants: participantIds,
      splitType,
      splitValues,
    });
    const createdAt = new Date().toISOString();
    const expense = {
      id: generateId("expense"),
      title: title?.trim() || "Split Expense",
      amount: Number(amount),
      note: note?.trim() || "No additional note.",
      paidBy:
        group.members.find((member) => member.id === payerId)?.name ||
        paidBy ||
        "You",
      paidByUserId: payerId,
      splitType,
      splits,
      createdAt,
      date: createdAt.slice(0, 10),
    };

    setGroups((existingGroups) =>
      existingGroups.map((existingGroup) => {
        if (existingGroup.id !== groupId) {
          return existingGroup;
        }

        const expenses = [expense, ...existingGroup.expenses];
        const balances = calculateBalances(expenses);
        const settlements = calculateSettlements(balances);

        return {
          ...existingGroup,
          expenses,
          balances,
          settlements,
        };
      }),
    );
  };

  const deleteExpense = async (groupId, expenseId) => {
    if (isFirebaseConfigured) {
      await groupService.deleteExpense(groupId, expenseId);
    }

    setGroups((existingGroups) =>
      existingGroups.map((existingGroup) => {
        if (existingGroup.id !== groupId) {
          return existingGroup;
        }

        const expenses = existingGroup.expenses.filter(
          (expense) => expense.id !== expenseId,
        );
        const balances = calculateBalances(expenses);
        const settlements = calculateSettlements(balances);

        return {
          ...existingGroup,
          expenses,
          balances,
          settlements,
        };
      }),
    );
  };

  const updateExpense = async (groupId, expenseId, updates) => {
    setGroups((existingGroups) =>
      existingGroups.map((existingGroup) => {
        if (existingGroup.id !== groupId) {
          return existingGroup;
        }

        const expenses = existingGroup.expenses.map((expense) =>
          expense.id === expenseId
            ? {
                ...expense,
                ...updates,
                amount:
                  updates.amount === undefined
                    ? expense.amount
                    : Number(updates.amount),
                note:
                  updates.note === undefined
                    ? expense.note
                    : updates.note?.trim() || "No additional note.",
                updatedAt: new Date().toISOString(),
              }
            : expense,
        );
        const balances = calculateBalances(expenses);
        const settlements = calculateSettlements(balances);

        return {
          ...existingGroup,
          expenses,
          balances,
          settlements,
        };
      }),
    );
  };

  const searchMembersByMobile = (mobile) => {
    const trimmed = mobile.trim();
    if (!trimmed) {
      return [];
    }

    const normalized = trimmed.replace(/\D/g, "");
    return groups
      .flatMap((group) =>
        group.members
          .filter((member) => member.mobile.includes(normalized))
          .map((member) => ({
            ...member,
            groupId: group.id,
            groupName: group.name,
          })),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  };

  const verifyMobile = (mobile) => {
    if (!isValidMobile(mobile)) {
      return { valid: false, message: "Use a 10-digit mobile number." };
    }

    const matches = searchMembersByMobile(mobile);
    if (matches.length === 0) {
      return { valid: false, message: "Mobile number not found in any group." };
    }

    return {
      valid: true,
      message: `Verified ${matches[0].name} in ${matches[0].groupName}.`,
      matches,
    };
  };

  const analytics = useMemo(() => {
    const totalGroups = groups.length;
    const totalMembers = new Set(
      groups.flatMap((group) => group.members.map((member) => member.mobile)),
    ).size;
    const totalExpenses = groups.reduce(
      (groupSum, group) =>
        groupSum +
        group.expenses.reduce(
          (expenseSum, expense) => expenseSum + expense.amount,
          0,
        ),
      0,
    );

    const payerTotals = groups.reduce((totals, group) => {
      group.expenses.forEach((expense) => {
        totals[expense.paidBy] = (totals[expense.paidBy] || 0) + expense.amount;
      });
      return totals;
    }, {});

    const [topPayerName, topPayerAmount] = Object.entries(payerTotals).sort(
      (a, b) => b[1] - a[1],
    )[0] || ["Nobody yet", 0];

    const groupBreakdown = groups.map((group) => ({
      id: group.id,
      name: group.name,
      total: group.expenses.reduce((sum, expense) => sum + expense.amount, 0),
      totalExpenses: group.expenses.length,
      members: group.members.length,
    }));

    return {
      totalGroups,
      totalMembers,
      totalExpenses,
      topPayerName,
      topPayerAmount,
      groupBreakdown,
    };
  }, [groups]);

  return (
    <GroupContext.Provider
      value={{
        groups,
        addGroup,
        addExpense,
        deleteExpense,
        updateExpense,
        addMemberToGroup,
        removeMemberFromGroup,
        searchVerifiedUsers,
        searchMembersByMobile,
        verifyMobile,
        analytics,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
};

export const useGroupContext = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error("useGroupContext must be used within GroupProvider");
  }
  return context;
};
