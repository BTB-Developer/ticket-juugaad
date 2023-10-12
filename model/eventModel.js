const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    eventName: {
        type: String,
        required: true,
        unique: true,
    },
    eventCategory: {
        type: Array,
        required: true,
    },
    // eventDate: {
    //     type: Date,
    //     required: true,
    // },
    // eventTime: {
    //     type: String,
    //     required: true,
    // },
    eventDateTime: {
        type: Date,
        required: true,
    },
    eventDuration: {
        type: String,
        required: true,
    },
    eventType: {
        type: String,
        required: true,
    },
    eventImage: {
        type: String,
        default: null,
    },
    eventDesc: {
        type: String,
        required: true,
    },
    eventLongLat: {
        type: String,
        required: true,
    },
    eventVenue: {
        type: String,
        required: true,
    },
    eventAddress: {
        type: String,
        required: true,
    },
    eventCountry: {
        type: String,
        required: true,
    },
    eventState: {
        type: String,
        required: true,
    },
    eventCity: {
        type: String,
        required: true,
    },
    eventPincode: {
        type: String,
        required: true,
    },
    tickets: [
        {
            type: String,
            required: true,
        },
    ],
    eventTicketBookingStartDateTime: {
        type: Date,
        required: true,
    },
    eventTicketBookingEndDateTime: {
        type: Date,
        required: true,
    },
    passServiceCharges: {
        type: Boolean,
        required: true,
    },
    cancellationBeforeHowManyDays: {
        type: Number,
        default: null,
    },
    refundAmount: {
        type: Number,
        default: null,
    },
    eventInstructions: {
        type: String,
        default: null,
    },
    eventCancelled: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const VenueEvent = mongoose.model("venue_event", eventSchema);

module.exports = VenueEvent;
