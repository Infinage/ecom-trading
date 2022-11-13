const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    
    title: {
        type: String,
        required: true
    }, 

    price: {
        type: Number,
        validate: {
            validator: ele => ele > 0,
            message: "Price must be positive: {VALUE}"
        },
        required: true
    },

    description: String,

    category: {
        type: String,
        enum: ["Apparel", "Electronics", "Furniture", "Utensils", "Other"],
        required: true
    },

    image: {
        type: String,
        default: process.env.DEFAULT_IMAGE_URL
    },

    count: {
        type: Number,
        validate: cnt => Number.isInteger(cnt) && cnt >= 0,
        default: 1
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, {timestamps: true});

module.exports = mongoose.model("Product", ProductSchema);