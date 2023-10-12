// This middleware is used only to protect unauthorised people accessing the data from postman or some other client.

const Employee = require("../model/employeeModel");

const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/index.html");
    }
};

// This middleware is used to check whether an employee is logged in or not
// If yes, it returns data by which frontend code is modified/changed
const checkEmployeeLogin = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.role === "user") {
            return res.status(403).json({ result: false, data: "Unauthorized" });
        }
        let loggedInPerson = await Employee.findById(req.user.id);
        if (!loggedInPerson) {
            return res.status(404).json({ result: false, data: "Employee not registered" });
        }
        if (req.user.role === "admin") {
            return res.status(200).json({ result: true, data: "admin" });
        } else if (req.user.role === "basic") {
            return res.status(200).json({ result: true, data: "basic" });
        } else if (req.user.role === "power user") {
            return res.status(200).json({ result: true, data: "power user" });
        } else if (req.user.role === "finance") {
            return res.status(200).json({ result: true, data: "finance" });
        }
    } else {
        return res.status(401).json({ result: false, data: "Unauthorized" });
    }
};

// This middleware checks which type of employee is logged in
// This middleware is called by only particular pages
const checkEmployeeAuthorized = async (req, res, next) => {
    if (req.isAuthenticated()) {
        if (req.user.role === "user") {
            return res.status(403).json({ result: false, data: "Unauthorized" });
        }
        let loggedInPerson = await Employee.findById(req.user.id);
        if (!loggedInPerson) {
            return res.status(404).json({ result: false, data: "Employee not registered" });
        }
        if (req.user.role === "basic" || req.user.role === "finance") {
            return res.status(403).json({ result: false, data: "Forbidden" });
        } else {
            return res.status(200).json({ result: true, data: "" });
        }
    } else {
        return res.status(401).json({ result: false, data: "Unauthorized" });
    }
};

module.exports = {
    isAuthenticated,
    checkEmployeeLogin,
    checkEmployeeAuthorized,
};
