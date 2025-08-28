import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log(user);

    if (!user) {
      
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Role → dashboard mapping
    const roleBasedRedirect = {
      global_admin: "/dashboard/admin",
      store_admin: "/dashboard/storeadmin",
      procurement_admin: "/dashboard/procurementadmin",
      sales_executive: "/dashboard/salesexecutive",
      procurement_executive: "/dashboard/procurementexecutive",
    };

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      redirectUrl: roleBasedRedirect[user.role] || "/dashboard",
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Signup

export const createUser = async (req, res) => {
  const { username, email, password, role, store, phone } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
      store,
      phone,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        store: user.store,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};  

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    // console.log(users);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
