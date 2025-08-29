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
      unique: true,
      sparse: true, // Allow multiple null/undefined values
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
      unique: true,
      sparse: true,
      trim: true,
    },
    gstnumber: {
      type: String,
      // required: [true, 'GST number is required'],
      required: false,
      unique: true,
      sparse: true,
      trim: true,
    },
    // Soft delete fields
    isDeleted: {
      type: Boolean,
      default: false,
      index: true, // Index for query optimization
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    // The store references its admin user by their unique ID.
    storeAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    //   required: [true, 'Store must have an admin'],
      // unique: true,
      required: false,
    },
  },
  { timestamps: true },
);

// Create a query middleware that will apply to all find queries to filter out soft-deleted records
StoreSchema.pre(/^find/, function (next) {
  // 'this' refers to the query object
  // Only apply this filter if it's not explicitly overridden
  if (!this.getQuery().includeDeleted) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

// Add static method for soft delete
StoreSchema.statics.softDelete = async function (id, userId) {
  return this.findByIdAndUpdate(
    id,
    {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: userId,
      status: 'inactive'
    },
    { new: true }
  );
};

// Add static method for restore
StoreSchema.statics.restore = async function (id) {
  return this.findByIdAndUpdate(
    id,
    {
      isDeleted: false,
      deletedAt: null,
      deletedBy: null,
      status: 'active'
    },
    { new: true }
  );
};

const Store = mongoose.model('Store', StoreSchema);
export default Store;