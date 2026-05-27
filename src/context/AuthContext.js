import React, { createContext, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import * as authService from "../services/authService";
import { updateUserProfile } from "../services/userService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case "RESTORE_TOKEN":
          return {
            ...prevState,
            userToken: action.payload.token,
            user: action.payload.user,
            isLoading: false,
            isSignout: false,
          };

        case "SIGN_IN":
          return {
            ...prevState,
            isSignout: false,
            userToken: action.payload.token,
            user: action.payload.user,
          };

        case "SIGN_UP":
          return {
            ...prevState,
            isSignout: false,
            userToken: action.payload.token,
            user: action.payload.user,
          };

        case "SIGN_OUT":
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            user: null,
          };

        case "UPDATE_PROFILE":
          return {
            ...prevState,
            user: {
              ...prevState.user,
              ...action.payload,
            },
          };

        case "SET_ERROR":
          return {
            ...prevState,
            error: action.payload,
          };

        case "CLEAR_ERROR":
          return {
            ...prevState,
            error: null,
          };

        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      user: null,
      error: null,
    },
  );

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedToken = await SecureStore.getItemAsync("userToken");
        const savedUser = await AsyncStorage.getItem("userData");

        if (savedToken && savedUser) {
          dispatch({
            type: "RESTORE_TOKEN",
            payload: {
              token: savedToken,
              user: JSON.parse(savedUser),
            },
          });
        } else {
          dispatch({
            type: "RESTORE_TOKEN",
            payload: {
              token: null,
              user: null,
            },
          });
        }
      } catch (e) {
        dispatch({
          type: "RESTORE_TOKEN",
          payload: {
            token: null,
            user: null,
          },
        });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    sign_in: useCallback(async (email, password) => {
      try {
        dispatch({ type: "CLEAR_ERROR" });

        const response = await authService.login(email, password);

        await SecureStore.setItemAsync("userToken", response.token);
        await AsyncStorage.setItem("userData", JSON.stringify(response.user));

        dispatch({
          type: "SIGN_IN",
          payload: {
            token: response.token,
            user: response.user,
          },
        });

        return { success: true };
      } catch (error) {
        const errorMessage = error.message || "Login failed. Please try again.";

        dispatch({ type: "SET_ERROR", payload: errorMessage });

        return { success: false, error: errorMessage };
      }
    }, []),

    sign_up: useCallback(async (name, email, password, confirmPassword) => {
      try {
        dispatch({ type: "CLEAR_ERROR" });

        if (password !== confirmPassword) {
          throw new Error("Passwords do not match.");
        }

        const response = await authService.register(name, email, password);

        await SecureStore.setItemAsync("userToken", response.token);
        await AsyncStorage.setItem("userData", JSON.stringify(response.user));

        dispatch({
          type: "SIGN_UP",
          payload: {
            token: response.token,
            user: response.user,
          },
        });

        return { success: true };
      } catch (error) {
        const errorMessage =
          error.message || "Registration failed. Please try again.";

        dispatch({ type: "SET_ERROR", payload: errorMessage });

        return { success: false, error: errorMessage };
      }
    }, []),

    // ── send_otp ─────────────────────────────────────────────────────────────
    send_otp: useCallback(async (mobile) => {
      try {
        dispatch({ type: "CLEAR_ERROR" });

        const confirmation = await authService.sendOtp(mobile);

        return { success: true, confirmation };
      } catch (error) {
        const errorMessage =
          error.message || "Could not send OTP. Please try again.";

        dispatch({ type: "SET_ERROR", payload: errorMessage });

        return { success: false, error: errorMessage };
      }
    }, []),

    // ── confirm_otp ──────────────────────────────────────────────────────────
    confirm_otp: useCallback(async ({ confirmation, otp, name }) => {
      try {
        dispatch({ type: "CLEAR_ERROR" });

        const response = await authService.confirmOtp({
          confirmation,
          otp,
          name,
        });

        await SecureStore.setItemAsync("userToken", response.token);
        await AsyncStorage.setItem("userData", JSON.stringify(response.user));

        dispatch({
          type: "SIGN_IN",
          payload: {
            token: response.token,
            user: response.user,
          },
        });

        return { success: true };
      } catch (error) {
        const errorMessage = error.message || "OTP verification failed.";

        dispatch({ type: "SET_ERROR", payload: errorMessage });

        return { success: false, error: errorMessage };
      }
    }, []),

    // ── sign_out ─────────────────────────────────────────────────────────────
    sign_out: useCallback(async () => {
      try {
        await SecureStore.deleteItemAsync("userToken");
        await AsyncStorage.removeItem("userData");

        dispatch({ type: "SIGN_OUT" });
      } catch (error) {
        console.log("Logout Error:", error);
      }
    }, []),

    // ── update_profile ───────────────────────────────────────────────────────
    update_profile: useCallback(
      async (profileUpdates) => {
        try {
          const updatedUser = { ...state.user, ...profileUpdates };

          const persistedUser = await updateUserProfile(
            state.user?.id,
            profileUpdates,
          );

          await AsyncStorage.setItem(
            "userData",
            JSON.stringify(persistedUser || updatedUser),
          );

          dispatch({ type: "UPDATE_PROFILE", payload: profileUpdates });

          return { success: true, user: persistedUser || updatedUser };
        } catch (error) {
          const errorMessage = error.message || "Profile update failed.";

          dispatch({ type: "SET_ERROR", payload: errorMessage });

          return { success: false, error: errorMessage };
        }
      },
      [state.user],
    ),

    // ── clearError ───────────────────────────────────────────────────────────
    clearError: useCallback(() => {
      dispatch({ type: "CLEAR_ERROR" });
    }, []),
  };

  return (
    <AuthContext.Provider value={{ ...state, ...authContext }}>
      {children}
    </AuthContext.Provider>
  );
};
