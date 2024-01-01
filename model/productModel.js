const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    discountPrice: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    productImages: [{
        type: String,
        required: true,
    }],
    category: {
        type: String,
        required: true,
    },
    material: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
    },
    shape: {
        type: String,
        required: true,  
    },
    date: {
        type: Date,
        default: Date.now,
    },
    rating: {
        type: Number,
        default: 0,
    },
    isListed: {
        type: Boolean,
        default: true,
    },
    isOutOfStock: {
        type: Boolean,
        default: false,
    },
});

productSchema.index({ name: 'text', category: 'text', brand: 'text' }, { default_language: 'English' });

module.exports = mongoose.model("Product", productSchema);
