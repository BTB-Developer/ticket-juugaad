const passport = require("passport");
const {
    employeeLogin,
    employeeLogout,
    employeeProfile,
    createEvent,
    showTicketInformation_Display,
    addTicketsForEvent,
    showTicketInformation_Edit,
    editSpecificTicket,
    deleteSpecificTicket,
    listAllOrganizedEvents,
    deleteSpecificOrganizedEvent,
    listAllOrderInformation,
    addAnEvent,
    listAllCustomerInformation,
    createPromocode,
    listAllPromocodes,
    editSpecificPromocode,
    deleteSpecificPromocode,
    listRevenueTicketOrderReports,
    showGraphRecords,
    uploadImage,
} = require("../controller/employeeController");
const { checkEmployeeLogin, checkEmployeeAuthorized } = require("../middleware/auth");
const multer = require("multer");

const employeeRouter = require("express").Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "public/uploads");
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const whitelist = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (!whitelist.includes(file.mimetype)) {
            req.fileExtensionNotMatched = false;
            cb(null, false);
        } else {
            req.fileExtensionNotMatched = true;
            cb(null, true);
        }
    },
});

employeeLogin(passport);

// Done
// This route is called by all the organisation pages
// To check whether the user is not trying to access the pages
employeeRouter.get("/checkEmployeeLogin", checkEmployeeLogin);

// Done
// This route is called by specific 2 or 3 organisation pages
// To check whether a specific employee can use that page or not
employeeRouter.get("/checkEmployeeAuthorized", checkEmployeeAuthorized);

// Done
// This route is by organisation_sign_in.html
// To check whether the employee is logged out or not
employeeRouter.get("/checkEmployeeLogout", async (req, res) => {
    try {
        if (req.isAuthenticated() && req.user.role !== "user") {
            return res.status(400).json();
        }
        if (req.isAuthenticated() && req.user.role === "user") {
            return res.status(409).json();
        }
        return res.status(200).json();
    } catch (error) {
        console.log(`Error in employeeRoutes at checkAdminLogout : ${error}`);
        return res.status(500).json();
    }
});

// Done
// This route is called by organisation_sign_in.html
employeeRouter.post("/employeelogin", passport.authenticate("employee-local", { successRedirect: "/my_organisation_dashboard.html", failureRedirect: "/organisation_sign_in.html" }));

// Done
// This route is called by my_organisation_dashboard.html
employeeRouter.get("/getEmployeeProfile", employeeProfile);

// Done
// This route is called when the create_venue_event.html is opened
employeeRouter.get("/createEvent", createEvent);

// Done
// This route is called when when the event image is changed
// employeeRouter.post("/uploadImage", upload.array("files"), uploadImage);

// Done
// This route will be called in create_venue_event.html by tickets tab.
employeeRouter.post("/addTickets", addTicketsForEvent);

// Done
// This route will be called in create_venue_event.html by tickets tab.
employeeRouter.get("/showTicketInfo_Display", showTicketInformation_Display);

// Done
// This route will be called in create_venue_event.html by tickets tab
employeeRouter.post("/showTicketInfo_Edit", showTicketInformation_Edit);

// Done
// This route will be called in create_venue_event.html by tickets tab
employeeRouter.post("/editTicket", editSpecificTicket);

// Done
// This route will be called in create_venue_event.html by tickets tab.
employeeRouter.post("/deleteTicket", deleteSpecificTicket);

// Done
// This route will be called in create_venue_event.html by settings tab
// If all the validation is successful the event is saved
// employeeRouter.post("/addEvent", addAnEvent);
employeeRouter.post("/addEvent", upload.array("files"), addAnEvent);

// Done
// This route will be called in my_organisation_dashboard_events.html
employeeRouter.get("/getAllOrganizedEvents", listAllOrganizedEvents);

// Done
// Before calling this route the employee will be asked to confirm
// If he/she wants to delete the ticket
// This route will be called in my_organisation_dashboard_events.html
employeeRouter.delete("/deleteEvent", deleteSpecificOrganizedEvent);

// Done
// This route will be called in my_organisation_dashboard_reports.html by orders tab
employeeRouter.get("/getAllOrderInformation", listAllOrderInformation);

// Done
// This route will be called in my_organisation_dashboard_reports.html by customers tab
employeeRouter.get("/customerInformation", listAllCustomerInformation);

// Done
// This route will be called in my_organisation_dashboard_promocode.html,
// When create promocode button will be clicked
employeeRouter.post("/createPromocode", createPromocode);

// Done
// This route will be called in my_organisation_dashboard_promocode.html
employeeRouter.get("/getAllPromocode", listAllPromocodes);

// Done
// This route will be called in my_organisation_dashboard_promocode.html
// Before calling this route the employee will be confirmed once
employeeRouter.patch("/changePromocodeActiveStatus", editSpecificPromocode);

// Done
// This route will be called in my_organisation_dashboard_promocode.html
// Before calling this route the employee will be confirmed once
employeeRouter.delete("/deletePromocode", deleteSpecificPromocode);

// Done
// This route will be called in my_organisation_dashboard.html
employeeRouter.get("/getAccountsInfo", listRevenueTicketOrderReports);

// Done
// This route will be called in my_organisation_dashboard.html
employeeRouter.get("/getGraphRecords", showGraphRecords);

// Done
// This route will be called to logout the employee
employeeRouter.get("/work_logout", employeeLogout);

module.exports = employeeRouter;
