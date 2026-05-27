import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Button from "../../components/common/Button";
import CustomTextInput from "../../components/common/TextInput";
import ThemeToggle from "../../components/common/ThemeToggle";
import FormContainer from "../../components/auth/FormContainer";

import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const LoginScreen = () => {
  const { theme } = useTheme();
  const { send_otp, confirm_otp, error, clearError } = useAuth();

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (error) {
      Alert.alert("Authentication Error", error);
      clearError();
    }
  }, [clearError, error]);

  const validateMobile = () => {
    const nextErrors = {};
    if (!/^\d{10}$/.test(mobile)) {
      nextErrors.mobile = "Use a valid 10-digit mobile number";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSendOtp = async () => {
    if (!validateMobile()) return;

    try {
      setLoading(true);

      const result = await send_otp(mobile);

      if (result.success) {
        setConfirmation(result.confirmation);
        Alert.alert(
          "OTP Sent",
          result.confirmation?._isMock
            ? "Mock mode: use OTP 123456."
            : "Check your SMS inbox for the verification code.",
        );
      } else {
        Alert.alert("OTP Failed", result.error);
      }
    } catch (err) {
      Alert.alert("OTP Failed", err?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!/^\d{6}$/.test(otp)) {
      setErrors({ otp: "Enter the 6-digit OTP" });
      return;
    }

    try {
      setLoading(true);

      const result = await confirm_otp({ confirmation, otp, name });

      if (!result.success) {
        Alert.alert("Verification Failed", result.error);
      }
    } catch (err) {
      Alert.alert(
        "Verification Failed",
        err?.message || "OTP verification failed",
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = getStyles(theme);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <ThemeToggle style={styles.themeToggle} />

      <FormContainer
        title="Spenza"
        subtitle="Sign in or create your account with verified mobile OTP"
      >
        <View style={styles.form}>
          <CustomTextInput
            label="Full Name"
            placeholder="Optional for first login"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <CustomTextInput
            label="Mobile Number"
            placeholder="Enter 10-digit mobile number"
            value={mobile}
            onChangeText={(value) => {
              setMobile(value.replace(/\D/g, "").slice(0, 10));
              if (errors.mobile) setErrors({ ...errors, mobile: "" });
            }}
            error={errors.mobile}
            editable={!confirmation}
            keyboardType="phone-pad"
          />

          {confirmation && (
            <CustomTextInput
              label="OTP"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={(value) => {
                setOtp(value.replace(/\D/g, "").slice(0, 6));
                if (errors.otp) setErrors({ ...errors, otp: "" });
              }}
              error={errors.otp}
              keyboardType="number-pad"
            />
          )}

          <Button
            title={confirmation ? "Verify OTP" : "Send OTP"}
            onPress={confirmation ? handleVerifyOtp : handleSendOtp}
            loading={loading}
            disabled={loading}
          />

          {confirmation && (
            <TouchableOpacity
              style={styles.changeNumber}
              onPress={() => {
                setConfirmation(null);
                setOtp("");
              }}
            >
              <Text style={[styles.changeNumberText, { color: theme.primary }]}>
                Change mobile number
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </FormContainer>
    </KeyboardAvoidingView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      position: "relative",
    },
    themeToggle: {
      position: "absolute",
      top: 36,
      right: 16,
      zIndex: 10,
    },
    form: {
      flex: 1,
    },
    changeNumber: {
      alignItems: "center",
      marginTop: 18,
    },
    changeNumberText: {
      fontSize: 14,
      fontWeight: "600",
    },
  });

export default LoginScreen;
