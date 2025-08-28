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

    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        // create a new store
        const newStore = new Store({
            storename, address, googlemaplink, city, latitude, longitude,
            phone, whatsapp, state, storeemail, pancard, gstnumber, password
        });
        await newStore.save({session});

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: "New store created successfully.",
            store: newStore,
        });
    } catch(error){
        await session.abortTransaction();
        session.endSession();
x
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
        if(req.user.role === 'global_admin'){
            stores = await Store.find();
        }else {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to view stores.' });
        }
        res.status(200).json(stores);
    } catch(error){
        res.status(500).json({ message: 'Error fetching stores.', error: error.message });
    }
};

