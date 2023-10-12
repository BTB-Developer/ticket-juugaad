const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
    employee_username: {
        type: String,
        required: true,
    },
    employee_email: {
        type: String,
        required: true,
        unique: true,
    },
    employee_password: {
        type: String,
        required: true,
    },
    employee_phonenumber: {
        type: String,
        unique: true,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
});

const Employee = mongoose.model("employee", employeeSchema);

module.exports = Employee;
