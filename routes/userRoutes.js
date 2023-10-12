const passport = require("passport");
const {
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
    listAllTheAttendingEvents,
    cancelTheTicket,
    applyPromocodeWhenBooking,
    getSpecificBookingDetails,
} = require("../controller/userController");
const User = require("../model/userModel");
const userRouter = require("express").Router();

const { isAuthenticated } = require("../middleware/auth");

userLoginUsingEmail(passport);
userLoginUsingGoogle(passport);

userRouter.get("/checkLogin", async (req, res) => {
    // If user is logged in, this if block will be entered
    if (req.isAuthenticated() && req.user.role === "user") {
        let user = await User.findById(req.user.id);
        // If user details is not found this if block of code will eecute
        if (!user) {
            req.session.destroy();
            return res.status(404).json();
        }
        return res.status(200).json();
    }
    // If the person is authenticated but his/her role is of admin we will return
    if (req.isAuthenticated()) {
        if (req.user.role === "admin") {
            return res.status(200).json();
        } else {
            return res.status(409).json();
        }
    }
    // If the user is not logged in we will return the next line of code
    return res.status(400).json();
});

userRouter.get("/checkLogout", async (req, res) => {
    if (!req.isAuthenticated()) {
        // If user is not logged in then return 200 status so it will show login page
        return res.status(200).json();
    }
    if (req.isAuthenticated() && req.user.role === "admin") {
        return res.status(409).json();
    }
    // If user is logged in but the user details cannot be found we will return to login page
    let user = await User.findById(req.user.id);
    if (!user) {
        return res.status(200).json();
    }
    // If user is logged in then return 400 Bad request as, so we should not show login page
    return res.status(400).json();
});

// Done
// This route is called by sign_up.html when the signup button is clicked
userRouter.post("/signup", userSignup);

// Done
// This route is called by sign_in.html when the login button is clicked
userRouter.post("/login", passport.authenticate("local", { successRedirect: "/index_dashboard.html", failureRedirect: "/sign_in.html" }));

// Done
// This route is called by sign_in.html when the google button is clicked
userRouter.post("/googleLogin", passport.authenticate("google", { scope: ["profile", "email"] }));

// Done
// This route is called by google after successful or failure login
userRouter.get("/google/callback", passport.authenticate("google", { successRedirect: "/index_dashboard.html", failureRedirect: "/sign_in.html" }));

// Done
// This route is called by attendee_profile_view.html
userRouter.get("/getProfile", isAuthenticated, userGetProfile);

// Done
// This route is called by attendee_profile_view.html when update button is clicked in the update tab
userRouter.post("/updateProfile", isAuthenticated, userUpdateProfile);

// Done
// This route is called by attendee_profile_view.html when change password button is clicked
// in the password change tab
userRouter.post("/changePassword", isAuthenticated, userUpdatePassword);

// Done
// This route is used to log the user out.
userRouter.get("/logout", isAuthenticated, userLogout);

// Done
// This route is called by the forgot_password.html
userRouter.post("/forgotPassword", userForgotPassword);

// Done
// This route is called by the reset_password.html
userRouter.post("/reset_password", userResetPassword);

// Done
// This route is called by venue_event_detail_view.html
// This route is placed here as the user can only view all the other pages after login only
userRouter.post("/getParticularEventDetails", isAuthenticated, getDetailsOfSpecificEvent);

// Done
// This route is called by venue_event_detail_view.html when book tickets button is clicked
// This route is placed here as the user can only view all the other pages after login only
userRouter.post("/bookTickets", isAuthenticated, bookTickets);

// Done
// This route is called by checkout.html
// This route is placed here as the user can only view all the other pages after login only
userRouter.post("/bookingDetailsInformation", isAuthenticated, displayBookingInformation);

// Done
// This route is called by checkout.html when apply promocode button is clicked
userRouter.post("/applyPromocode", isAuthenticated, applyPromocodeWhenBooking);

// Done
// This route is called by checkout.html when confirm and pay button is clicked
userRouter.post("/createOrder", isAuthenticated, createRazorpayOrder);

// Done
// This route is called by checkout.html if the razorpay order is created successfully
userRouter.get("/getKey", isAuthenticated, async (req, res) => {
    try {
        return res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
    } catch (error) {
        console.log(`Error in user routes at get key : ${error}`);
    }
});

// Done
// This route is called by checkout.html after entering the payment details
// After clicking on the pay button in razorpay dialog
userRouter.post("/verifyPayment", isAuthenticated, verifyThePayment);

// Done
// This route is called by checkout.html when the razorpay dialog is closed
userRouter.get("/cancelOrder", isAuthenticated, deleteAnOrder);

// Done
// This route is caleed by booking_confirmed.html
userRouter.post("/getBookingDetails", isAuthenticated, getSpecificBookingDetails);

// Done
// This route is called by attendee_profile_view.html in attending events tab
userRouter.get("/attendingEvents", isAuthenticated, listAllTheAttendingEvents);

// Done
// This route is called by attendee_profile_view.html when cancel ticket button is clicked
userRouter.post("/initiateRefund", isAuthenticated, cancelTheTicket);

module.exports = userRouter;
