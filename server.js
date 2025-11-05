// --- (server.js เวอร์ชันอัปเกรด ... รองรับ "หมวดหมู่") ---

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Order = require('./Order');
const Menu = require('./Menu'); 

const app = express();
const PORT = process.env.PORT || 3000; // (ใช้ PORT ที่ Render ให้มา)
const MONGO_URI = 'mongodb+srv://witchapol8500_db_user:food12345@cluster0.kqtpois.mongodb.net/'; 

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ เชื่อมต่อ MongoDB Atlas สำเร็จ!');
        seedDatabase(); 
    })
    .catch((err) => console.error('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ MongoDB:', err));

// --- Middlewares ---
app.use(cors());
app.use(express.json());

// ===============================================
//         API สำหรับ "หน้าร้าน" (index.html)
// ===============================================

// --- (GET) แจกจ่ายเมนู (เหมือนเดิม) ---
app.get('/api/menus', async (req, res) => {
    try {
        const menus = await Menu.find(); 
        res.json(menus); 
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อพลาดในการดึงเมนู' });
    }
});

// --- (POST) รับออเดอร์ (เหมือนเดิม) ---
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

// ===============================================
//         API สำหรับ "หน้าพ่อครัว" (admin.html)
// ===============================================

// --- (GET) ส่งออเดอร์ทั้งหมด (เหมือนเดิม) ---
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อพลาดในการดึงออเดอร์' });
    }
});

// --- (DELETE) ลบออเดอร์ (เหมือนเดิม) ---
app.delete('/api/orders/:id', async (req, res) => {
    try {
        await Order.findByIdAndDelete(req.params.id);
        res.json({ message: 'ออเดอร์ถูกลบแล้ว' });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อพลาดในการลบออเดอร์' });
    }
});

// --- (PUT) อัปเดตสถานะ (เหมือนเดิม) ---
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

// ===============================================
//         API สำหรับ "จัดการเมนู" (อัปเกรด)
// ===============================================

// --- 1. (POST) สร้างเมนูใหม่ (อัปเกรด: เพิ่ม category) ---
app.post('/api/menus', async (req, res) => {
    try {
        // (อัปเกรด: ดึง category มาจาก req.body)
        const { name, price, image, category } = req.body; 

        const newMenu = new Menu({
            name,
            price,
            image: image || 'https://via.placeholder.com/150?text=เมนูใหม่',
            category: category || 'อาหารจานเดียว' // (อัปเกรด: ใส่ category)
        });

        await newMenu.save();
        console.log(`✅ สร้างเมนูใหม่: ${name} (หมวด: ${category})`);
        res.status(201).json(newMenu); 

    } catch (error) {
        console.error('❌ เกิดข้อพลาดในการสร้างเมนู:', error);
        res.status(500).json({ message: 'เกิดข้อพลาดในการสร้างเมนู' });
    }
});

// --- 2. (PUT) อัปเดต/แก้ไขเมนู (อัปเกรด: เพิ่ม category) ---
app.put('/api/menus/:id', async (req, res) => {
    try {
        const menuId = req.params.id;
        // (อัปเกรด: ดึง category มาจาก req.body)
        const { name, price, image, category } = req.body; 

        const updatedMenu = await Menu.findByIdAndUpdate(
            menuId,
            { name, price, image, category }, // (อัปเกรด: เพิ่ม category)
            { new: true } 
        );

        if (!updatedMenu) {
            return res.status(404).json({ message: 'หาเมนูไม่เจอ' });
        }

        console.log(`✅ อัปเดตเมนู: ${updatedMenu.name}`);
        res.status(200).json(updatedMenu);

    } catch (error) {
        console.error('❌ เกิดข้อพลาดในการอัปเดตเมนู:', error);
        res.status(500).json({ message: 'เกิดข้อพลาดในการอัปเดตเมนู' });
    }
});

// --- 3. (DELETE) ลบเมนู (เหมือนเดิม) ---
app.delete('/api/menus/:id', async (req, res) => {
    try {
        const deletedMenu = await Menu.findByIdAndDelete(req.params.id);
        if (!deletedMenu) return res.status(404).json({ message: 'หาเมนูไม่เจอ' });
        console.log(`✅ ลบเมนู: ${deletedMenu.name}`);
        res.status(200).json({ message: `เมนู "${deletedMenu.name}" ถูกลบแล้ว` });
    } catch (error) {
        res.status(500).json({ message: 'เกิดข้อพลาดในการลบเมนู' });
    }
});


// ===============================================
//         ฟังก์ชันเติมเมนู (อัปเกรด)
// ===============================================
async function seedDatabase() {
    try {
        const count = await Menu.countDocuments();
        if (count > 0) {
            console.log('เมนูมีอยู่แล้ว ไม่ต้องเติม');
            return;
        }
        
        console.log('เมนูว่าง กำลังเติมเมนูเริ่มต้น (เวอร์ชันมีหมวดหมู่)...');
        
        // (อัปเกรด: เพิ่ม category ให้เมนูเริ่มต้น)
        const initialMenus = [
            { name: 'กะเพราหมูสับ', price: 50, image: 'https://via.placeholder.com/150?text=กะเพรา', category: 'อาหารจานเดียว' },
            { name: 'ข้าวผัดกุ้ง', price: 60, image: 'https://via.placeholder.com/150?text=ข้าวผัด', category: 'อาหารจานเดียว' },
            { name: 'คะน้าหมูกรอบ', price: 60, image: 'https://via.placeholder.com/150?text=คะน้า', category: 'อาหารจานเดียว' },
            { name: 'ไข่ดาว', price: 10, image: 'https://via.placeholder.com/150?text=ไข่ดาว', category: 'ของทอด/เพิ่มเติม' },
            { name: 'โค้ก', price: 20, image: 'https://via.placeholder.com/150?text=โค้ก', category: 'เครื่องดื่ม' },
            { name: 'น้ำเปล่า', price: 10, image: 'https://via.placeholder.com/150?text=น้ำเปล่า', category: 'เครื่องดื่ม' }
        ];
        
        await Menu.insertMany(initialMenus);
        console.log('✅ เติมเมนูเริ่มต้น (พร้อมหมวดหมู่) 6 รายการสำเร็จ!');
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดตอนเติมเมนู:', error);
    }
}

// --- (เหมือนเดิม) สั่งให้เซิร์ฟเวอร์เริ่มทำงาน ---
app.listen(PORT, () => {
    console.log(`Backend server (เวอร์ชันอัปเกรด) is running on port ${PORT}`);
});