const mongoose = require("mongoose");

const contactUsSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    phonenumber: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
});

const ContactUs = mongoose.model("contact_us", contactUsSchema);

module.exports = ContactUs;
