const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// นี่คือ \"พิมพ์เขียว\" ของเมนู (อัปเกรด)
const menuSchema = new Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    image: { type: String, required: false },
    
    // --- (นี่คือช่องใหม่ที่เราเพิ่ม) ---
    category: { type: String, required: true, default: 'อาหารจานเดียว' } 
    // default: 'อาหารจานเดียว' หมายถึง ถ้าเราไม่กรอก มันจะใส่หมวดนี้ให้
});

// สร้างโมเดลชื่อ 'Menu' จากพิมพ์เขียวนี้
module.exports = mongoose.model('Menu', menuSchema);