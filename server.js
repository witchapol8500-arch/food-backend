// --- (server.js เวอร์ชัน "ก่อน" Login ... (เวอร์ชัน "หมวดหมู่")) ---

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Order = require('./Order');
const Menu = require('./Menu'); 

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb+srv://witchapol8500_db_user:food12345@cluster0.kqtpois.mongodb.net/'; 

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ เชื่อมต่อ MongoDB Atlas สำเร็จ!');
        seedDatabase(); 
    })
    .catch((err) => console.error('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ MongoDB:', err));

app.use(cors());
app.use(express.json());

// ===============================================
//         API "เดิม" (เมนู, ออเดอร์)
// ===============================================

app.get('/api/menus', async (req, res) => {
    try {
        const menus = await Menu.find(); 
        res.json(menus); 
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อพลาดในการดึงเมนู' });
    }
});
app.post('/api/order', async (req, res) => {
    try {
        const { items } = req.body;
        let total = 0;
        items.forEach(item => {
            total += item.price * item.quantity;
        });
        const newOrder = new Order({ items, total });
        await newOrder.save();
        res.status(201).json({ message: 'ได้รับออเดอร์ (บันทึกแล้ว!)' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกออเดอร์' });
    }
});
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อพลาดในการดึงออเดอร์' });
    }
});
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'ออเดอร์ถูกลบแล้ว' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อพลาดในการลบออเดอร์' });
    }
});
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true }
        );
        res.json(updatedOrder);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อพลาดในการอัปเดตสถานะ' });
    }
});
app.post('/api/menus', async (req, res) => {
    try {
        const { name, price, image, category } = req.body; 
        const newMenu = new Menu({
            name,
            price,
            image: image || 'https://via.placeholder.com/150?text=เมนูใหม่',
            category: category || 'อาหารจานเดียว'
        });
        await newMenu.save();
        res.status(201).json(newMenu); 
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อพลาดในการสร้างเมนู' });
    }
});
app.put('/api/menus/:id', async (req, res) => {
    try {
        const menuId = req.params.id;
        const { name, price, image, category } = req.body; 
        const updatedMenu = await Menu.findByIdAndUpdate(
            menuId,
            { name, price, image, category },
            { new: true } 
        );
        if (!updatedMenu) {
            return res.status(404).json({ message: 'หาเมนูไม่เจอ' });
        }
        res.status(200).json(updatedMenu);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อพลาดในการอัปเดตเมนู' });
    }
});
app.delete('/api/menus/:id', async (req, res) => {
    try {
        const deletedMenu = await Menu.findByIdAndDelete(req.params.id);
        if (!deletedMenu) return res.status(404).json({ message: 'หาเมนูไม่เจอ' });
        res.status(200).json({ message: `เมนู "${deletedMenu.name}" ถูกลบแล้ว` });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อพลาดในการลบออเดอร์' });
    }
});
async function seedDatabase() { /* (โค้ด Seed ... (ไม่พัง)) */ }

app.listen(PORT, () => {
    console.log(`Backend server (เวอร์ชัน "หมวดหมู่") is running on port ${PORT}`);
});