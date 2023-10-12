const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        orderid: {
            type: Number,
            unique: true,
            required: true,
        },
        eventid: {
            type: String,
            required: true,
        },
        userid: {
            type: String,
            required: true,
        },
        paymentid: {
            type: String,
            default: null,
        },
        numberofticketstopurchase: {
            type: Array,
            required: true,
        },
        paymentamount: {
            type: Number,
            required: true,
        },
        paymentstatus: {
            type: Boolean,
            required: true,
            default: false,
        },
        paymentdate: {
            type: Date,
        },
        discountAppliedAmount: {
            type: Number,
            default: null,
        },
        promocodeId: {
            type: String,
            default: null,
        },
        pageRefreshed: {
            type: Boolean,
            required: true,
            default: false,
        },
        billing_information: {
            user_fname: {
                type: String,
                default: null,
            },
            user_lname: {
                type: String,
                default: null,
            },
            user_email: {
                type: String,
                default: null,
            },
            user_address: {
                type: String,
                default: null,
            },
            user_country: {
                type: String,
                default: null,
            },
            user_state: {
                type: String,
                default: null,
            },
            user_city: {
                type: String,
                default: null,
            },
            user_pincode: {
                type: String,
                default: null,
            },
        },
        ticketCancelled: {
            type: Boolean,
            required: true,
            default: false,
        },
        eventCancelled: {
            type: Boolean,
            required: true,
            default: false,
        },
        refundAmount: {
            type: Number,
            default: null,
        },
        refundid: {
            type: String,
            dafult: null,
        },
    },
    { versionKey: 0, timestamps: true }
);

const Order = mongoose.model("orders", orderSchema);

module.exports = Order;
