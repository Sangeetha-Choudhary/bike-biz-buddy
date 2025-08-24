import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import connectDB from '../config/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();
connectDB();

const demoAccounts = [
  {
    username: 'Global Admin',
    email: 'admin@bikebiz.com',
    password: 'admin123',
    role: 'global_admin',
    store: null
  },
  {
    username: 'Rajesh Patel',
    email: 'store@mumbai.com',
    password: 'store123',
    role: 'store_admin',
    store: 'Mumbai Central Store'
  },
  {
    username: 'Amit Sharma',
    email: 'store@delhi.com',
    password: 'store123',
    role: 'store_admin',
    store: 'Delhi Karol Bagh Store'
  },
  {
    username: 'Karthik Reddy',
    email: 'store@bangalore.com',
    password: 'store123',
    role: 'store_admin',
    store: 'Bangalore Koramangala Store'
  },
  {
    username: 'Priya Sharma',
    email: 'sales1@mumbai.com',
    password: 'sales123',
    role: 'sales_executive',
    store: 'Mumbai Central Store'
  },
  {
    username: 'Rohit Kumar',
    email: 'sales2@mumbai.com',
    password: 'sales123',
    role: 'sales_executive',
    store: 'Mumbai Central Store'
  },
  {
    username: 'Neha Singh',
    email: 'sales1@delhi.com',
    password: 'sales123',
    role: 'sales_executive',
    store: 'Delhi Karol Bagh Store'
  },
  {
    username: 'Suresh Patil',
    email: 'admin@wakad.com',
    password: 'admin123',
    role: 'store_admin',
    store: 'Mumbai Central Store'
  },
  {
    username: 'Anita Kulkarni',
    email: 'executive@wakad.com',
    password: 'exec123',
    role: 'sales_executive',
    store: 'Mumbai Central Store'
  },
  {
    username: 'Vikram Deshmukh',
    email: 'procurement@pune.com',
    password: 'proc123',
    role: 'procurement_admin',
    store: null
  },
  {
    username: 'Ravi Mehta',
    email: 'procurement@mumbai.com',
    password: 'proc123',
    role: 'procurement_admin',
    store: null
  },
  {
    username: 'Prashant Jadhav',
    email: 'exec1@pune-procurement.com',
    password: 'exec123',
    role: 'procurement_executive',
    store: null
  },
  {
    username: 'Sneha Bhosale',
    email: 'exec2@pune-procurement.com',
    password: 'exec123',
    role: 'procurement_executive',
    store: null
  },
  {
    username: 'Arjun Iyer',
    email: 'exec1@mumbai-procurement.com',
    password: 'exec123',
    role: 'procurement_executive',
    store: null
  }
];

const importData = async () => {
  try {
    await User.deleteMany();
    
    // Hash passwords before inserting
    const hashedAccounts = await Promise.all(
      demoAccounts.map(async (account) => {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(account.password, saltRounds);
        return {
          ...account,
          password: hashedPassword
        };
      })
    );
    
    await User.insertMany(hashedAccounts);
    console.log('Demo accounts imported successfully!');
    console.log('You can now login with any of these accounts:');
    demoAccounts.forEach(account => {
      console.log(`${account.role}: ${account.email} / ${account.password}`);
    });
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData();
