import nativeAuth from "@react-native-firebase/auth";
import { upsertVerifiedUser } from "./userService";

const normalizeMobile = (mobile) => mobile?.replace(/\D/g, "") ?? "";

const createMockConfirmation = (phoneNumber) => ({
  _isMock: true,
  confirm: async (otp) => {
    if (otp !== "123456") {
      throw new Error("Invalid OTP. Use 123456 in mock mode.");
    }

    return {
      user: {
        uid: "mock_uid_" + Date.now(),
        phoneNumber,
        getIdToken: async () => "mock_token_" + Date.now(),
      },
    };
  },
});

const getNativeAuth = () => {
  try {
    return nativeAuth();
  } catch (error) {
    console.warn(
      "[Auth] Native Firebase Auth is not available. Running in mock mode.",
      error?.message || error,
    );
    return null;
  }
};

export const sendOtp = async (mobile) => {
  const phoneNumber = `+91${mobile}`;
  const auth = getNativeAuth();

  if (!auth?.signInWithPhoneNumber) {
    console.log("[Mock] sendOtp ->", phoneNumber);
    return createMockConfirmation(phoneNumber);
  }

  try {
    return await auth.signInWithPhoneNumber(phoneNumber);
  } catch (error) {
    console.error("[sendOtp] Firebase error:", error);
    throw new Error(error.message || "Failed to send OTP. Please try again.");
  }
};

export const confirmOtp = async ({ confirmation, otp, name }) => {
  if (!confirmation) throw new Error("Please request an OTP first.");
  if (!otp || !/^\d{6}$/.test(otp)) {
    throw new Error("Enter a valid 6-digit OTP.");
  }

  let firebaseUser;

  try {
    const result = await confirmation.confirm(otp);
    firebaseUser = result.user;
  } catch (error) {
    console.error("[confirmOtp] Firebase error:", error);
    if (error.code === "auth/invalid-verification-code") {
      throw new Error("Invalid OTP. Please check and try again.");
    }
    if (error.code === "auth/code-expired") {
      throw new Error("OTP has expired. Please request a new one.");
    }
    throw new Error(error.message || "OTP verification failed.");
  }

  const mobile = normalizeMobile(firebaseUser.phoneNumber);

  const appUser = await upsertVerifiedUser({
    id: firebaseUser.uid,
    name: name?.trim() || undefined,
    mobile,
  });

  const token = firebaseUser.getIdToken
    ? await firebaseUser.getIdToken()
    : `mock_token_${Date.now()}`;

  return { token, user: appUser };
};

export const logout = async () => {
  const auth = getNativeAuth();

  if (auth?.currentUser) {
    await auth.signOut();
  }
};

export const login = async (email, password) => {
  if (!email || !password) throw new Error("Email and password are required.");
  if (!email.includes("@")) throw new Error("Invalid email format.");
  await new Promise((r) => setTimeout(r, 1000));
  return {
    token: "mock_token_" + Date.now(),
    user: { id: "1", name: "User", email, mobile: "", upiId: "", avatar: null },
  };
};

export const register = async (name, email, password) => {
  if (!name || !email || !password) throw new Error("All fields are required.");
  if (!email.includes("@")) throw new Error("Invalid email format.");
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters.");
  }
  await new Promise((r) => setTimeout(r, 1000));
  return {
    token: "mock_token_" + Date.now(),
    user: {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      mobile: "",
      upiId: "",
      avatar: null,
    },
  };
};

export const verifyToken = async (token) => {
  if (!token) throw new Error("Token is invalid.");
  return { valid: true };
};

export const refreshToken = async () => ({
  token: "mock_token_" + Date.now(),
});
