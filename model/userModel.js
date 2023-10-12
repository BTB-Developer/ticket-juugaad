const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
    },
    lname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    phonenumber: {
        type: Number,
        default: null,
    },
    address: {
        type: String,
        default: "",
    },
    country: {
        type: String,
        default: "",
    },
    state: {
        type: String,
        default: "",
    },
    city: {
        type: String,
        default: "",
    },
    pincode: {
        type: Number,
        default: null,
    },
    role: {
        type: String,
        required: true,
        default: "user",
    },
    resetpasswordtoken: {
        type: String,
        default: "",
    },
    savedevents: [
        {
            type: String,
            default: null,
        },
    ],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
