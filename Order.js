const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// นี่คือ "พิมพ์เขียว" ของสินค้าแต่ละชิ้นในตะกร้า
const itemSchema = new Schema({
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

// นี่คือ "พิมพ์เขียว" ของออเดอร์ทั้งใบ
const orderSchema = new Schema({
    items: [itemSchema], // เก็บสินค้าเป็นอาร์เรย์ (หลายชิ้น)
    total: { type: Number, required: true },
    status: { type: String, required: true, default: 'กำลังรอ...' }, // <<< เพิ่มบรรทัดนี้
    createdAt: { type: Date, default: Date.now } // ใส่วันที่อัตโนมัติ
});

// สร้างโมเดลชื่อ 'Order' จากพิมพ์เขียวนี้ และส่งออกไปให้ไฟล์อื่นใช้
module.exports = mongoose.model('Order', orderSchema);