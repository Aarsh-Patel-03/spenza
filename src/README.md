# Modular Authentication Structure

This directory contains the modular authentication system for Desi Hisaab.

## Directory Structure

```
src/
├── screens/
│   └── auth/
│       ├── LoginScreen.js       - Login form and logic
│       └── SignUpScreen.js      - Registration form and logic
├── context/
│   └── AuthContext.js           - Authentication state management with useReducer
├── services/
│   ├── authService.js           - API calls for login/register/verify
│   └── api.js                   - Base API configuration
├── components/
│   ├── common/
│   │   ├── Button.js            - Reusable button component
│   │   └── TextInput.js         - Reusable text input with validation
│   └── auth/
│       └── FormContainer.js     - Reusable form layout component
├── hooks/
│   └── useAuth.js               - Custom hook to access auth context
├── navigation/
│   ├── AuthNavigator.js         - Navigation stack for auth screens
│   └── RootNavigator.js         - Root navigator (handles auth/app navigation)
└── constants/
    └── colors.js                - Color constants
```

## How to Use

### 1. Authentication Context

The `AuthContext` manages all authentication state including:

- User token
- User data
- Loading states
- Error messages

### 2. Using Authentication in Components

Import the `useAuth` hook to access authentication:

```javascript
import { useAuth } from "../hooks/useAuth";

export default function MyComponent() {
  const { userToken, user, sign_in, sign_out, error } = useAuth();

  // Your component logic
}
```

### 3. API Integration

Update `src/services/authService.js` to call your actual backend:

```javascript
// In authService.js
export const login = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response;
};
```

### 4. Navigation

- If `userToken` is `null` → Show auth screens (Login/Register)
- If `userToken` exists → Show app screens (to be implemented)

## Key Features

✅ **Modular Design** - Easy to maintain and extend
✅ **State Management** - Redux-like pattern with useReducer
✅ **Persistent Authentication** - Uses AsyncStorage
✅ **Form Validation** - Built-in validation in components
✅ **Error Handling** - Centralized error management
✅ **Reusable Components** - Common UI components
✅ **Custom Hook** - Easy auth context access

## Next Steps

1. **Update API URL** in `src/services/api.js`
2. **Implement Backend** authentication endpoints
3. **Create App Navigator** for authenticated screens
4. **Add Social Login** (Google, Facebook, etc.)
5. **Implement Refresh Token** logic
6. **Add Terms & Privacy** screens

## Making Changes

- **Add new screens**: Create in `screens/` and add to navigator
- **Add API calls**: Use `api.js` utilities in `authService.js`
- **Add components**: Create in `components/` and reuse
- **Manage colors**: Update `constants/colors.js`
