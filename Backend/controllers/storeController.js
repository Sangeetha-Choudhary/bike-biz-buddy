import mongoose from 'mongoose';
import Store from '../models/Store.js';
import User from '../models/User.js';
import bcrypt from "bcryptjs";
import { checkPermission } from "../middleware/authMiddleware.js";

// controller to handle the store creation and admin assignment
export const createStore = async(req, res) => {
    const {
        storename, address, googlemaplink, city, latitude, longitude,
        phone, whatsapp, state, storeemail, pancard, gstnumber, password
    } = req.body;

    try{
        // create a new store
        const newStore = new Store({
            storename, address, googlemaplink, city, latitude, longitude,
            phone, whatsapp, state, storeemail, pancard, gstnumber, password
        });
        await newStore.save();

        res.status(201).json({
            message: "New store created successfully.",
            store: newStore,
        });
    } catch(error){
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                message: `Duplicate field value for ${field}: ${error.keyValue[field]}. Please use another value.`,
            });
        }

        res.status(500).json({
            message: 'Error creating store.',
            error: error.message,
        });
    }
};

export const getStores = async(req, res) => {
    try {
        let stores;
        const { includeDeleted } = req.query;
        
        if(req.user.role === 'global_admin'){
            // If includeDeleted=true, show all stores including soft-deleted ones
            if (includeDeleted === 'true') {
                stores = await Store.find().lean();
            } else {
                // By default, the pre('find') middleware will filter out deleted stores
                stores = await Store.find().lean();
            }
        } else {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to view stores.' });
        }
        res.status(200).json(stores);
    } catch(error){
        res.status(500).json({ message: 'Error fetching stores.', error: error.message });
    }
};

// Soft delete a store
export const softDeleteStore = async(req, res) => {
    try {
        const { id } = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid store ID' });
        }

        // Check if store exists and is not already deleted
        const store = await Store.findById(id);
        if(!store) {
            return res.status(404).json({ message: 'Store not found' });
        }

        if(store.isDeleted) {
            return res.status(400).json({ message: 'Store already deleted' });
        }

        // Soft delete the store using the static method
        const deletedStore = await Store.softDelete(id, req.user._id);

        res.status(200).json({
            message: 'Store successfully deleted',
            store: deletedStore
        });
    } catch(error) {
        res.status(500).json({
            message: 'Error deleting store',
            error: error.message
        });
    }
};

// Restore a soft-deleted store
export const restoreStore = async(req, res) => {
    try {
        const { id } = req.params;

        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid store ID' });
        }

        // Check if store exists and is deleted
        const store = await Store.findOne({ _id: id, isDeleted: true });
        if(!store) {
            return res.status(404).json({ message: 'Deleted store not found' });
        }

        // Restore the store using the static method
        const restoredStore = await Store.restore(id);

        res.status(200).json({
            message: 'Store successfully restored',
            store: restoredStore
        });
    } catch(error) {
        res.status(500).json({
            message: 'Error restoring store',
            error: error.message
        });
    }
};

// Edit/Update a store
export const updateStore = async(req, res) => {
    try {
        const { id } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid store ID' });
        }
        
        // Check if store exists
        const store = await Store.findById(id);
        if(!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        
        // Extract fields from request body
        const {
            storename, address, googlemaplink, city, latitude, longitude,
            phone, whatsapp, state, storeemail, pancard, gstnumber, status
        } = req.body;
        
        // Prepare update object with only the fields that are provided
        const updateData = {};
        
        if (storename !== undefined) updateData.storename = storename;
        if (address !== undefined) updateData.address = address;
        if (googlemaplink !== undefined) updateData.googlemaplink = googlemaplink || null;
        if (city !== undefined) updateData.city = city;
        if (latitude !== undefined) updateData.latitude = latitude;
        if (longitude !== undefined) updateData.longitude = longitude;
        if (phone !== undefined) updateData.phone = phone;
        if (whatsapp !== undefined) updateData.whatsapp = whatsapp;
        if (state !== undefined) updateData.state = state;
        if (storeemail !== undefined) updateData.storeemail = storeemail;
        if (pancard !== undefined) updateData.pancard = pancard || null;
        if (gstnumber !== undefined) updateData.gstnumber = gstnumber || null;
        if (status !== undefined) updateData.status = status;
        
        // Update the store with validated data
        const updatedStore = await Store.findByIdAndUpdate(
            id, 
            { $set: updateData }, 
            { new: true, runValidators: true }
        );
        
        res.status(200).json({
            message: 'Store updated successfully',
            store: updatedStore
        });
    } catch(error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue)[0];
            return res.status(400).json({
                message: `Duplicate field value for ${field}: ${error.keyValue[field]}. Please use another value.`,
            });
        }
        
        res.status(500).json({
            message: 'Error updating store',
            error: error.message
        });
    }
};

// Get a single store by ID
export const getStoreById = async(req, res) => {
    try {
        const { id } = req.params;
        
        if(!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid store ID' });
        }
        
        const store = await Store.findById(id);
        if(!store) {
            return res.status(404).json({ message: 'Store not found' });
        }
        
        res.status(200).json(store);
    } catch(error) {
        res.status(500).json({
            message: 'Error fetching store',
            error: error.message
        });
    }
};

