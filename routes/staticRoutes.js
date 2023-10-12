const { contactUs, listAllEvents, eventOnIndexPage } = require("../controller/staticController");
const { isAuthenticated } = require("../middleware/auth");
const staticRouter = require("express").Router();

// Done
// This route is called by contact_us.html when the submit button is clicked
staticRouter.post("/contact_us", isAuthenticated, contactUs);

// Done
// This route is called by index.html and index_dashboard.html when the page is loaded
staticRouter.get("/eventsOnIndexPage", eventOnIndexPage);

// Done
// This route is called by explore_events.html
staticRouter.get("/listAllEvents", isAuthenticated, listAllEvents);

module.exports = staticRouter;
