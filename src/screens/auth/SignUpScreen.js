import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import CustomTextInput from "../../components/common/TextInput";
import Button from "../../components/common/Button";
import FormContainer from "../../components/auth/FormContainer";
import ThemeToggle from "../../components/common/ThemeToggle";

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [agreeTerms, setAgreeTerms] = useState(false);
  const { theme } = useTheme();

  const { sign_up, error, clearError } = useAuth();

  useEffect(() => {
    if (error) {
      Alert.alert("Registration Error", error);
      clearError();
    }
  }, [error]);

  const validateForm = () => {
    const newErrors = {};

    if (!name) {
      newErrors.name = "Full name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreeTerms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    setLoading(true);
    const result = await sign_up(name, email, password, confirmPassword);
    setLoading(false);

    if (!result.success) {
      Alert.alert("Registration Failed", result.error);
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
        title="Create Account"
        subtitle="Join us and start managing your shared expenses with groups"
      >
        <View style={styles.form}>
          <CustomTextInput
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) {
                setErrors({ ...errors, name: "" });
              }
            }}
            error={errors.name}
            autoCapitalize="words"
          />

          <CustomTextInput
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: "" });
              }
            }}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <CustomTextInput
            label="Password"
            placeholder="Enter a password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              if (errors.password) {
                setErrors({ ...errors, password: "" });
              }
            }}
            error={errors.password}
            secureTextEntry
          />

          <CustomTextInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              if (errors.confirmPassword) {
                setErrors({ ...errors, confirmPassword: "" });
              }
            }}
            error={errors.confirmPassword}
            secureTextEntry
          />

          <View style={styles.termsContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => {
                setAgreeTerms(!agreeTerms);
                if (errors.terms) {
                  setErrors({ ...errors, terms: "" });
                }
              }}
            >
              <View
                style={[
                  styles.checkboxBox,
                  agreeTerms && styles.checkboxBoxChecked,
                ]}
              >
                {agreeTerms && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.termsText}>
                <Text style={styles.agreeText}>
                  I agree to the{" "}
                  <Text style={styles.link}>Terms & Conditions</Text>
                </Text>
              </View>
            </TouchableOpacity>
            {errors.terms && (
              <Text style={styles.errorText}>{errors.terms}</Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              disabled={loading}
            />
          </View>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
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
    termsContainer: {
      marginBottom: 24,
    },
    checkbox: {
      flexDirection: "row",
      alignItems: "flex-start",
    },
    checkboxBox: {
      width: 20,
      height: 20,
      borderWidth: 1.5,
      borderColor: theme.border,
      borderRadius: 4,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 10,
      marginTop: 2,
      backgroundColor: theme.surface,
    },
    checkboxBoxChecked: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    checkmark: {
      color: theme.surface,
      fontSize: 14,
      fontWeight: "bold",
    },
    termsText: {
      flex: 1,
    },
    agreeText: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    link: {
      color: theme.primary,
      fontWeight: "600",
    },
    errorText: {
      color: theme.danger,
      fontSize: 12,
      marginTop: 6,
      fontWeight: "500",
      marginLeft: 30,
    },
    buttonContainer: {
      marginTop: 8,
      marginBottom: 20,
    },
    loginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 16,
    },
    loginText: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    loginLink: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.primary,
    },
  });

export default SignUpScreen;
