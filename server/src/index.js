import cors from "cors";
import "dotenv/config";
import express from "express";
import rateLimit from "express-rate-limit";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";
import twilio from "twilio";

const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const normalizeMobile = (mobile = "") => mobile.replace(/\D/g, "");

const signToken = (user) =>
  jwt.sign(
    { sub: user.id, mobile: user.mobile },
    process.env.JWT_SECRET,
    { expiresIn: "30d" },
  );

const requireAuth = (req, res, next) => {
  const token = req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Missing token" });
  }

  try {
    req.auth = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

app.post("/auth/send-otp", otpLimiter, async (req, res) => {
  const mobile = normalizeMobile(req.body.mobile);

  if (!/^\d{10}$/.test(mobile)) {
    return res.status(400).json({ message: "Use a valid 10-digit mobile." });
  }

  await twilioClient.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({ to: `+91${mobile}`, channel: "sms" });

  res.json({ success: true });
});

app.post("/auth/verify-otp", otpLimiter, async (req, res) => {
  const mobile = normalizeMobile(req.body.mobile);
  const code = req.body.otp;

  if (!/^\d{10}$/.test(mobile) || !/^\d{6}$/.test(code)) {
    return res.status(400).json({ message: "Invalid mobile or OTP." });
  }

  const verification = await twilioClient.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: `+91${mobile}`, code });

  if (verification.status !== "approved") {
    return res.status(401).json({ message: "OTP verification failed." });
  }

  const userId = `mobile-${mobile}`;
  const userRef = db.collection("users").doc(userId);
  const snapshot = await userRef.get();
  const user = {
    id: userId,
    name: snapshot.exists ? snapshot.data().name : req.body.name || "User",
    mobile,
    upiId: snapshot.exists ? snapshot.data().upiId || "" : "",
    isMobileVerified: true,
  };

  await userRef.set(
    {
      ...user,
      createdAt: snapshot.exists
        ? snapshot.data().createdAt
        : admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true },
  );

  res.json({ token: signToken(user), user });
});

app.get("/users/search", requireAuth, async (req, res) => {
  const mobile = normalizeMobile(req.query.mobile);

  if (!mobile) {
    return res.json([]);
  }

  const snapshot = await db
    .collection("users")
    .where("mobile", "==", mobile)
    .where("isMobileVerified", "==", true)
    .limit(5)
    .get();

  res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
});

app.get("/groups", requireAuth, async (req, res) => {
  const snapshot = await db
    .collection("groups")
    .where("memberIds", "array-contains", req.auth.sub)
    .orderBy("updatedAt", "desc")
    .get();

  res.json(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
});

app.post("/groups", requireAuth, async (req, res) => {
  const memberIds = Array.from(new Set([req.auth.sub, ...req.body.memberIds]));
  const groupRef = await db.collection("groups").add({
    name: req.body.name,
    description: req.body.description || "",
    createdBy: req.auth.sub,
    memberIds,
    members: req.body.members || [],
    expenses: [],
    settlements: [],
    balances: [],
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  res.status(201).json({ id: groupRef.id });
});

app.post("/groups/:groupId/members", requireAuth, async (req, res) => {
  const groupRef = db.collection("groups").doc(req.params.groupId);
  const snapshot = await groupRef.get();

  if (!snapshot.exists || !snapshot.data().memberIds.includes(req.auth.sub)) {
    return res.status(403).json({ message: "Not allowed." });
  }

  await groupRef.update({
    memberIds: admin.firestore.FieldValue.arrayUnion(req.body.member.id),
    members: admin.firestore.FieldValue.arrayUnion(req.body.member),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  res.json({ success: true });
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Desi Hisaab API running on port ${process.env.PORT || 3000}`);
});
