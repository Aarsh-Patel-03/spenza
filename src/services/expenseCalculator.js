export const calculateSplits = ({
  amount,
  paidByUserId,
  participants,
  splitType = "equal",
  splitValues = {},
}) => {
  const totalAmount = Number(amount);

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error("Expense amount must be a positive number.");
  }
  if (!paidByUserId) {
    throw new Error("Select who paid for this expense.");
  }
  if (!participants?.length) {
    throw new Error("Select at least one participant.");
  }

  if (splitType === "equal") {
    const share = Number((totalAmount / participants.length).toFixed(2));
    return participants.map((userId, index) => ({
      userId,
      amount:
        index === participants.length - 1
          ? Number(
              (
                totalAmount -
                share * Math.max(participants.length - 1, 0)
              ).toFixed(2),
            )
          : share,
    }));
  }

  if (splitType === "exact") {
    const splits = participants.map((userId) => ({
      userId,
      amount: Number(splitValues[userId] || 0),
    }));
    const totalSplit = splits.reduce((sum, split) => sum + split.amount, 0);

    if (Math.abs(totalSplit - totalAmount) > 0.01) {
      throw new Error("Exact splits must add up to the total expense amount.");
    }

    return splits;
  }

  if (splitType === "percentage") {
    const splits = participants.map((userId) => {
      const percentage = Number(splitValues[userId] || 0);
      return {
        userId,
        percentage,
        amount: Number(((totalAmount * percentage) / 100).toFixed(2)),
      };
    });
    const totalPercentage = splits.reduce(
      (sum, split) => sum + split.percentage,
      0,
    );

    if (Math.abs(totalPercentage - 100) > 0.01) {
      throw new Error("Percentage splits must add up to 100%.");
    }

    return splits;
  }

  throw new Error("Unsupported split type.");
};

export const calculateBalances = (expenses = []) => {
  const balances = {};

  expenses.forEach((expense) => {
    const paidByUserId = expense.paidByUserId;
    const amount = Number(expense.amount) || 0;

    balances[paidByUserId] = (balances[paidByUserId] || 0) + amount;

    expense.splits?.forEach((split) => {
      balances[split.userId] =
        (balances[split.userId] || 0) - (Number(split.amount) || 0);
    });
  });

  return Object.entries(balances).map(([userId, balance]) => ({
    userId,
    balance: Number(balance.toFixed(2)),
  }));
};

export const calculateSettlements = (balances = []) => {
  const creditors = balances
    .filter((item) => item.balance > 0.01)
    .sort((a, b) => b.balance - a.balance);
  const debtors = balances
    .filter((item) => item.balance < -0.01)
    .map((item) => ({ ...item, balance: Math.abs(item.balance) }))
    .sort((a, b) => b.balance - a.balance);
  const settlements = [];

  let creditorIndex = 0;
  let debtorIndex = 0;

  while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
    const creditor = creditors[creditorIndex];
    const debtor = debtors[debtorIndex];
    const amount = Math.min(creditor.balance, debtor.balance);

    settlements.push({
      fromUserId: debtor.userId,
      toUserId: creditor.userId,
      amount: Number(amount.toFixed(2)),
    });

    creditor.balance -= amount;
    debtor.balance -= amount;

    if (creditor.balance <= 0.01) creditorIndex += 1;
    if (debtor.balance <= 0.01) debtorIndex += 1;
  }

  return settlements;
};
