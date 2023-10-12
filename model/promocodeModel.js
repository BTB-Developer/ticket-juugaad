const mongoose = require("mongoose");

const promocodeSchema = new mongoose.Schema({
    promocodeName: {
        type: String,
        required: true,
        unique: true,
    },
    promocodeDiscount: {
        type: Number,
        required: true,
    },
    promocodeDiscountType: {
        type: String,
        required: true,
    },
    promocodeCreatedAt: {
        type: Date,
        required: true,
    },
    promocodeCancelled: {
        type: Boolean,
        required: true,
        default: false,
    },
    promocodeEndDateTime: {
        type: Date,
        required: true,
    },
    promocodeActive: {
        type: Boolean,
        required: true,
        default: true,
    },
    promocodeUsage: {
        type: Number,
        required: true,
        default: 0,
    },
});

const PromoCode = mongoose.model("promocodes", promocodeSchema);

module.exports = PromoCode;
