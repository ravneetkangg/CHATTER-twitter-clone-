// backend/config/db.js
const mongoose = require("mongoose");

const dbConnect = () => {
    mongoose.connect("mongodb+srv://ravneetkang2003:Qub96c6xBOb9nkak@cluster0.tdraycq.mongodb.net/ChopX")
        .then(() => console.log("DB connection is successful"))
        .catch((error) => {
            console.log("Issue in DB connection");
            console.error(error.message);
            process.exit(1);
        });
}

module.exports = dbConnect;