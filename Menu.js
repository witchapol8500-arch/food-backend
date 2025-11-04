const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// นี่คือ "พิมพ์เขียว" ของเมนูอาหาร
const menuSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: true }
});

module.exports = mongoose.model('Menu', menuSchema);