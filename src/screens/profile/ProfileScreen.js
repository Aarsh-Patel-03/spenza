import React, { useMemo, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Button from "../../components/common/Button";
import CustomTextInput from "../../components/common/TextInput";
import { useAuth } from "../../hooks/useAuth";
import { useGroups } from "../../hooks/useGroups";
import { useTheme } from "../../hooks/useTheme";

const ProfileScreen = () => {
  const { theme } = useTheme();
  const { user, sign_out, update_profile } = useAuth();
  const { analytics } = useGroups();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [mobile, setMobile] = useState(user?.mobile || "");
  const [upiId, setUpiId] = useState(user?.upiId || "");
  const [errors, setErrors] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const initials = useMemo(() => {
    const fallback = email?.charAt(0) || "U";
    return (name || fallback)
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [email, name]);

  const validate = () => {
    const nextErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Name is required";
    }

    if (!email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = "Enter a valid email";
    }

    if (mobile.trim() && !/^\d{10}$/.test(mobile.trim())) {
      nextErrors.mobile = "Use a 10-digit mobile number";
    }
    if (upiId.trim() && !/^[\w.-]+@[\w.-]+$/.test(upiId.trim())) {
      nextErrors.upiId = "Enter a valid UPI ID";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    setIsSaving(true);
    const result = await update_profile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      mobile: mobile.trim(),
      upiId: upiId.trim().toLowerCase(),
    });
    setIsSaving(false);

    if (result.success) {
      Alert.alert("Profile updated", "Your profile changes have been saved.");
    } else {
      Alert.alert("Update failed", result.error);
    }
  };

  const handleReset = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setMobile(user?.mobile || "");
    setUpiId(user?.upiId || "");
    setErrors({});
  };

  const styles = getStyles(theme);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.profileHeader,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <Text style={[styles.avatarText, { color: theme.surface }]}>
            {initials}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: theme.text }]}>
            {user?.name || "Your profile"}
          </Text>
          <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
            {user?.email || "Add your account details"}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <MaterialCommunityIcons
            name="account-group-outline"
            size={20}
            color={theme.primary}
          />
          <Text style={[styles.statValue, { color: theme.text }]}>
            {analytics.totalGroups}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Groups
          </Text>
        </View>
        <View
          style={[
            styles.statCard,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <MaterialCommunityIcons
            name="receipt-text-outline"
            size={20}
            color={theme.primary}
          />
          <Text style={[styles.statValue, { color: theme.text }]}>
            ₹{analytics.totalExpenses}
          </Text>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>
            Expenses
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.formCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Account details
        </Text>

        <CustomTextInput
          label="Full name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={(value) => {
            setName(value);
            if (errors.name) setErrors({ ...errors, name: "" });
          }}
          error={errors.name}
          autoCapitalize="words"
        />
        <CustomTextInput
          label="Email address"
          placeholder="Enter your email"
          value={email}
          onChangeText={(value) => {
            setEmail(value);
            if (errors.email) setErrors({ ...errors, email: "" });
          }}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <CustomTextInput
          label="Mobile number"
          placeholder="Optional 10-digit mobile"
          value={mobile}
          onChangeText={(value) => {
            setMobile(value.replace(/\D/g, "").slice(0, 10));
            if (errors.mobile) setErrors({ ...errors, mobile: "" });
          }}
          error={errors.mobile}
          keyboardType="phone-pad"
        />
        <CustomTextInput
          label="UPI ID"
          placeholder="e.g. aarsh@upi"
          value={upiId}
          onChangeText={(value) => {
            setUpiId(value);
            if (errors.upiId) setErrors({ ...errors, upiId: "" });
          }}
          error={errors.upiId}
          autoCapitalize="none"
        />

        <View style={styles.actionRow}>
          <Button
            title="Reset"
            variant="secondary"
            onPress={handleReset}
            style={styles.actionButton}
          />
          <Button
            title="Save"
            onPress={handleSave}
            loading={isSaving}
            disabled={isSaving}
            style={styles.actionButton}
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: theme.border }]}
        onPress={sign_out}
      >
        <MaterialCommunityIcons
          name="logout"
          size={20}
          color={theme.danger}
        />
        <Text style={[styles.logoutText, { color: theme.danger }]}>
          Log out
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const getStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: 16,
      paddingBottom: 28,
      gap: 16,
    },
    profileHeader: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      marginRight: 14,
    },
    avatarText: {
      fontSize: 20,
      fontWeight: "700",
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 13,
    },
    statsRow: {
      flexDirection: "row",
      gap: 10,
    },
    statCard: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 12,
      padding: 14,
    },
    statValue: {
      fontSize: 18,
      fontWeight: "700",
      marginTop: 8,
    },
    statLabel: {
      fontSize: 12,
      marginTop: 2,
    },
    formCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      marginBottom: 16,
    },
    actionRow: {
      flexDirection: "row",
      gap: 10,
      marginTop: 4,
    },
    actionButton: {
      flex: 1,
    },
    logoutButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderRadius: 12,
      paddingVertical: 14,
      gap: 8,
      backgroundColor: theme.surface,
    },
    logoutText: {
      fontSize: 15,
      fontWeight: "600",
    },
  });

export default ProfileScreen;
