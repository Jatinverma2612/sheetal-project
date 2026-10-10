import admin from "firebase-admin";
import initializeFirebase from "../config/firebase.js";

initializeFirebase();
import otpGenerator from "otp-generator";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Otp from "../models/otp.model.js";
import { signToken } from "../utils/jwt.js";
import sendEmail from "../utils/sendEmail.js";

const normalizePhone = (phone) => {
  if (!phone || typeof phone !== "string") {
    return null;
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits || null;
};

const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") {
    return null;
  }

  const normalized = email.trim().toLowerCase();
  return normalized || null;
};

const getFirebaseEmail = (decodedToken) => {
  const topLevelEmail = normalizeEmail(decodedToken?.email);
  if (topLevelEmail) {
    return topLevelEmail;
  }

  const providerEmail = decodedToken?.firebase?.identities?.email?.[0];
  return normalizeEmail(providerEmail);
};

const sendOtp = async (phoneNumber) => {
  try {
    const userRecord = await admin.auth().getUserByPhoneNumber(phoneNumber);
    return { verificationId: userRecord.uid };
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      const newUser = await admin.auth().createUser({ phoneNumber });
      return { verificationId: newUser.uid };
    }
    throw error;
  }
};

const sendEmailOtp = async (email) => {
  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  await Otp.create({ email, otp });

  const message = `
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Sheetal Admin</a>
        </div>
        <p style="font-size:1.1em">Hi,</p>
        <p>Use the following OTP to complete your Sign Up procedures. OTP is valid for 5 minutes</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />Sheetal Admin</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>Sheetal Admin Inc</p>
        </div>
      </div>
    </div>
  `;

  try {
    await sendEmail({
      email,
      subject: "Sheetal Admin - Email Verification",
      message,
    });
    return { success: true, message: "OTP sent to email successfully." };
  } catch (error) {
    console.error("Nodemailer Email Error:", error);
    throw new Error("Email could not be sent. Please try again.");
  }
};

const verifyEmailOtp = async (email, otp, currentUserId = null) => {
  const normalizedEmail = email?.trim().toLowerCase();
  const otpRecord = await Otp.findOne({ email: normalizedEmail, otp }).sort({
    createdAt: -1,
  });

  if (!otpRecord) {
    throw new Error("Invalid or expired OTP.");
  }

  // Delete used OTP
  await Otp.deleteOne({ _id: otpRecord._id });

  let userByEmail = await User.findOne({ email: normalizedEmail });
  let currentUser = null;
  let finalUser = null;

  if (currentUserId) {
    currentUser = await User.findById(currentUserId);
  }

  if (currentUser) {
    if (userByEmail) {
      if (userByEmail._id.toString() === currentUser._id.toString()) {
        finalUser = currentUser;
        if (!finalUser.isVerified) {
          finalUser.isVerified = true;
          await finalUser.save();
        }
      } else {
        finalUser = await mergeAccounts(currentUser, userByEmail);
        if (!finalUser.isVerified) {
          finalUser.isVerified = true;
          await finalUser.save();
        }
      }
    } else {
      currentUser.email = normalizedEmail;
      currentUser.isVerified = true;
      await currentUser.save();
      finalUser = currentUser;
    }
  } else {
    if (userByEmail) {
      finalUser = userByEmail;
      if (!finalUser.isVerified) {
        finalUser.isVerified = true;
        await finalUser.save();
      }
    } else {
      finalUser = await User.create({
        email: normalizedEmail,
        isVerified: true,
      });
    }
  }

  if (!finalUser) {
    throw new Error("Authentication failed to resolve a user.");
  }

  if (finalUser.status === "Inactive") {
    throw new Error(
      "This ID has been blocked by the admin due to some reasons, please contact the team for further procedures",
    );
  }

  if (normalizedEmail && finalUser.email !== normalizedEmail) {
    finalUser.email = normalizedEmail;
    await finalUser.save();
  }

  const token = signToken({ id: finalUser._id, role: finalUser.role });

  return {
    success: true,
    user: sanitizeUser(finalUser),
    token,
  };
};

const mergeAccounts = async (primary, secondary) => {
  if (!primary || !secondary) return primary || secondary;

  // 1. Move Orders
  await Order.updateMany(
    { user: secondary._id },
    { $set: { user: primary._id } },
  );

  // 2. Merge Wishlist (Unique items)
  const primaryWishlist = Array.isArray(primary.wishlist) ? primary.wishlist : [];
  const secondaryWishlist = Array.isArray(secondary.wishlist) ? secondary.wishlist : [];
  const mergedWishlist = [
    ...new Set([
      ...primaryWishlist.filter(Boolean).map((id) => id.toString()),
      ...secondaryWishlist.filter(Boolean).map((id) => id.toString()),
    ]),
  ];
  primary.wishlist = mergedWishlist;

  // 3. Merge Cart (Unique products)
  const cartMap = new Map();
  if (Array.isArray(primary.cart) && primary.cart.length > 0) {
    primary.cart.forEach((item) => {
      if (item && item.product) {
        cartMap.set(item.product.toString(), item.quantity || 1);
      }
    });
  }
  if (Array.isArray(secondary.cart) && secondary.cart.length > 0) {
    secondary.cart.forEach((item) => {
      if (item && item.product) {
        const prodId = item.product.toString();
        if (cartMap.has(prodId)) {
          cartMap.set(prodId, cartMap.get(prodId) + (item.quantity || 1));
        } else {
          cartMap.set(prodId, item.quantity || 1);
        }
      }
    });
  }

  primary.cart = [];
  for (const [product, quantity] of cartMap.entries()) {
    primary.cart.push({ product, quantity });
  }

  // 4. Update primary credentials / profile
  // If primary is skipping fields, fill from secondary
  if (!primary.name && secondary.name) primary.name = secondary.name;
  if (!primary.email && secondary.email) primary.email = secondary.email;
  if (!primary.phoneNumber && secondary.phoneNumber)
    primary.phoneNumber = secondary.phoneNumber;
  if (!primary.profilePicture && secondary.profilePicture)
    primary.profilePicture = secondary.profilePicture;

  await primary.save();
  await User.deleteOne({ _id: secondary._id });
  return primary;
};

const verifyFirebaseIdToken = async (idToken, currentUserId = null) => {
  const decodedToken = await admin.auth().verifyIdToken(idToken);
  const rawPhoneNumber = decodedToken.phone_number || decodedToken.phoneNumber;
  const phoneNumber = normalizePhone(rawPhoneNumber);
  const email = getFirebaseEmail(decodedToken);
  const name = decodedToken.name || undefined;
  const picture = decodedToken.picture || undefined;

  if (!phoneNumber && !email) {
    throw new Error(
      "Neither phone number nor email found in Firebase ID token.",
    );
  }

  let userByPhone = null;
  let userByEmail = null;
  let currentUser = null;
  let finalUser = null;

  if (phoneNumber) {
    userByPhone = await User.findOne({ phoneNumber });
  }
  if (email) {
    userByEmail = await User.findOne({ email });
  }
  if (currentUserId) {
    currentUser = await User.findById(currentUserId);
  }

  // Scenario A: User is already logged in (Linking account)
  if (currentUser) {
    // 1. Linking Phone
    if (phoneNumber) {
      if (userByPhone) {
        if (userByPhone._id.toString() === currentUser._id.toString()) {
          // Already linked to same user, do nothing
          finalUser = currentUser;
        } else {
          // Linked to ANOTHER user -> MERGE
          finalUser = await mergeAccounts(currentUser, userByPhone);
        }
      } else {
        // Phone not used by anyone -> Update current user
        currentUser.phoneNumber = phoneNumber;
        await currentUser.save();
        finalUser = currentUser;
      }
    }

    // 2. Linking Email
    if (email) {
      const targetUser = finalUser || currentUser;

      if (userByEmail) {
        if (userByEmail._id.toString() === targetUser._id.toString()) {
          // Already linked
          finalUser = targetUser;
        } else {
          // Linked to another -> MERGE
          finalUser = await mergeAccounts(targetUser, userByEmail);
        }
      } else {
        // Email not used -> Update target user
        targetUser.email = email;
        await targetUser.save();
        finalUser = targetUser;
      }
    }
  }
  // Scenario B: User is NOT logged in (Login/Signup)
  else {
    if (userByPhone && userByEmail) {
      if (userByPhone._id.toString() === userByEmail._id.toString()) {
        finalUser = userByPhone;
      } else {
        finalUser = await mergeAccounts(userByPhone, userByEmail);
      }
    } else if (userByPhone) {
      finalUser = userByPhone;
      // checking if we gained an email from token that is not in DB
      if (email && !finalUser.email) {
        finalUser.email = email;
        await finalUser.save();
      }
    } else if (userByEmail) {
      finalUser = userByEmail;
      // checking if we gained a phone from token
      if (phoneNumber && !finalUser.phoneNumber) {
        finalUser.phoneNumber = phoneNumber;
        await finalUser.save();
      }
    } else {
      // New User
      const newUserData = {
        isVerified: true,
      };
      if (phoneNumber) newUserData.phoneNumber = phoneNumber;
      if (email) newUserData.email = email;
      if (name) newUserData.name = name;
      if (picture) newUserData.profilePicture = picture;

      finalUser = await User.create(newUserData);
    }
  }

  // Safety check
  if (!finalUser) {
    if (currentUser)
      finalUser = currentUser; // Fallback
    else throw new Error("Authentication failed to resolve a user.");
  }

  if (finalUser.status === "Inactive") {
    throw new Error(
      "This ID has been blocked by the admin due to some reasons, please contact the team for further procedures",
    );
  }

  const token = signToken({ id: finalUser._id, role: finalUser.role });

  return {
    user: sanitizeUser(finalUser),
    token,
  };
};

const sanitizeUser = (user) => {
  return {
    id: user._id,
    phoneNumber: user.phoneNumber,
    email: user.email,
    role: user.role,
    name: user.name,
    status: user.status,
    alternativeMobileNumber: user.alternativeMobileNumber,
    gender: user.gender,
    dateOfBirth: user.dateOfBirth
      ? user.dateOfBirth.toISOString().split("T")[0]
      : undefined,
  };
};

export { sendOtp, verifyFirebaseIdToken, sendEmailOtp, verifyEmailOtp };
