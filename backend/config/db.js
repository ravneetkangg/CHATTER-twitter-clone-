const mongoose = require("mongoose");
require("dotenv").config();
require("colors");

const dbConnect = () => {
    mongoose.connect(process.env.MONGODB_URL)
        .then(() => console.log("DB connection is successful".green.bold))
        .catch((error) => {
            console.log("Issue in DB connection".red.bold);
            console.error(error.message.red);
            process.exit(1);
        });
};

module.exports = dbConnect;