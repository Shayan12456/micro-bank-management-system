const mongoose = require("mongoose");
const User = require("./user.js");
const Schema = mongoose.Schema;

const balanceSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    amount: {
        type: Number,
        required: true
    }
});

module.exports = new mongoose.model("Balance", balanceSchema);
