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
        message: "Invalid email or password",
      });
    }

    // 3️⃣ Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 4️⃣ Success
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token: generateToken(user),
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};