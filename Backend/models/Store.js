import mongoose from 'mongoose';

const StoreSchema = new mongoose.Schema(
  {
    storename: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    googlemaplink: {
      type: String,
      // unique: true,
      // sparse: true,
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
    },
    latitude: {
      type: Number,
      // required: [true, 'Latitude is required'],
      required: false,
    },
    longitude: {
      type: Number,
      // required: [true, 'Longitude is required'],
      required: false,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    whatsapp: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      trim: true,
    },
    storeemail: {
      type: String,
      required: [true, "Store email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    pancard: {
      type: String,
      // required: [true, 'Pancard number is required'],
      required: false,
      // unique: true,
      trim: true,
    },
    gstnumber: {
      type: String,
      // required: [true, 'GST number is required'],
      required: false,
      // unique: true,
      trim: true,
    },
    // status: {
    //   type: String,
    //   enum: ['active', 'inactive'],
    //   default: 'active',
    // },
    // The store references its admin user by their unique ID.
    storeAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // Removed 'sparse: true' to ensure no unique constraint
    },
  },
  { timestamps: true },
);

const Store = mongoose.model('Store', StoreSchema);
export default Store;