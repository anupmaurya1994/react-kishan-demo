import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/token.js";

/* =========================
   REGISTER
========================= */
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1️⃣ Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "First name, last name, email and password are required",
      });
    }

    // 2️⃣ Check if email is already taken
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Teacher with this email already exists",
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ Create teacher user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // 5️⃣ Response
    return res.status(201).json({
      success: true,
      message: "Teacher registered successfully",
      token: generateToken(user),
      firstName: user.firstName,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   LOGIN (SINGLE USER)
========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 2️⃣ Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found with this email",
      });
    }

    // 3️⃣ Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const remainingTime = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
      return res.status(403).json({
        success: false,
        message: `Account is temporarily locked due to multiple failed login attempts. Please try again in ${remainingTime} minutes.`,
      });
    }

    // 4️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      // Increment login attempts if incorrect password
      user.loginAttempts += 1;

      let message = "Incorrect password.";

      // Lock account if MAX_ATTEMPTS reached
      if (user.loginAttempts >= 3) {
        user.lockUntil = Date.now() + 30 * 60 * 1000; // Lock for 30 minutes
        message = "Account locked for 30 minutes due to 3 failed login attempts.";
      } else {
        const remainingAttempts = 3 - user.loginAttempts;
        message = `Incorrect password. You have ${remainingAttempts} attempts remaining before your account is locked.`;
      }

      await user.save();

      return res.status(401).json({
        success: false,
        message: message,
      });
    }

    // 5️⃣ Password matches - Reset attempts and lock status
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    // 6️⃣ Success
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user),
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =========================
   EDIT PROFILE
========================= */
export const editProfile = async (req, res) => {
  try {
    const { firstName, lastName, currentPassword, newPassword, confirmPassword } = req.body;

    // req.user is set by the `protect` middleware (without password field)
    // Re-fetch with password so we can verify current password
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ── 1. Update name fields if provided ──────────────────────────────────
    if (firstName !== undefined) {
      if (!firstName.trim()) {
        return res.status(400).json({ success: false, message: "First name cannot be empty" });
      }
      user.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (!lastName.trim()) {
        return res.status(400).json({ success: false, message: "Last name cannot be empty" });
      }
      user.lastName = lastName.trim();
    }

    // ── 2. Change password (only if any password field is provided) ─────────
    const wantsPasswordChange = currentPassword || newPassword || confirmPassword;

    if (wantsPasswordChange) {
      // All three fields are required for a password change
      if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "Current password, new password, and confirm password are all required to change your password",
        });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // New password and confirm password must match
      if (newPassword !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message: "New password and confirm password do not match",
        });
      }

      // New password must not be the same as current
      if (newPassword === currentPassword) {
        return res.status(400).json({
          success: false,
          message: "New password must be different from the current password",
        });
      }

      // Minimum length check
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters long",
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};