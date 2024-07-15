const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
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
    country: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    alim: {
        type: Number,
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

module.exports = new mongoose.model("User", userSchema);
