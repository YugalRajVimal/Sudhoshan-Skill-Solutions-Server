// PhonePe OAuth Token Schema for Mongoose

import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const PhonePeOAuthTokenSchema = new Schema({
    access_token: {
        type: String,
        required: true
    },
    encrypted_access_token: {
        type: String,
        required: true
    },
    expires_in: {
        type: Number,
        required: true
    },
    issued_at: {
        type: Number,
        required: true
    },
    expires_at: {
        type: Number,
        required: true
    },
    session_expires_at: {
        type: Number,
        required: true
    },
    token_type: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const PhonePeOAuthToken = model('PhonePeOAuthToken', PhonePeOAuthTokenSchema);

export default PhonePeOAuthToken;