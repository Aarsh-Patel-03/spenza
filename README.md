# Spenza - Expense Management App

Multi-user expense management application built with React Native and Expo.

## 📁 Project Structure

```
.
├── App.js                          # Main app entry point
├── index.js                        # Expo entry point
├── package.json                    # Dependencies
├── app.json                        # Expo configuration
├── assets/                         # Images, fonts, etc.
└── src/
    ├── screens/                    # Screen components
    │   └── auth/                   # Authentication screens
    │       ├── LoginScreen.js
    │       └── SignUpScreen.js
    ├── context/                    # State management
    │   └── AuthContext.js
    ├── services/                   # API services
    │   ├── authService.js
    │   └── api.js
    ├── components/                 # Reusable components
    │   ├── common/
    │   │   ├── Button.js
    │   │   └── TextInput.js
    │   └── auth/
    │       └── FormContainer.js
    ├── hooks/                      # Custom React hooks
    │   └── useAuth.js
    ├── navigation/                 # Navigation setup
    │   ├── AuthNavigator.js
    │   └── RootNavigator.js
    ├── constants/                  # Constants
    │   └── colors.js
    └── README.md                   # Detailed documentation
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Start the App

```bash
npm start
# or
yarn start
```

Then select:

- `i` for iOS
- `a` for Android
- `w` for Web

### 3. Configure API Endpoint

Update `src/services/api.js` with your backend URL:

```javascript
const BASE_URL = "http://your-backend-url.com/api";
```

## 🔐 Authentication

The app uses a context-based authentication system with persistent storage:

- **AuthContext** manages user state
- **AsyncStorage** persists login tokens
- **useAuth** hook provides easy access to auth functions

### Usage Example

```javascript
import { useAuth } from '../hooks/useAuth';

export default function MyComponent() {
  const { user, sign_in, sign_out } = useAuth();

  return (
    // Your component
  );
}
```

## 🎨 Features

✅ User Registration with validation
✅ User Login with persistent authentication
✅ Modular component structure
✅ Error handling and user feedback
✅ Custom form components with validation
✅ Easy-to-extend architecture
✅ Support for multiple users sharing groups

## 📋 Next Steps

1. **Backend Setup**: Create authentication endpoints
2. **Update API Calls**: Connect to real backend in `authService.js`
3. **App Screens**: Create screens for authenticated users
4. **User Groups**: Implement shared expense groups
5. **Database**: Set up user and group management

## 🔧 Configuration

See `src/constants/colors.js` for theme customization.

## 📚 Documentation

See `src/README.md` for detailed structure documentation.
