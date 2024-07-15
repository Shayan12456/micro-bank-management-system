const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const balanceSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    amount: 
});

module.exports = new mongoose.model("Balance", userSchema);
