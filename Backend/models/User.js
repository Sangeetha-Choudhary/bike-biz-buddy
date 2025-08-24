import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      // default: 'employee123', // <-- default password
    },
    role: {
      type: String,
      enum: ['global_admin', 'store_admin', 'sales_executive', 'procurement_admin', 'procurement_executive'],
    },
    store: {
      type: String,
      enum: ['Mumbai Central Store', 'Delhi Karol Bagh Store', 'Bangalore Koramangala Store'],
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);
export default User;
