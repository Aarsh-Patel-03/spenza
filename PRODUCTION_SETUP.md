# Desi Hisaab Production Setup

## Firebase

1. Create a Firebase project.
2. Enable Authentication > Sign-in method > Phone.
3. Create a Firestore database.
4. Publish `firestore.rules`.
5. Add these values to `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

## Data Model

### `users/{userId}`

```js
{
  name,
  mobile,
  upiId,
  isMobileVerified,
  createdAt,
  updatedAt
}
```

### `groups/{groupId}`

```js
{
  name,
  description,
  createdBy,
  memberIds,
  members,
  expenses,
  balances,
  settlements,
  createdAt,
  updatedAt
}
```

### `groups/{groupId}/expenses/{expenseId}`

```js
{
  title,
  amount,
  note,
  paidByUserId,
  splitType,
  splits,
  createdAt
}
```

## OTP Notes

The app has a mock OTP fallback when Firebase config is missing. In mock mode,
use OTP `123456`. With Firebase configured, use Firebase Phone Auth and the SMS
OTP sent to the mobile number.

## Backend Alternative

If you choose Node.js + Express later, keep the current service API shape and
replace `src/services/groupService.js`, `src/services/userService.js`, and
`src/services/authService.js` with REST/WebSocket calls. The screens and
contexts already call service functions rather than direct local state.
