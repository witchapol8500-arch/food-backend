const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// นี่คือ \"พิมพ์เขียว\" ของ \"สมาชิก\"
const userSchema = new Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, // (ห้ามซ้ำ)
        lowercase: true // (บังคับเป็นตัวเล็ก)
    },
    password: { 
        type: String, 
        required: true 
    }
});

// สร้างโมเดลชื่อ 'User' จากพิมพ์เขียวนี้
module.exports = mongoose.model('User', userSchema);