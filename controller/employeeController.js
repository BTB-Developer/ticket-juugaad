const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local");
const Employee = require("../model/employeeModel");
const Ticket = require("../model/ticketModel");
const ObjectId = require("mongoose").Types.ObjectId;
const moment = require("moment");
const momentRound = require("moment-round");
const VenueEvent = require("../model/eventModel");
const PromoCode = require("../model/promocodeModel");
const Razorpay = require("razorpay");
const Order = require("../model/orderModel");

const razorPayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Done
function employeeLogin(passport) {
    passport.use(
        "employee-local",
        new LocalStrategy(
            {
                usernameField: "employee_email",
                passwordField: "employee_password",
                passReqToCallback: true,
            },
            async (req, email, password, done) => {
                try {
                    if (!email || !password) {
                        // Required fields are empty
                        return done(null, false);
                    }
                    let employee = await Employee.findOne({ employee_email: email });
                    if (!employee) {
                        // User not found
                        return done(null, false);
                    }
                    let passwordVerify = await bcrypt.compare(password, employee.employee_password);
                    if (!passwordVerify) {
                        // Invalid Password
                        return done(null, false);
                    }

                    return done(null, employee);
                } catch (error) {
                    // Any unexpected error
                    console.log(`Error in employeeController at employeeLogin : ${error}`);
                    return done(error, false);
                }
            }
        )
    );
}

// Done
async function employeeProfile(req, res, next) {
    try {
        let employee = await Employee.findById(req.user.id);
        if (!employee) {
            req.session.destroy();
            return res.status(404).json({ result: false, data: "Employee details not found." });
        }
        let currentDate = moment().format("YYYY-MM-DD");
        return res.status(200).json({ result: true, data: { employee_name: employee.employee_username, employee_email: employee.employee_email, currentDate } });
    } catch (error) {
        console.log(`Error in employeeController at employeeProfile : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

async function employeeLogout(req, res, next) {
    try {
        req.session.destroy();
        // Here it is redirected because the route is called from the href attribute
        // Not by fetch or axios
        return res.redirect("/index.html");
    } catch (error) {
        console.log(`Error in employeeController at employeeLogout : ${error}`);
        return;
    }
}

let _id;

// Done
async function createEvent(req, res, next) {
    try {
        await Ticket.find({ eventConfirmStatus: false }).deleteMany();
        _id = new ObjectId();
        let date = moment().add(10, "days").format("YYYY-MM-DD");
        return res.status(200).json({ result: true, data: { _id, date } });
    } catch (error) {
        console.log(`Error in employeeController at createEvent : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
async function addTicketsForEvent(req, res, next) {
    try {
        let { ticketname, numberoftickets, numberofticketsperuser, ticketprice, ticketdiscount, ticketdiscounttype, enddate, endtime } = req.body;
        let ticket_discount_active;
        if (ticketdiscount !== undefined && ticketdiscount !== 0) {
            ticket_discount_active = true;
        }
        let newTicket = new Ticket({
            eventid: _id,
            ticketname,
            numberoftickets,
            numberofticketsperuser,
            ticketprice,
            ticketdiscount,
            ticketdiscounttype,
            ticketdiscountendperiod: enddate && endtime ? new Date(`${enddate}, ${endtime}`).getTime() : null,
            ticket_discount_active,
        });
        await newTicket.save();
        return res.status(200).json({ result: true, data: "Ticket saved" });
    } catch (error) {
        console.log(`Error in employeeController at addTicketsForEvent: ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// Changes to be made
// This function displays a list of tickets of a particular event when creating the event
async function showTicketInformation_Display(req, res, next) {
    try {
        let ticketsArray = [];
        let result = await Ticket.find({ eventid: _id });
        if (!result) {
            return res.status(404).json({ result: false, data: "Tickets Not Found" });
        }
        result.forEach((ticketObject, index) => {
            ticketsArray.push({
                _id: ticketObject._id.toString(),
                eventid: ticketObject.eventid,
                ticketname: ticketObject.ticketname,
                ticketprice: ticketObject.ticketprice,
                numberoftickets: ticketObject.numberoftickets === null ? "Unlimited" : ticketObject.numberoftickets,
                numberofticketsperuser: ticketObject.numberofticketsperuser === null ? "Unlimited" : ticketObject.numberofticketsperuser,
                ticketdiscounttype: ticketObject.ticketdiscounttype === null ? "No Discount" : ticketObject.ticketdiscounttype,
                ticketdiscount: ticketObject.ticketdiscount === 0 ? " " : ticketObject.ticketdiscount,
            });
        });
        return res.status(200).json({ result: true, data: ticketsArray });
    } catch (error) {
        console.log(`Error in employeeController at showTicketInformation_Display : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function displays the information of a particular ticket of an event in the edit modal
async function showTicketInformation_Edit(req, res, next) {
    try {
        let _id = req.body._id;
        let ticketInfo = await Ticket.findById(_id);
        if (!ticketInfo) {
            return res.status(404).json({ result: false, data: "Ticket details not found" });
        }
        let ticketDiscountEndDate = null;
        let ticketDiscountEndTime = null;
        if (ticketInfo.ticketdiscountendperiod !== null) {
            ticketDiscountEndDate = moment(ticketInfo.ticketdiscountendperiod).format("MM/DD/YYYY");
            ticketDiscountEndTime = moment(ticketInfo.ticketdiscountendperiod).format("hh:mm");
        }
        let data = {
            ticketid: ticketInfo.id,
            ticketName: ticketInfo.ticketname,
            numberOfTickets: ticketInfo.numberoftickets,
            numberOfTicketsPerUser: ticketInfo.numberofticketsperuser,
            ticketPrice: ticketInfo.ticketprice,
            ticketDiscount: ticketInfo.ticketdiscount,
            ticketDiscountType: ticketInfo.ticketdiscounttype,
            ticketDiscountEndDate,
            ticketDiscountEndTime,
        };
        return res.status(200).json({ result: true, data });
    } catch (error) {
        console.log(`Error in employeeController at showTicketInformation_Edit : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// Changes to be made in validation -> Do validation in frontend
// This function will update the changes in the specific ticket
async function editSpecificTicket(req, res, next) {
    try {
        let { ticketname, numberoftickets, numberofticketsperuser, ticketprice, ticketdiscount, ticketdiscounttype, ticketdiscountlastdate, ticketdiscountlasttime } = req.body;
        await Ticket.findById(req.body.ticketid)
            .updateOne({
                ticketname,
                numberoftickets: numberoftickets ? numberoftickets : null,
                numberofticketsperuser: numberofticketsperuser ? numberofticketsperuser : null,
                ticketprice,
                ticketdiscount: ticketdiscount ? ticketdiscount : null,
                ticketdiscounttype: ticketdiscounttype ? ticketdiscounttype : null,
                ticketdiscountendperiod: ticketdiscount ? new Date(`${ticketdiscountlastdate}, ${ticketdiscountlasttime}`) : null,
                ticket_discount_active: ticketdiscount ? true : false,
            })
            .then(() => {
                return res.status(200).json({ result: true, data: "Ticket updated successfully" });
            });
    } catch (error) {
        console.log(`Error in employeeController at editSpecificTicket : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will delete a particular ticket if not needed
async function deleteSpecificTicket(req, res, next) {
    try {
        let ticketid = req.body.ticketid;
        if (!ticketid) {
            return res.status(400).json({ result: false, data: "Ticket ID not provided" });
        }
        let ticketInfo = await Ticket.findById(ticketid);
        if (!ticketInfo) {
            return res.status(404).json({ result: false, data: "Ticket not found" });
        }
        await ticketInfo.deleteOne().then(() => {
            // If the ticket is successfully deleted it is redirected to this provided url
            // This url will display all the tickets information
            return res.redirect("/showTicketInfo_Display");
        });
    } catch (error) {
        console.log(`Error in employeeController at deleteSpecificTicket : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will add an event
async function addAnEvent(req, res, next) {
    try {
        if (!req.fileExtensionNotMatched) {
            return res.status(400).json({ result: false, data: "File type not supported" });
        }
        let {
            eventID,
            eventName,
            eventCategory,
            eventDate,
            eventTime,
            eventDuration,
            eventType,
            eventDesc,
            eventLongLat,
            eventVenue,
            eventAddress_1,
            eventAddress_2,
            eventVenueCountry,
            eventVenueState,
            eventVenueCity,
            eventVenueZip,
            eventTicketBookingStartTime,
            eventTicketBookingStartDate,
            eventTicketBookingEndTime,
            eventTicketBookingEndDate,
            passServiceCharges,
            cancellationBefore,
            refundAmount,
            eventInstructions,
        } = req.body;
        if (
            !eventID ||
            !eventName ||
            !eventCategory ||
            !eventDate ||
            !eventTime ||
            !eventDuration ||
            !eventType ||
            !eventDesc ||
            !eventLongLat ||
            !eventVenue ||
            !eventAddress_1 ||
            !eventAddress_2 ||
            !eventVenueCountry ||
            !eventVenueState ||
            !eventVenueCity ||
            !eventVenueZip
        ) {
            return res.status(422).json({ result: false, data: "Fill all the required fields" });
        }
        let eventAddress = `${eventAddress_1}, ${eventAddress_2}`;
        let tickets = await Ticket.find({ eventid: eventID }, { _id: 1 });
        let ticketsArray = [];
        for (const ticketObject of tickets) {
            ticketsArray.push(ticketObject.id);
        }
        if (passServiceCharges === "undefined") {
            passServiceCharges = true;
        } else {
            passServiceCharges = false;
        }

        if (cancellationBefore === "undefined") {
            cancellationBefore = null;
        } else {
            cancellationBefore = parseInt(cancellationBefore);
        }

        if (refundAmount === "undefined") {
            refundAmount = 0;
        } else {
            refundAmount = parseInt(refundAmount);
        }

        if (eventInstructions === "undefined") {
            eventInstructions = null;
        }

        let eventTicketBookingStartDateTime;

        if (eventTicketBookingStartTime === "undefined" || eventTicketBookingStartTime === "undefined") {
            eventTicketBookingStartDateTime = new Date().getTime();
        } else {
            eventTicketBookingStartDateTime = new Date(`${eventTicketBookingStartDate}, ${eventTicketBookingStartTime}`).getTime();
        }

        let newEvent = new VenueEvent({
            _id: new ObjectId(eventID),
            eventName,
            eventCategory,
            eventDateTime: new Date(`${eventDate}, ${eventTime}`).getTime(),
            eventDuration,
            eventType,
            eventImage: "uploads/" + req.files[0].filename,
            eventDesc,
            eventLongLat,
            eventVenue,
            eventAddress,
            eventCountry: eventVenueCountry,
            eventState: eventVenueState,
            eventCity: eventVenueCity,
            eventPincode: eventVenueZip,
            tickets: ticketsArray,
            eventTicketBookingStartDateTime: new Date(`${eventTicketBookingStartDate}, ${eventTicketBookingStartTime}`).getTime(),
            eventTicketBookingEndDateTime: new Date(`${eventTicketBookingEndDate}, ${eventTicketBookingEndTime}`).getTime(),
            passServiceCharges: passServiceCharges,
            cancellationBeforeHowManyDays: cancellationBefore,
            refundAmount: refundAmount,
            eventInstructions: eventInstructions,
        });

        await newEvent.save().then(async () => {
            await Ticket.find({ eventid: eventID }).updateMany({ eventConfirmStatus: true });
            return res.status(200).json({ result: true, data: "Event added" });
        });
    } catch (error) {
        console.log(`Error in employeeController at addAnEvent : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will list all the active events organized
// If the employee search any event by name this function will handle it
// It will not show the events that are cancelled
async function listAllOrganizedEvents(req, res, next) {
    try {
        let eventDetailsToShow = [];
        let allEvents;
        if (req.query.search) {
            let options = { $regex: req.query.search, $options: "i" };
            allEvents = await VenueEvent.find({ eventCancelled: false, $or: [{ eventName: options }] });
        }
        if (req.query.event_type) {
            if (req.query.event_type === "concert") {
                allEvents = await VenueEvent.find({ eventCancelled: false, eventType: "Concert" }).sort({ eventDateTime: 1 });
                // allEvents = await VenueEvent.find({ eventType: "Hello" });
            }
            if (req.query.event_type === "stand-up") {
                allEvents = await VenueEvent.find({ eventCancelled: false, eventType: "Stand_Up" }).sort({ eventDateTime: 1 });
                // allEvents = await VenueEvent.find({ eventType: "Hello" });
            }
        }
        // This next if condition is executed when the allEvents varibale is empty
        if (!allEvents) {
            allEvents = await VenueEvent.find({ eventCancelled: false }).sort({ eventDateTime: 1 });
            // allEvents = [];
        }
        if (!allEvents.length) {
            return res.status(404).json({ result: false, data: "Events not listed yet" });
        }
        for (const eventElement of allEvents) {
            let eventId = eventElement.id;
            let eventName = eventElement.eventName;
            let eventImage = eventElement.eventImage;
            let eventDay_Date_Time = moment(eventElement.eventDateTime).format("ddd, MMM DD, YYYY hh:mm A");
            let totalTickets = 0;
            let numberOfTicketsSold = 0;
            for (const ticketObject of eventElement.tickets) {
                let ticket = await Ticket.findById(ticketObject);
                if (ticket.numberoftickets !== null) {
                    totalTickets += ticket.numberoftickets;
                }
                numberOfTicketsSold += ticket.numberofticketssold;
            }
            if (totalTickets === 0) {
                totalTickets = "Unlimited";
            }
            eventDetailsToShow.push({
                eventId,
                eventName,
                eventImage,
                eventDay_Date_Time,
                totalTickets,
                numberOfTicketsSold,
            });
        }
        return res.status(200).json({ result: true, data: eventDetailsToShow });
    } catch (error) {
        console.log(`Error in employeeController at listAllOrganizedEvents : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will delete a specific event
// The event will not be removed from database
// Only the active status will be changes
// If organizer deletes the event the refund will also be generated automatically
// And the refund amount will be not full as the platform fee will be deducted
async function deleteSpecificOrganizedEvent(req, res, next) {
    try {
        let { id } = req.body;
        if (!id) {
            return res.status(404).json({ result: false, data: "Event id not send" });
        }
        let eventInfo = await VenueEvent.findOne({ _id: id, eventCancelled: false });
        if (!eventInfo) {
            return res.status(422).json({ result: false, data: "Event does not exists" });
        }
        let findOrderOfEvent = await Order.find({ eventid: eventInfo.id, paymentstatus: true });
        let count = 0;
        let errorCount = 0;
        for (const orderObject of findOrderOfEvent) {
            if (orderObject.paymentamount !== 0 && orderObject.paymentamount !== null) {
                // This razorpayFee and gstFee is currently added as because
                // Convenience fee is not abled to be charged from the user
                // So to avoid loss, the convenience fee is deducted before the refund
                let razorpayFee = (orderObject.paymentamount * 2) / 100;
                let gstFee = (razorpayFee * 18) / 100;
                let refundAmount = orderObject.paymentamount - (razorpayFee + Math.floor(gstFee * 100) / 100);
                await razorPayInstance.payments.refund(
                    orderObject.paymentid,
                    {
                        amount: refundAmount * 100,
                        speed: "normal",
                    },
                    async (error, result) => {
                        if (error) {
                            console.log(error);
                            errorCount++;
                        } else {
                            count++;
                            await orderObject.updateOne({ $set: { ticketCancelled: true, refundAmount: result.amount / 100, refundid: result.id, eventCancelled: true } });
                        }
                    }
                );
            }
        }
        // If there is any error during payment refund the code will execute the below if block
        // Which returns error to the frontend
        if (errorCount) {
            return res.status(500).json({ result: false, data: "Server error" });
        }
        for (const ticketObject of eventInfo.tickets) {
            await Ticket.findByIdAndUpdate(ticketObject, { $set: { eventCancelled: true } });
        }
        await eventInfo.updateOne({ $set: { eventCancelled: true } });
        return res.status(200).json({ result: true, data: `Event successfully deleted -> Amount refunded to ${count} customers` });
    } catch (error) {
        console.log(`Error in employeeController at deleteSpecificOrganizedEvent : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will list all the confirmed orders
async function listAllOrderInformation(req, res, next) {
    try {
        let allOrders = await Order.find({ paymentstatus: true });
        if (!allOrders.length) {
            return res.status(404).json({ result: false, data: `No order placed yet` });
        }
        let orderDetailsToShow = [];
        for (const orderObject of allOrders) {
            let eventInfo = await VenueEvent.findById(orderObject.eventid);
            let status;
            if (orderObject.paymentstatus === true) {
                if (orderObject.refundAmount === null) {
                    status = "Paid";
                }
                if (orderObject.refundAmount !== null && orderObject.ticketCancelled === true && orderObject.eventCancelled === false) {
                    status = "Ticket Cancelled and Refunded";
                }
                if (orderObject.refundAmount !== 0 && orderObject.refundAmount !== null && orderObject.eventCancelled === true) {
                    status = "Event Cancelled and Refunded";
                }
            }
            orderDetailsToShow.push({
                id: orderObject.orderid,
                customerName: orderObject.billing_information.user_fname + " " + orderObject.billing_information.user_lname,
                eventName: eventInfo.eventName,
                eventDate: moment(eventInfo.eventDateTime).format("DD-MM-YYYY"),
                referenceId: orderObject.paymentid,
                status,
                totalAmount: orderObject.paymentamount,
            });
        }
        return res.status(200).json({ result: true, data: orderDetailsToShow });
    } catch (error) {
        console.log(`Error in employeeController at listAllOrderInformation : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will list all the customer information
// It will list only the unique customer information
// If any value is different from other result it will display that particular document also
async function listAllCustomerInformation(req, res, next) {
    try {
        let orderInfo = await Order.distinct("billing_information");
        if (!orderInfo.length) {
            return res.status(404).json({ result: false, data: "Customers not listed yet" });
        }
        let customerDetails = [];
        for (const orderObject of orderInfo) {
            customerDetails.push({
                customerName: orderObject.user_fname + " " + orderObject.user_lname,
                customerEmail: orderObject.user_email,
                customerAddress: `${orderObject.user_address}, ${orderObject.user_city} - ${orderObject.user_state}, ${orderObject.user_country}. ${orderObject.user_pincode}`,
            });
        }
        if (!customerDetails.length) {
            return res.status(404).json({ result: false, data: "Customers not listed yet" });
        }
        return res.status(200).json({ result: true, data: customerDetails });
    } catch (error) {
        console.log(`Error in employeeController at listAllCustomerInformation : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will create an promocode
async function createPromocode(req, res, next) {
    try {
        let { promocodeName, promocodeDiscount, promocodeDiscountType, promocodeEndDate, promocodeEndTime } = req.body;
        if (!promocodeName || !promocodeDiscount || !promocodeDiscountType || !promocodeEndDate || !promocodeEndTime) {
            return res.status(422).json({ result: false, data: "Fill all the fields" });
        }
        let promocodeCreatedAt = moment().format("x");
        await PromoCode.create({
            promocodeName,
            promocodeDiscount,
            promocodeDiscountType,
            promocodeCreatedAt,
            promocodeEndDateTime: new Date(`${promocodeEndDate}, ${promocodeEndTime}`).getTime(),
        }).then((result) => {
            return res.status(200).json({ result: true, data: "Promocode created" });
        });
    } catch (error) {
        console.log(`Error in employeeController at createPromocode : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will list all the promocodes
// If the employee wants to view any promocode by searching the name
// This function will handle it
async function listAllPromocodes(req, res, next) {
    try {
        let promocodes;
        if (req.query.search) {
            let options = { $regex: req.query.search, $options: "i" };
            promocodes = await PromoCode.find({ $or: [{ promocodeName: options }] });
        } else {
            promocodes = await PromoCode.find();
        }
        if (!promocodes.length) {
            return res.status(404).json({ result: false, data: "No promocode added yet." });
        }
        let promocodeList = [];
        for (const promocodeElement of promocodes) {
            let promocodeEndDateTime = moment(promocodeElement.promocodeEndDateTime).format("ddd, MMM DD, YYYY hh:mm A");
            let promocodeActiveFrom = moment(promocodeElement.promocodeCreatedAt).round("5", "minutes").format("ddd, MMM DD,YYYY hh:mm A");
            let promocodeDiscount = promocodeElement.promocodeDiscountType === "percent" ? `${promocodeElement.promocodeDiscount}%` : `₹ ${promocodeElement.promocodeDiscount}`;
            let promocodeActiveStatus;
            let promocodeCancelled = false;
            if (promocodeElement.promocodeActive && !promocodeElement.promocodeCancelled) {
                promocodeActiveStatus = "Active";
            }
            if (!promocodeElement.promocodeActive && !promocodeElement.promocodeCancelled) {
                promocodeActiveStatus = "Not Active";
            }
            if (promocodeElement.promocodeCancelled) {
                promocodeActiveStatus = "Cancelled";
                promocodeCancelled = true;
            }
            promocodeList.push({
                promocodeId: promocodeElement.id,
                promocodeName: promocodeElement.promocodeName,
                promocodeEndDateTime,
                promocodeActiveFrom,
                promocodeDiscount,
                promocodeActiveStatus,
                promocodeCancelled,
                promocodeUsage: promocodeElement.promocodeUsage,
            });
        }
        return res.status(200).json({ result: true, data: promocodeList });
    } catch (error) {
        console.log(`Error in employeeController at listAllPromocodes : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will edit the active status of a particular promocode
async function editSpecificPromocode(req, res, next) {
    try {
        let { promocodeId } = req.body;
        if (!promocodeId) {
            return res.status(400).json({ result: false, data: "Promocode ID not sent" });
        }
        let promocodeInfo = await PromoCode.findById(promocodeId);
        if (!promocodeInfo) {
            return res.status(404).json({ result: false, data: "Invalid promocode id" });
        }
        await promocodeInfo.updateOne({ $set: { promocodeActive: !promocodeInfo.promocodeActive } });
        return res.status(200).json({ result: true, data: "Promocode active status changed successfully." });
    } catch (error) {
        console.log(`Error in employeeController editSpecificPromocode : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will delete a particular promocode
// The promocode will not be deleted from the database
// It will only change the promocodeCancelled status
async function deleteSpecificPromocode(req, res, next) {
    try {
        let { promocodeId } = req.body;
        if (!promocodeId) {
            return res.status(400).json({ result: false, data: "Promocode ID not send" });
        }
        let promocodeInfo = await PromoCode.findById(promocodeId);
        if (!promocodeInfo) {
            return res.status(404).json({ result: false, data: "Invalid promocode id" });
        }
        await promocodeInfo.updateOne({ $set: { promocodeCancelled: true, promocodeActive: false } });
        return res.status(200).json({ result: true, data: "Promocode deleted successfully." });
    } catch (error) {
        console.log(`Error in employeeController at deleteSpecificPromocode : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will return the revenue, order and ticket sale details
// This function will also handle the details to be returned from a specific date to a specific date
async function listRevenueTicketOrderReports(req, res, next) {
    try {
        let totalRevenue;
        let orderInfo;
        if (req.query.from && req.query.to) {
            totalRevenue = await Order.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: new Date(req.query.from),
                            $lt: new Date(req.query.to + ", 23:59"),
                        },
                    },
                },
                {
                    $group: { _id: "", revenue: { $sum: "$paymentamount" } },
                },
                { $project: { _id: 0, revenue: 1 } },
            ]);
            orderInfo = await Order.find({
                createdAt: {
                    $gte: new Date(req.query.from),
                    $lt: new Date(req.query.to + ", 23:59"),
                },
            });
        } else {
            totalRevenue = await Order.aggregate([
                {
                    $group: { _id: "", revenue: { $sum: "$paymentamount" } },
                },
                { $project: { _id: 0, revenue: 1 } },
            ]);
            orderInfo = await Order.find();
        }
        if (!totalRevenue.length && !orderInfo.length) {
            return res.status(404).json({ result: false, data: "No reports found for this" });
        }
        let totalOrders = orderInfo.length;
        let totalTicketSales = 0;
        for (const currentOrderInfo of orderInfo) {
            for (const ticketInfo of currentOrderInfo.numberofticketstopurchase) {
                totalTicketSales += parseInt(ticketInfo.tickets);
            }
        }
        totalRevenue = "₹ " + totalRevenue[0].revenue;
        return res.status(200).json({ result: true, data: { totalRevenue, totalOrders, totalTicketSales } });
    } catch (error) {
        console.log(`Error in employeeController at listRevenueTicketOrderReports : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will return the revenue, order and ticket sale details
// From January to Present Month
async function showGraphRecords(req, res, next) {
    try {
        let dataMonthWise = [];
        for (let index = 0; index < moment().month() + 1; index++) {
            let startofMonth = moment().month(index).startOf("month").format("x");
            let endofMonth = moment().month(index).endOf("month").format("x");
            let ordersInfo = await Order.find({ createdAt: { $gte: startofMonth, $lt: endofMonth } });
            let monthRevenue = 0;
            let monthOrder = 0;
            let monthTicketSales = 0;
            ordersInfo.forEach((order) => {
                monthRevenue += order.paymentamount;
                order.numberofticketstopurchase.forEach((current) => {
                    monthTicketSales += parseInt(current.tickets);
                });
            });
            monthOrder += ordersInfo.length;
            dataMonthWise.push({
                revenueGraph: { month: moment().month(index).format("MMMM"), revenue: monthRevenue },
                orderGraph: { month: moment().month(index).format("MMMM"), orders: monthOrder },
                ticketGraph: { month: moment().month(index).format("MMMM"), tickets: monthTicketSales },
            });
        }
        return res.status(200).json({ result: true, data: dataMonthWise });
    } catch (error) {
        console.log(`Error in employeeController at showGraphRecords : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

module.exports = {
    employeeLogin,
    employeeProfile,
    employeeLogout,
    createEvent,
    // uploadImage,
    showTicketInformation_Display,
    addTicketsForEvent,
    showTicketInformation_Edit,
    editSpecificTicket,
    deleteSpecificTicket,
    addAnEvent,
    listAllOrganizedEvents,
    deleteSpecificOrganizedEvent,
    listAllOrderInformation,
    listAllCustomerInformation,
    createPromocode,
    listAllPromocodes,
    editSpecificPromocode,
    deleteSpecificPromocode,
    listRevenueTicketOrderReports,
    showGraphRecords,
};
