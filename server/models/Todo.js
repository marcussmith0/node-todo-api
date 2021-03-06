const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const todoSchema = new Schema({
    text: {
        type: String,
        minlength: 1,
        required: true,
        trim: true,
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Number,
        default: null
    },
    _creator: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    }
});

module.exports = mongoose.model("Todo", todoSchema);