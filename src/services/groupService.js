import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "../config/firebase";
import {
  calculateBalances,
  calculateSettlements,
  calculateSplits,
} from "./expenseCalculator";

const verifiedUsers = [
  {
    id: "user-aarsh",
    name: "Aarsh",
    mobile: "9876543210",
    upiId: "aarsh@upi",
    isVerified: true,
  },
  {
    id: "user-sneha",
    name: "Sneha",
    mobile: "9876501234",
    upiId: "sneha@upi",
    isVerified: true,
  },
  {
    id: "user-rohit",
    name: "Rohit",
    mobile: "9876512345",
    upiId: "rohit@upi",
    isVerified: true,
  },
  {
    id: "user-anya",
    name: "Anya",
    mobile: "9876523456",
    upiId: "anya@upi",
    isVerified: true,
  },
  {
    id: "user-rahul",
    name: "Rahul",
    mobile: "9876534567",
    upiId: "rahul@upi",
    isVerified: true,
  },
  {
    id: "user-vikram",
    name: "Vikram",
    mobile: "9876545678",
    upiId: "vikram@upi",
    isVerified: true,
  },
];

export const mockVerifiedUsers = verifiedUsers;

const normalizeMobile = (mobile) => mobile?.replace(/\D/g, "") ?? "";

const mapDoc = (snapshot) => ({
  id: snapshot.id,
  ...snapshot.data(),
});

export const searchUsersByMobile = async (mobile) => {
  const normalizedMobile = normalizeMobile(mobile);

  if (!normalizedMobile) {
    return [];
  }

  if (!isFirebaseConfigured) {
    return verifiedUsers.filter((user) =>
      user.mobile.includes(normalizedMobile),
    );
  }

  const usersRef = collection(db, "users");
  const usersQuery = query(
    usersRef,
    where("mobile", "==", normalizedMobile),
    where("isMobileVerified", "==", true),
  );
  const snapshot = await getDocs(usersQuery);

  return snapshot.docs.map(mapDoc);
};

export const subscribeToUserGroups = (userId, onNext, onError) => {
  if (!isFirebaseConfigured || !userId) {
    return () => {};
  }

  const groupsQuery = query(
    collection(db, "groups"),
    where("memberIds", "array-contains", userId),
    orderBy("updatedAt", "desc"),
  );

  return onSnapshot(
    groupsQuery,
    (snapshot) => {
      onNext(snapshot.docs.map(mapDoc));
    },
    onError,
  );
};

export const createGroup = async ({
  name,
  description,
  creator,
  members,
}) => {
  const trimmedName = name?.trim();

  if (!trimmedName) {
    throw new Error("Group name is required.");
  }
  if (!members?.length) {
    throw new Error("Add at least one verified member to create a group.");
  }

  const creatorMember = {
    id: creator.id,
    name: creator.name,
    mobile: creator.mobile,
    upiId: creator.upiId || "",
    role: "admin",
    status: "active",
  };
  const uniqueMembers = [creatorMember, ...members].filter(
    (member, index, allMembers) =>
      allMembers.findIndex((item) => item.id === member.id) === index,
  );

  if (!isFirebaseConfigured) {
    return {
      id: `group-${Date.now()}`,
      name: trimmedName,
      description: description?.trim() || "A new group for shared expenses.",
      createdBy: creator.id,
      memberIds: uniqueMembers.map((member) => member.id),
    members: uniqueMembers,
    expenses: [],
    settlements: [],
    balances: [],
      updatedAt: new Date().toISOString(),
    };
  }

  const groupRef = await addDoc(collection(db, "groups"), {
    name: trimmedName,
    description: description?.trim() || "A new group for shared expenses.",
    createdBy: creator.id,
    memberIds: uniqueMembers.map((member) => member.id),
    members: uniqueMembers,
    expenses: [],
    settlements: [],
    balances: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return groupRef.id;
};

export const addMember = async (groupId, member) => {
  if (!isFirebaseConfigured) {
    return;
  }

  await updateDoc(doc(db, "groups", groupId), {
    memberIds: arrayUnion(member.id),
    members: arrayUnion({ ...member, role: "member", status: "active" }),
    updatedAt: serverTimestamp(),
  });
};

export const removeMember = async (groupId, nextMembers) => {
  if (!isFirebaseConfigured) {
    return;
  }

  await updateDoc(doc(db, "groups", groupId), {
    members: nextMembers,
    memberIds: nextMembers.map((member) => member.id),
    updatedAt: serverTimestamp(),
  });
};

export const addExpense = async ({
  group,
  title,
  amount,
  note,
  paidByUserId,
  participants,
  splitType,
  splitValues,
}) => {
  const splits = calculateSplits({
    amount,
    paidByUserId,
    participants,
    splitType,
    splitValues,
  });
  const expense = {
    id: `expense-${Date.now()}`,
    title: title?.trim() || "Split Expense",
    amount: Number(amount),
    note: note?.trim() || "No note",
    paidByUserId,
    paidBy:
      group.members.find((member) => member.id === paidByUserId)?.name ||
      "Unknown",
    splitType,
    splits,
    createdAt: new Date().toISOString(),
    date: new Date().toISOString().slice(0, 10),
  };
  const expenses = [expense, ...(group.expenses || [])];
  const balances = calculateBalances(expenses);
  const settlements = calculateSettlements(balances);

  if (!isFirebaseConfigured) {
    return { expense, balances, settlements };
  }

  const expenseRef = await addDoc(
    collection(db, "groups", group.id, "expenses"),
    {
      ...expense,
      createdAt: serverTimestamp(),
    },
  );

  await updateDoc(doc(db, "groups", group.id), {
    expenses: arrayUnion({ ...expense, id: expenseRef.id }),
    balances,
    settlements,
    updatedAt: serverTimestamp(),
  });

  return { expense: { ...expense, id: expenseRef.id }, balances, settlements };
};

export const deleteExpense = async (groupId, expenseId) => {
  if (!isFirebaseConfigured) {
    return;
  }

  await deleteDoc(doc(db, "groups", groupId, "expenses", expenseId));
};
