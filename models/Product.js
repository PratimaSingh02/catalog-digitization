const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
    SKU: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    inventory: {
        type: Number,
        required: true
    },
    colours: {
        type: [String],
        required: true
    },
    sizes: {
        type: [String],
        required: true
    },
    brand: {
        type: String
    }
},
    {
        timestamps: true
    });

module.exports = mongoose.model("user", ProductSchema);