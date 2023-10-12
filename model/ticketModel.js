const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
    eventid: {
        type: String,
        required: true,
    },
    ticketname: {
        type: String,
        required: true,
    },
    numberoftickets: {
        type: Number,
        // If the value is null that means there are unlimited tickets
        default: null,
    },
    numberofticketsperuser: {
        type: Number,
        // If the value is null that means the user can buy any number of tickets
        default: null,
    },
    numberofticketssold: {
        type: Number,
        default: null,
    },
    ticketprice: {
        type: Number,
        required: true,
    },
    ticketdiscount: {
        type: Number,
        // If the value is null that means there is no discount on tickets
        default: null,
    },
    ticketdiscounttype: {
        type: String,
        // If the value is null that means there is no discount on tickets
        default: null,
    },
    // ticketdiscountlastdate: {
    //     type: Date,
    //     // If the value is null that means there is no discount on tickets
    //     default: null,
    // },
    // ticketdiscountlasttime: {
    //     type: "String",
    //     // If the value is null that means there is no discount on tickets
    //     default: null,
    // },
    ticketdiscountendperiod: {
        type: Date,
        default: null,
    },
    ticket_discount_active: {
        type: Boolean,
        required: true,
        default: false,
    },
    eventConfirmStatus: {
        type: Boolean,
        required: true,
        default: false,
    },
    eventCancelled: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const Ticket = mongoose.model("tickets", ticketSchema);

module.exports = Ticket;
