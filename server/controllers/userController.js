import { pool } from "../configs/db.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function register(req, res) {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !email || !mobile || !password) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Check if user already exists (Email OR Mobile)
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE email = $1 OR mobile = $2",
      [email, mobile]
    );

    if (existingUser.rows.length > 0) {
      const user = existingUser.rows[0];
      if (user.email === email) {
        return res.json({ success: false, message: "Account already exists with this Email ID. Please login." });
      }
      if (user.mobile === mobile) {
        return res.json({ success: false, message: "Account already exists with this Mobile Number. Please login." });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into database
    const newUser = await pool.query(
      "INSERT INTO users (name, email, mobile, password) VALUES ($1, $2, $3, $4) RETURNING id, name, email, mobile",
      [name, email, mobile, hashedPassword]
    );

    const user = newUser.rows[0];

    // Create JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      success: true, message: "Registered successfully",
      user: { email: user.email, name: user.name, mobile: user.mobile },
    });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
}


export async function login(req, res) {
  try {
    const { email, password } = req.body; // 'email' field can contain Email OR Mobile

    if (!email || !password) {
      return res.json({ success: false, message: 'Missing email/mobile or password' });
    }

    // Determine if input is Email or Mobile
    const isEmail = email.includes('@');

    let query = '';
    let values = [];

    if (isEmail) {
      query = 'SELECT * FROM users WHERE email = $1';
      values = [email];
    } else {
      // Assume Mobile Number
      query = 'SELECT * FROM users WHERE mobile = $1';
      values = [email]; // Using the input value as mobile
    }

    // Check if user exists
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'No account found. Please register.' });
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: 'Incorrect credentials. Please try again.' });
    }

    // Create token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return success
    return res.json({
      success: true,
      message: 'Login successful',
      user: { name: user.name, email: user.email, mobile: user.mobile },
    });
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}


//   Check Auth : /api/user/is-auth

export async function isAuth(req, res) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.json({ success: false, message: 'Unauthorized: No token' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const result = await pool.query(
      'SELECT id, name, email, cart_items FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: 'User not found' });
    }

    const user = result.rows[0];

    return res.json({ success: true, user });
  } catch (error) {
    console.error(error.message);
    return res.json({ success: false, message: 'Invalid or expired token' });
  }
}




// logout User : api/user/logout
export async function logout(req, res) {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    });

    return res.json({ success: true, message: 'Logged Out' });
  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
}

// Update User Profile
export async function updateUserProfile(req, res) {
  try {
    const { userId } = req.body; // extracted by authUser middleware
    const { name, phone } = req.body;

    if (!name) {
      return res.json({ success: false, message: "Name is required" });
    }

    const result = await pool.query(
      "UPDATE users SET name = $1, mobile = $2 WHERE id = $3 RETURNING id, name, email, mobile",
      [name, phone, userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const updatedUser = result.rows[0];

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (error) {
    console.error(error.message);
    res.json({ success: false, message: error.message });
  }
}