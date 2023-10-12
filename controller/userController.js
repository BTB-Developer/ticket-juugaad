const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local");
const jwt = require("jsonwebtoken");
const nodeMailer = require("nodemailer");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../model/userModel");
const Order = require("../model/orderModel");
const Ticket = require("../model/ticketModel");
const moment = require("moment");
const { createHmac } = require("node:crypto");
const PromoCode = require("../model/promocodeModel");
const VenueEvent = require("../model/eventModel");
const Razorpay = require("razorpay");

const razorPayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Done
async function userSignup(req, res, next) {
    try {
        let fname = req.body.Phelu_naam;
        let lname = req.body.Chelu_naam;
        let email = req.body.Tamaro_Email;
        let password = req.body.Tamaro_password;
        if (!fname || !lname || !email || !password) {
            // Here I have redirected because in frontend form is used
            return res.redirect("/sign_up.html");
        }
        let user = await User.findOne({ email });
        if (user) {
            // Here I have redirected because in frontend form is used
            return res.redirect("/sign_in.html");
        }
        let hashedPassword = await bcrypt.hash(password, 10);
        // let phonenumber = "";
        // for (let index = 0; index < 10; index++) {
        //     phonenumber += Math.floor(Math.random() * 10);
        // }
        let newUser = new User({
            fname,
            lname,
            email,
            password: `${hashedPassword}`,
            // phonenumber,
        });
        let userRegistrationResult = await newUser.save();
        if (!userRegistrationResult) {
            // Here I have redirected because in frontend form is used
            return res.redirect("/sign_up.html");
        }
        // Here I have redirected because in frontend form is used
        return res.redirect("/sign_in.html");
    } catch (error) {
        return console.log(`Error in userController at userSignup : ${error}`);
    }
}

// Done
function userLoginUsingEmail(passport) {
    passport.use(
        "local",
        new LocalStrategy(
            {
                usernameField: "aapka_email",
                passwordField: "aapka_password",
                passReqToCallback: true,
            },
            async (req, email, password, done) => {
                try {
                    if (!email || !password) {
                        // Required fields are empty
                        return done(null, false);
                    }
                    let user = await User.findOne({ email });
                    if (!user) {
                        // User not found
                        return done(null, false);
                    }
                    let passwordVerify = await bcrypt.compare(password, user.password);
                    if (!passwordVerify) {
                        // Invalid Password
                        return done(null, false);
                    }
                    return done(null, user);
                } catch (error) {
                    // Any unexpected error
                    console.log(error);
                    return done(error, false);
                }
            }
        )
    );
}

// Done
function userLoginUsingGoogle(passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
                passReqToCallback: true,
            },
            async (request, accessToken, refreshToken, profile, done) => {
                let user = await User.findOne({ email: profile._json.email });
                if (user) {
                    return done(null, user);
                }
                // let phonenumber = "";
                // for (let index = 0; index < 10; index++) {
                //     phonenumber += Math.floor(Math.random() * 10);
                // }
                let newUser = new User({
                    fname: profile._json.given_name,
                    lname: profile._json.family_name,
                    email: profile._json.email,
                    // phonenumber,
                });
                await newUser
                    .save()
                    .then(() => {
                        return done(null, newUser);
                    })
                    .catch((error) => {
                        return done(error, false);
                    });
            }
        )
    );
}

// Done
async function userGetProfile(req, res, next) {
    try {
        let user = await User.findById(req.user.id);
        if (!user) {
            req.session.destroy();
            return res.status(404).json({ result: false, data: "User not found" });
        }
        let address;
        if (!user.address || !user.city || !user.country || !user.state || !user.pincode) {
            address = "Add your address";
        } else {
            address = `${user.address}, ${user.city} - ${user.state}, ${user.country} - ${user.pincode}`;
        }
        let phonenumber;
        if (user.phonenumber === null) {
            phonenumber = "Add your phone number";
        } else {
            phonenumber = "+91 " + user.phonenumber;
        }
        let data = {
            username: `${user.fname} ${user.lname}`,
            email: user.email,
            phonenumber,
            address,
        };
        return res.status(200).json({ result: true, data });
    } catch (error) {
        console.log(`Error in userController at userGetProfile : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
async function userUpdateProfile(req, res, next) {
    try {
        let firstname = req.body.First_naam;
        let lastname = req.body.last_naam;
        let phonenumber = req.body.tumhara_number;
        let address_1 = req.body.address_line_1;
        let address_2 = req.body.address_line_2;
        let country = req.body.tumhara_country;
        let state = req.body.tumhara_state;
        let city = req.body.tumahara_city;
        let pincode = req.body.tumhara_zip_code;
        if (!firstname || !lastname || !phonenumber || !address_1 || !address_2 || !country || !state || !city || !pincode) {
            // return res.status(422).json();
            return res.status(422).json({ result: false, data: "Fill all the required fields" });
        }
        let user = await User.findById(req.user.id);
        if (!user) {
            req.session.destroy();
            // return res.status(404).json();
            return res.status(404).json({ result: true, data: "User not found" });
        }
        await user
            .updateOne({
                fname: `${firstname}`,
                lname: `${lastname}`,
                phonenumber: phonenumber,
                address: `${address_1}, ${address_2}`,
                country,
                state,
                city,
                pincode,
            })
            .then(() => {
                // return res.status(200).json();
                return res.status(200).json({ result: true, data: "User information updated." });
            });
    } catch (error) {
        console.log(`Error in userController at userUpdateProfile: ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
async function userUpdatePassword(req, res, next) {
    try {
        let { current_password, new_password, new_confirm_password } = req.body;
        if (!current_password || !new_password || !new_confirm_password) {
            return res.status(422).json({ result: false, data: "Fill all the required fields" });
        }
        if (new_password !== new_confirm_password) {
            // If passwords are not same
            return res.status(409).json({ result: false, data: "The passwords are not same" });
        }
        let user = await User.findById(req.user.id);
        if (!user) {
            // If user not found
            req.session.destroy();
            return res.status(400).json({ result: false, data: "User not found" });
        }
        if (!user.password) {
            // If user is signed using google
            return res.status(409).json({ result: false, data: "Social sign-in method is used" });
        }
        let compareCurrentPassword = await bcrypt.compare(current_password, user.password);
        if (!compareCurrentPassword) {
            return res.status(409).json({ result: false, data: "Invalid password" });
        }
        let hashedNewPassowrd = await bcrypt.hash(new_password, 10);
        if (!hashedNewPassowrd) {
            return res.status(500).json({ result: false, data: "Server error" });
        }
        await user.updateOne({ password: `${hashedNewPassowrd}` }).then(() => {
            req.session.destroy();
            return res.status(200).json({ result: true, data: "Password updated" });
        });
    } catch (error) {
        console.log(`Error in userController at userUpdatePassword : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
async function userForgotPassword(req, res, next) {
    try {
        let email = req.body.your_email;
        if (!email) {
            return res.status(422).json({ result: false, data: "Fill all the required details" });
        }
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ result: false, data: "User not found" });
        }
        if (!user.password) {
            return res.status(400).json({ result: false, data: "Social sign-in method used, try login" });
        }
        let transporter = await nodeMailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD,
            },
        });
        let token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: process.env.RESET_PASSWORD_EXPIRY_TOKEN });
        let information = transporter.sendMail({
            from: `${process.env.EMAIL}`,
            to: `${email}`,
            subject: "Reset your password",
            html: `<p>Hi <b>${user.fname} ${user.lname}</b>, please open the link and <a href="http://localhost:3000/reset_password.html?token=${token}">Reset your password</a>.<br>This link will expire in <b>15 minutes</b>. </p>`,
        });
        if (!information) {
            return res.status(400).json({ result: false, data: "E-Mail not sent" });
        }
        await user.updateOne({ resetpasswordtoken: token });
        return res.status(200).json({ result: true, data: "E-Mail sent" });
    } catch (error) {
        console.log(`Error in userController at userForgotPassword : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
async function userResetPassword(req, res, next) {
    try {
        let { token, newPassword, newConfirmPassword } = req.body;
        if (!token || !newPassword || !newConfirmPassword) {
            return res.status(422).json({ result: false, data: "Fill all the required fields" });
        }
        await jwt.verify(token, process.env.JWT_SECRET);
        let user = await User.findOne({ resetpasswordtoken: token });
        if (!user) {
            return res.status(409).json({ result: false, data: "User details not found" });
        }
        if (newPassword !== newConfirmPassword) {
            return res.status(409).json({ result: false, data: "Passwords do not match" });
        }
        let hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.updateOne({ password: hashedPassword, resetpasswordtoken: "" }).then(() => {
            return res.status(200).json({ result: true, data: "Password updated successfully" });
        });
    } catch (error) {
        console.log(`Error in userController at userResetPassword : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
async function userLogout(req, res, next) {
    try {
        req.session.destroy();
        // Here it is redirected because this route will be called using href
        // Not by fetch method
        return res.redirect("/index.html");
    } catch (error) {
        console.log(`Error in userController at userLogout : ${error}`);
        return;
    }
}

// Done
// This function shows the information of particular event
// This function checks if the user is allowed to book a ticket
// By checking the ticketBookingStartTime and ticketBookingEndTime
// If all the tickets are sold the user cannot book any tickets
async function getDetailsOfSpecificEvent(req, res, next) {
    try {
        let event = await VenueEvent.findById(req.body.eventid, {
            cancellationBeforeHowManyDays: 0,
            eventInstructions: 0,
            refundAmount: 0,
            passServiceCharges: 0,
        });
        let ticketInfo = [];
        for (const currentTicket of event.tickets) {
            let ticket = await Ticket.findById(currentTicket);
            if (ticket.numberoftickets - ticket.numberofticketssold || ticket.numberoftickets === null) {
                let ticketprice = "Free";
                if (ticket.ticketprice !== null) {
                    ticketprice = "INR ₹ " + ticket.ticketprice;
                }
                let numberofticketsperuser = null;
                if (ticket.numberoftickets !== null) {
                    if (ticket.numberofticketsperuser === null) {
                        numberofticketsperuser = ticket.numberoftickets - ticket.numberofticketssold;
                    } else {
                        if (ticket.numberoftickets - ticket.numberofticketssold < ticket.numberofticketsperuser) {
                            numberofticketsperuser = ticket.numberoftickets - ticket.numberofticketssold;
                        } else {
                            numberofticketsperuser = ticket.numberofticketsperuser;
                        }
                    }
                }
                ticketInfo.push({ id: ticket.id, ticketprice, numberofticketsperuser: numberofticketsperuser });
            }
        }
        let month = moment(event.eventDateTime).format("MMM");
        let date = moment(event.eventDateTime).format("DD");
        let eventDay_Date_Time = moment(event.eventDateTime).format("ddd, MMM DD, YYYY hh:mm A");
        let eventAddress = `${event.eventVenue} - ${event.eventAddress}, ${event.eventCity}, ${event.eventState} - ${event.eventCountry}. ${event.eventPincode}`;
        let eventDuration;
        if (event.eventDuration < 60) {
            eventDuration = (event.eventDuration % 60) + " min";
        } else {
            eventDuration = Math.floor(event.eventDuration / 60) + ":" + (event.eventDuration % 60) + " hrs";
        }
        let ticketBookingStartTime = moment(event.eventTicketBookingStartDateTime).format("x");
        let ticketBookingEndTime = moment(event.eventTicketBookingEndDateTime).format("x");
        let currentTime = moment().format("x");
        let allowTicketBooking = false;
        if (ticketBookingStartTime < currentTime) {
            if (currentTime < ticketBookingEndTime) {
                allowTicketBooking = true;
            }
        }
        let eventInfo = {
            eventName: event.eventName,
            eventImage: event.eventImage,
            date,
            month,
            eventDesc: event.eventDesc,
            eventDay_Date_Time,
            eventDuration,
            eventAddress,
            eventVenue: event.eventLongLat,
            ticketInfo: ticketInfo.length ? ticketInfo : false,
            allowTicketBooking,
        };
        return res.status(200).json({ result: true, data: eventInfo });
    } catch (error) {
        console.log(`Error in userController at getDetailsOfSpecificEvent : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function create an order and saves the payable amount and other important things such as
// event id, user id, ticket id and number of tickets to purchase
// If the user by mistake inputs 0 ticket to book it will return a message
async function bookTickets(req, res, next) {
    try {
        let { ticketstopurchase, eventid } = req.body;
        if (!eventid) {
            return res.status(400).json({ result: false, data: "Event ID not provided" });
        }
        if (!ticketstopurchase.length) {
            return res.status(400).json({ result: false, data: "Add tickets to book" });
        }
        let user = await User.findById(req.user.id);
        let eventInfo = await VenueEvent.findById(eventid);
        if (!eventInfo) {
            return res.status(404).json({ result: false, data: "Event not found" });
        }
        for (let index = 0; index < ticketstopurchase.length; index++) {
            if (ticketstopurchase[index].tickets === "0") {
                ticketstopurchase.splice(index, 1);
                index = index - 1;
            }
        }

        let payableAmount = 0;
        for (let ticketObject of ticketstopurchase) {
            let ticket = await Ticket.findById(ticketObject.id);
            if (ticketObject.tickets <= ticket.numberoftickets || ticket.numberoftickets === null) {
                if (ticket.ticketprice !== null) {
                    payableAmount += ticket.ticketprice * ticketObject.tickets;
                }
            } else {
                return res.status(501).json({ result: false, data: "Insufficient Tickets" });
            }
        }
        await Order.find({ userid: req.user.id, pageRefreshed: true, paymentstatus: false }).deleteMany();
        let orderid = (await Order.count()) + 1;
        let newOrder = new Order({
            orderid,
            eventid,
            userid: user.id,
            numberofticketstopurchase: ticketstopurchase,
            paymentamount: payableAmount,
        });
        await newOrder.save().then((result) => {
            return res.status(200).json({ result: true, data: result.id });
        });
    } catch (error) {
        console.log(`Error in userController at bookTickets : ${error}`);
        return res.status(409).json({ result: false, data: error.message });
    }
}

// Done
// This function returns all the details of the particular order from the order id
// And if there is any discount on any ticket it will be calculated and updated here
// If the user clicks the back button or visits to the previous page
// He cannot continue with the same order
async function displayBookingInformation(req, res, next) {
    try {
        let order_id = req.body.oid;
        if (!order_id) {
            return res.status(400).json({ result: false, data: "Order ID not found" });
        }
        // await Order.find({ userid: req.user.id, pageRefreshed: true, paymentstatus: false }).deleteMany();
        let bookingdetails = await Order.findById(order_id, { eventid: 1, numberofticketstopurchase: 1, paymentamount: 1, paymentstatus: 1, pageRefreshed: 1 });
        if (!bookingdetails) {
            return res.status(404).json({ result: false, data: "Order not found" });
        }
        if (bookingdetails.paymentstatus) {
            return res.status(422).json({ result: false, data: "Payment already done" });
        }
        if (bookingdetails.pageRefreshed) {
            if (bookingdetails.promocodeId !== null && bookingdetails.promocodeId !== undefined) {
                let promocodeInfo = await PromoCode.findById(bookingdetails.promocodeId);
                await promocodeInfo.updateOne({ $set: { promocodeUsage: promocodeInfo.promocodeUsage - 1 } });
            }
            await bookingdetails.deleteOne();
            return res.status(400).json({ result: false, data: "Page refreshed" });
        }
        let eventInfo = await VenueEvent.findById(bookingdetails.eventid, { _id: 0, eventName: 1, eventDateTime: 1, tickets: 1, eventImage: 1 });
        if (!eventInfo) {
            return res.status(404).json({ result: false, data: "Event not found" });
        }
        let ticketstopurchase = [];
        let discountedAmount = 0;
        for (const ticketObject of bookingdetails.numberofticketstopurchase) {
            let ticketInfo = await Ticket.findById(ticketObject.id);
            ticketstopurchase.push({ ticketName: ticketInfo.ticketname, ticketstobuy: ticketObject.tickets });
            // let currentTime = moment("2023-10-11").format("x");
            let currentTime = moment().format("x");
            let discountedTicketEndTime = moment(ticketInfo.ticketdiscountendperiod).format("x");
            if (currentTime < discountedTicketEndTime && ticketInfo.ticket_discount_active && ticketInfo.ticketprice != 0) {
                if (ticketInfo.ticketdiscounttype === "Fixed") {
                    discountedAmount += ticketInfo.ticketdiscount * ticketObject.tickets;
                }
                if (ticketInfo.ticketdiscounttype === "Percentage") {
                    discountedAmount += ((ticketInfo.ticketprice * ticketInfo.ticketdiscount) / 100) * ticketObject.tickets;
                }
            }
        }

        let subTotal = "₹ " + 0;
        let totalAmount;
        if (bookingdetails.paymentamount === 0) {
            totalAmount = "Free";
        } else {
            subTotal = "₹" + bookingdetails.paymentamount;
            if (discountedAmount !== 0) {
                totalAmount = "INR ₹" + (bookingdetails.paymentamount - discountedAmount);
                await bookingdetails.updateOne({ $set: { paymentamount: bookingdetails.paymentamount - discountedAmount, discountAppliedAmount: discountedAmount } });
                discountedAmount = "₹" + discountedAmount;
            } else {
                totalAmount = "INR ₹" + bookingdetails.paymentamount;
            }
        }
        await bookingdetails.updateOne({ $set: { pageRefreshed: true } });
        let discountProvided = discountedAmount !== 0 ? true : false;
        let detailsToShow = {
            eventName: eventInfo.eventName,
            eventImage: eventInfo.eventImage,
            eventDateTime: moment(eventInfo.eventDateTime).format("ddd, MMM DD, YYYY hh:mm A"),
            ticketstopurchase: ticketstopurchase,
            subTotal,
            totalAmount,
            discountProvided,
            discountedAmount,
        };
        return res.status(200).json({ result: true, data: detailsToShow });
    } catch (error) {
        console.log(`Error in userController at displayBookingInformation : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function is used to apply promocode at time of booking
// If there is any kind of discount already applied the discount cannot be applied
async function applyPromocodeWhenBooking(req, res, next) {
    try {
        let { oid, promocode } = req.body;
        if (!oid) {
            return res.status(404).json({ result: false, data: "Order ID not provided" });
        }
        let orderInfo = await Order.findById(oid);
        if (!orderInfo) {
            return res.status(404).json({ result: false, data: "Order not found" });
        }
        if (orderInfo.discountAppliedAmount !== null && orderInfo.discountAppliedAmount !== 0) {
            return res.status(409).json({ result: false, data: "Discount already applied" });
        }
        let promocodeInfo = await PromoCode.findOne({ promocodeName: promocode, promocodeCancelled: false, promocodeActive: true });
        if (!promocodeInfo) {
            return res.status(404).json({ result: false, data: "Invalid Code" });
        }
        let currentDate = moment().format("x");
        let promocodeEndDateTime = moment(promocodeInfo.promocodeEndDateTime).format("x");
        let discountAmount;
        let amountToPay;
        if (currentDate < promocodeEndDateTime) {
            if (promocodeInfo.promocodeDiscountType === "fixed") {
                discountAmount = promocodeInfo.promocodeDiscount;
                amountToPay = orderInfo.paymentamount - discountAmount;
            }
            if (promocodeInfo.promocodeDiscountType === "percent") {
                discountAmount = (orderInfo.paymentamount * promocodeInfo.promocodeDiscount) / 100;
                amountToPay = orderInfo.paymentamount - discountAmount;
            }
            await orderInfo.updateOne({ $set: { promocodeId: promocodeInfo.id, paymentamount: amountToPay, discountAppliedAmount: discountAmount } });
            discountAmount = "₹" + discountAmount;
            amountToPay = "₹" + amountToPay;
            await promocodeInfo.updateOne({ $set: { promocodeUsage: promocodeInfo.promocodeUsage + 1 } });
            return res.status(200).json({ result: true, data: { amountToPay, discountAmount, discountApplied: true } });
        }
    } catch (error) {
        console.log(`Error in userController at applyPromocodeWhenBooking : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function validates the required inputs and then updates the order using the order id
// If everything is successful the razorpay order is created
async function createRazorpayOrder(req, res, next) {
    try {
        let { fname, lname, email, address, country, city, state, pincode, oid } = req.body;
        if (!fname || !lname || !email || !address || !country || !city || !state || !pincode || !oid) {
            return res.status(422).json({ result: false, data: "Fill all the required fields" });
        }
        let orderDetails = await Order.findById(oid);
        if (!orderDetails) {
            return res.status(404).json({ result: false, data: "Order not found" });
        }
        let orderUpdateResult = await orderDetails.updateOne({
            $set: {
                billing_information: {
                    user_fname: fname,
                    user_lname: lname,
                    user_email: email,
                    user_address: address,
                    user_country: country,
                    user_state: state,
                    user_city: city,
                    user_pincode: pincode,
                },
            },
        });
        if (!orderUpdateResult) {
            return res.status(500).json({ result: false, data: "Server error" });
        }
        orderDetails = await Order.findById(oid);
        let amount = orderDetails.paymentamount * 100;
        let currency = "INR";
        razorPayInstance.orders.create(
            {
                amount,
                currency,
            },
            (error, order) => {
                if (error) {
                    return res.status(500).json({ result: false, data: error });
                }
                return res.status(200).json({ result: true, data: { order, userInfo: orderDetails.billing_information } });
            }
        );
    } catch (error) {
        console.log(`Error in userController at createRazorpayOrder : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function is responsible to verify the payment details
// If verified the order is updated and the paymentstatus is edited
async function verifyThePayment(req, res, next) {
    try {
        let { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;
        let order_id = req.query.orderid;
        let expectedSignature = createHmac("sha-256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");
        if (expectedSignature === razorpay_signature) {
            let paymentdate = moment().format();
            let orderInfo = await Order.findById(order_id);
            await orderInfo.updateOne({ $set: { paymentstatus: true, paymentid: `${razorpay_payment_id}`, paymentdate } });
            for (const ticket of orderInfo.numberofticketstopurchase) {
                let ticketInfo = await Ticket.findOne({ _id: ticket.id });
                if (ticketInfo) {
                    if (ticketInfo.numberofticketssold === null) {
                        await ticketInfo.updateOne({ $set: { numberofticketssold: parseInt(ticket.tickets) } });
                    } else {
                        await ticketInfo.updateOne({ $set: { numberofticketssold: ticketInfo.numberofticketssold + parseInt(ticket.tickets) } });
                    }
                }
            }
            // Here it is redirected because this route is a redirected route call
            // i.e Razorpay calls this route to verify the payment
            return res.redirect(`/booking_confirmed.html?payment_id=${razorpay_payment_id}`);
        }
        // Here status code 500 is returned if the payment is not verified.
        return res.status(500).json({ result: false, data: "Payment Failed" });
    } catch (error) {
        console.log(`Error in userController at verifyThePayment : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function deletes an order when the razorpay dialog is closed
async function deleteAnOrder(req, res, next) {
    try {
        let orderid = req.query.orderid;
        if (!orderid) {
            return res.status(404).json({ result: false, data: "Order not found" });
        }
        let deleteOrderResult = await Order.findById(orderid).deleteOne();
        if (!deleteOrderResult) {
            // If order is not deleted, status code 500 is returned i.e Server Error
            return res.status(500).json({ result: false, data: "Server error" });
        }
        // If order is deleted, status code 200 is returned
        return res.status(200).json({ result: true, data: "Payment cancelled" });
    } catch (error) {
        console.log(`Error in userController at deleteAnOrder : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function will return the necessary information of a particular confirmed or cancelled order
async function getSpecificBookingDetails(req, res, next) {
    try {
        let { paymentid } = req.body;
        if (!paymentid) {
            return res.status(500).json({ result: false, data: "Payment ID not provided" });
        }
        let bookingDetails = await Order.findOne({ paymentid });
        if (!bookingDetails) {
            return res.status(404).json({ result: false, data: "Booking details not found" });
        }
        let eventDetails = await VenueEvent.findById(bookingDetails.eventid, { _id: 0, eventName: 1, eventDateTime: 1, eventDuration: 1, eventImage: 1 });
        let eventDuration;
        if (eventDetails.eventDuration < 60) {
            eventDuration = (eventDetails.eventDuration % 60) + " min";
        } else {
            eventDuration = Math.floor(eventDetails.eventDuration / 60) + ":" + (eventDetails.eventDuration % 60) + " hrs";
        }
        let ticketsPurchased = [];
        for (const ticketObject of bookingDetails.numberofticketstopurchase) {
            let ticket = await Ticket.findById(ticketObject.id);
            ticketsPurchased.push({ ticketName: ticket.ticketname, numberoftickets: ticketObject.tickets });
        }
        let detailsToShow = {
            paymentid: bookingDetails.paymentid,
            eventName: eventDetails.eventName,
            eventImage: eventDetails.eventImage,
            ticketCancelled: bookingDetails.ticketCancelled,
            eventDateTime: moment(eventDetails.eventDateTime).format("ddd, MMM DD, YYYY hh:mm A"),
            eventDuration,
            ticketspuchasedby: bookingDetails.billing_information,
            ticketsPurchased: ticketsPurchased,
            totalAmount: bookingDetails.ticketCancelled ? bookingDetails.refundAmount : bookingDetails.paymentamount,
        };
        return res.status(200).json({ result: true, data: detailsToShow });
    } catch (error) {
        console.log(`Error in userRoutes at getBookingDetails : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function returns all the confirmed or cancelled events
// It also returns the refund status if required
async function listAllTheAttendingEvents(req, res, next) {
    try {
        let attendingEvents = [];
        let eventTicketsBooked = await Order.find({ userid: req.user.id, paymentstatus: true });
        if (!eventTicketsBooked) {
            return res.status(404).json({ result: false, data: "Tickets not booked yet." });
        }
        for (const currentEventTicket of eventTicketsBooked) {
            let eventInfo = await VenueEvent.findById(currentEventTicket.eventid, { eventName: 1, eventDateTime: 1, eventImage: 1, cancellationBeforeHowManyDays: 1, refundAmount: 1 });
            let ticketsCanBeCancelled = false;
            if (eventInfo.cancellationBeforeHowManyDays !== null && eventInfo.cancellationBeforeHowManyDays !== 0) {
                let ticketCanBeCancelledBy = moment(eventInfo.eventDateTime).subtract(eventInfo.cancellationBeforeHowManyDays, "days").format("x");
                if (ticketCanBeCancelledBy > moment().format("x")) {
                    ticketsCanBeCancelled = true;
                }
            }
            let ticketCancelled = currentEventTicket.ticketCancelled;
            let refundStatus;
            if (ticketCancelled) {
                await razorPayInstance.payments.fetchRefund(currentEventTicket.paymentid, currentEventTicket.refundid, (error, result) => {
                    if (error) {
                        return res.status(500).json({ result: false, data: error });
                    }
                    refundStatus = result.status;
                });
                ticketsCanBeCancelled = false;
            }
            let detailsToPush = {
                eventName: eventInfo.eventName,
                eventImage: eventInfo.eventImage,
                eventDateTime: moment(eventInfo.eventDateTime).format("ddd, MMM DD, YYYY hh:mm A"),
                paymentid: currentEventTicket.paymentid,
                ticketsCanBeCancelled,
                ticketCancelled,
                refundStatus,
            };
            attendingEvents.push(detailsToPush);
        }
        return res.status(200).json({ result: true, data: attendingEvents });
    } catch (error) {
        console.log(`Error in userController at listAllTheAttendingEvents : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

// Done
// This function cancels the ticket of a particular event from the user side
// If the refund amount is not defined by the organizer when creating the event
// The refund amount is the amount paid at the time of booking - platform fee (razorpay)
// If the refund amount is defined then accordingly the amount is refunded
async function cancelTheTicket(req, res, next) {
    try {
        let orderInfo = await Order.findOne({ paymentid: req.body.paymentid });
        if (!orderInfo) {
            return res.status(404).json({ result: false, data: "Order not found" });
        }
        let eventInfo = await VenueEvent.findOne({ _id: orderInfo.eventid });
        let refundAmount = 0;
        let errorCount = 0;
        if (eventInfo.refundAmount === null) {
            if (orderInfo.paymentamount !== null && orderInfo.paymentamount !== 0) {
                let razorPayFee = (orderInfo.paymentamount * 2) / 100;
                let gstFee = (razorPayFee * 18) / 100;
                let refundAmount = orderInfo.paymentamount - (razorPayFee + Math.floor(gstFee * 100) / 100);
                await razorPayInstance.payments.refund(
                    orderInfo.paymentid,
                    {
                        amount: refundAmount * 100,
                        speed: "normal",
                    },
                    async (error, result) => {
                        if (error) {
                            console.log(error);
                            errorCount++;
                        } else {
                            await orderInfo.updateOne({ $set: { ticketCancelled: true, refundAmount: result.amount / 100, refundid: result.id } });
                        }
                    }
                );
            }
            if (errorCount !== 0) {
                return res.status(500).json({ result: false, data: "Server error" });
            }
            return res.status(200).json({ result: true, data: "You will receive refund in 4-5 working days" });
        } else {
            for (const numberoftickets of orderInfo.numberofticketstopurchase) {
                refundAmount += eventInfo.refundAmount * numberoftickets.tickets;
            }
        }
        razorPayInstance.payments.refund(
            req.body.paymentid,
            {
                amount: refundAmount * 100,
                speed: "normal",
            },
            async (error, result) => {
                if (error) {
                    console.log(error);
                    return res.status(500).json({ result: false, data: error });
                }
                await orderInfo.updateOne({ $set: { ticketCancelled: true, refundAmount: refundAmount !== null && refundAmount !== 0 ? refundAmount : null, refundid: result.id } });
                let ticketInfo = await Ticket.findOne({ _id: eventInfo.tickets[0], numberoftickets: { $ne: null } });
                if (ticketInfo) {
                    await ticketInfo.updateOne({ $set: { numberoftickets: ticketInfo.numberoftickets + orderInfo.numberofticketstopurchase } });
                }
                return res.status(200).json({ result: true, data: result });
            }
        );
    } catch (error) {
        console.log(`Error in userController at cancelTheTicket : ${error}`);
        return res.status(500).json({ result: false, data: error.message });
    }
}

module.exports = {
    userSignup,
    userLoginUsingEmail,
    userLoginUsingGoogle,
    userUpdatePassword,
    userLogout,
    userUpdateProfile,
    userForgotPassword,
    userResetPassword,
    userGetProfile,
    getDetailsOfSpecificEvent,
    bookTickets,
    displayBookingInformation,
    createRazorpayOrder,
    verifyThePayment,
    deleteAnOrder,
    getSpecificBookingDetails,
    listAllTheAttendingEvents,
    cancelTheTicket,
    applyPromocodeWhenBooking,
};
