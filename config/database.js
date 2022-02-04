const mongoose = require("mongoose");

const { MONGO_URI } = process.env;

exports.connect = () => {
    mongoose.connect(
        MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }
    ).then(() => {
        console.log("Successfully connected to DB!");
    }).catch((error) => {
        console.log("DB connection failed, exiting...");
        console.log(error);
        process.exit(1);
    })
    console.log("Pooja");
}
