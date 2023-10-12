const mongoose = require("mongoose");

async function connectDB() {
    mongoose
        .connect(process.env.MONGO_ATLAS_URL)
        .then(() => {
            return console.log(`Database Connected`);
        })
        .catch((error) => {
            return console.log(`Error in connecting database : ${error}`);
        });
}

module.exports = connectDB;
