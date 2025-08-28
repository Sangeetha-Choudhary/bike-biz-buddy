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
      trim: true,
    },
    role: {
      type: String,
      enum: ['global_admin', 'store_admin', 'sales_executive', 'procurement_admin', 'procurement_executive'],
      required: true,
    },
    // The user references a store by its unique ID.
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Store',
      required: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);
export default User;