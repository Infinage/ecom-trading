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
        }
    },

    description: String,

    category: {
        type: String,
        enum: ["Men's Clothing", "Women's Clothing", "Jewelery", "Electronic"]
    },

    image: String,

    rating: [{
        rate: Number,
        count: {
            type: Number,
            validate: val => val > 0 && Number.isInteger(val)
        }
    }]

}, {timestamps: true});

module.exports = mongoose.model("Product", ProductSchema);