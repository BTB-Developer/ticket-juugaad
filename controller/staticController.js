const moment = require("moment/moment");
const VenueEvent = require("../model/eventModel");
const Ticket = require("../model/ticketModel");
const ContactUs = require("../model/contactUsModel");

// Done
// This function will save the query in the database
async function contactUs(req, res, next) {
    try {
        let { firstname, lastname, email, phonenumber, message } = req.body;
        let newQuery = new ContactUs({
            firstname,
            lastname,
            email,
            phonenumber,
            message,
        });
        await newQuery.save().then(() => {
            return res.status(200).json({ result: true, data: "We will contact you soon." });
        });
    } catch (error) {
        console.log(`Error in staticController at contactUs : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will return only 8 or less than 8 functions
// It will be displayed on index and index_dashboard html pages
async function eventOnIndexPage(req, res, next) {
    try {
        let listEvent = [];
        let eventsToDisplay = [];
        let events = await VenueEvent.find({ eventCancelled: false });
        if (events.length > 8) {
            for (let index = 0; index < 8; index++) {
                listEvent.push(events[index]);
            }
        } else {
            listEvent = events;
        }
        for (const currentEvent of listEvent) {
            // let tickets = await Ticket.findById(currentEvent.tickets[0]);
            let ticketPriceStartingFrom;
            for (let index = 0; index < currentEvent.tickets.length; index++) {
                let ticketInfo = await Ticket.findById(currentEvent.tickets[index]);
                if (!ticketPriceStartingFrom) {
                    ticketPriceStartingFrom = parseInt(ticketInfo.ticketprice);
                } else {
                    if (ticketInfo.ticketprice < ticketPriceStartingFrom) {
                        ticketPriceStartingFrom = parseInt(ticketInfo.ticketprice);
                    }
                }
            }
            if (ticketPriceStartingFrom === 0) {
                ticketPriceStartingFrom = "Free";
            } else {
                ticketPriceStartingFrom = "₹" + ticketPriceStartingFrom;
            }
            let eventDate = moment(currentEvent.eventDateTime).format("DD MMM");
            let eventDay_Time = moment(currentEvent.eventDateTime).format("ddd, hh:mm A");
            let eventDuration;

            if (currentEvent.eventDuration < 60) {
                eventDuration = (currentEvent.eventDuration % 60) + " min";
            } else {
                eventDuration = Math.floor(currentEvent.eventDuration / 60) + " : " + (currentEvent.eventDuration % 60) + " hrs";
            }
            let eventInfo = {
                eventid: currentEvent._id.toString(),
                eventName: currentEvent.eventName,
                eventDate: eventDate,
                eventImage: currentEvent.eventImage,
                eventDay_Time: eventDay_Time,
                eventTicketPriceStartingFrom: ticketPriceStartingFrom,
                eventDuration: eventDuration,
            };
            eventsToDisplay.push(eventInfo);
        }
        if (!eventsToDisplay.length) {
            return res.status(500).json({ result: false, data: "Events not listed yet" });
        }
        return res.status(200).json({ result: true, data: eventsToDisplay });
    } catch (error) {
        console.log(`Error in staticController at eventOnIndexPage : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will return all the events organized
// And the events which are not cancelled
// Returned data is changed according to the data present in the database
async function listAllEvents(req, res, next) {
    try {
        let listOfEvents = [];
        let events;
        if (req.query.event_type) {
            if (req.query.event_type === "concert") {
                events = await VenueEvent.find({ eventCancelled: false, eventType: "Concert" }).sort({ eventDateTime: 1 });
                // allEvents = await VenueEvent.find({ eventType: "Hello" });
            }
            if (req.query.event_type === "stand-up") {
                events = await VenueEvent.find({ eventCancelled: false, eventType: "Stand_Up" }).sort({ eventDateTime: 1 });
                // allEvents = await VenueEvent.find({ eventType: "Hello" });
            }
        } else {
            events = await VenueEvent.find({ eventCancelled: false }).sort({ eventDateTime: 1 });
        }
        if (!events) {
            return res.status(404).json({ result: false, data: "Events not listed yet." });
        }
        for (const currentEvent of events) {
            // let tickets = await Ticket.findById(currentEvent.tickets[0]);
            let ticketPriceStartingFrom;
            for (let index = 0; index < currentEvent.tickets.length; index++) {
                let ticketInfo = await Ticket.findById(currentEvent.tickets[index]);
                if (!ticketPriceStartingFrom) {
                    ticketPriceStartingFrom = parseInt(ticketInfo.ticketprice);
                } else {
                    if (ticketInfo.ticketprice < ticketPriceStartingFrom) {
                        ticketPriceStartingFrom = parseInt(ticketInfo.ticketprice);
                    }
                }
            }
            if (ticketPriceStartingFrom === 0) {
                ticketPriceStartingFrom = "Free";
            } else {
                ticketPriceStartingFrom = "₹" + ticketPriceStartingFrom;
            }
            let eventDate = moment(currentEvent.eventDateTime).format("DD MMM");
            let eventDay_Time = moment(currentEvent.eventDateTime).format("ddd, hh:mm A");
            let eventDuration;

            if (currentEvent.eventDuration < 60) {
                eventDuration = (currentEvent.eventDuration % 60) + " min";
            } else {
                eventDuration = Math.floor(currentEvent.eventDuration / 60) + " : " + (currentEvent.eventDuration % 60) + " hrs";
            }
            let eventInfo = {
                eventid: currentEvent._id.toString(),
                eventName: currentEvent.eventName,
                eventDate: eventDate,
                eventImage: currentEvent.eventImage,
                eventDay_Time: eventDay_Time,
                eventTicketPriceStartingFrom: ticketPriceStartingFrom,
                // eventAvailableTickets: numberofTickets,
                eventDuration: eventDuration,
            };
            listOfEvents.push(eventInfo);
        }
        if (!listOfEvents.length) {
            return res.status(500).json({ result: false, data: "Events not listed yet" });
        }
        return res.status(200).json({ result: true, data: listOfEvents });
    } catch (error) {
        console.log(`Error in staticController at listAllEvents : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

module.exports = {
    contactUs,
    listAllEvents,
    eventOnIndexPage,
};
