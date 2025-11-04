const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Order = require('./Order');
const Menu = require('./Menu'); 

const app = express();
const PORT = process.env.PORT || 3000;

// --- ⚠️ กุญแจ (Connection String) อันใหม่ของคุณ ('kqtpois') ---
const MONGO_URI = 'mongodb+srv://witchapol8500_db_user:food12345@cluster0.kqtpois.mongodb.net/'; 

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ เชื่อมต่อ MongoDB Atlas สำเร็จ!');
        seedDatabase(); 
    })
    .catch((err) => console.error('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ MongoDB:', err));

// --- Middlewares (เหมือนเดิม) ---
app.use(cors());
app.use(express.json());

// --- API Route สำหรับ "แจกจ่ายเมนู" ---
app.get('/api/menus', async (req, res) => {
    try {
        const menus = await Menu.find(); 
        res.json(menus); 
    } catch (error) {
        console.error('❌ เกิดข้อพลาดในการดึงเมนู:', error);
        res.status(500).json({ message: 'เกิดข้อพลาดในการดึงเมนู' });
    }
});
// ===============================================
//         (ใหม่) API สำหรับ "จัดการเมนู" (CRUD)
// ===============================================

// --- 1. (POST) สร้างเมนูใหม่ ---
app.post('/api/menus', async (req, res) => {
    try {
        const { name, price, image } = req.body; // ดึงข้อมูลเมนูใหม่จาก body

        const newMenu = new Menu({
            name,
            price,
            image: image || 'https://via.placeholder.com/150?text=เมนูใหม่' // ใส่รูป Default ถ้าไม่ส่งมา
        });

        await newMenu.save(); // บันทึกเมนูใหม่
        console.log(`✅ สร้างเมนูใหม่: ${name}`);
        res.status(201).json(newMenu); // ส่งเมนูที่สร้างเสร็จกลับไป

    } catch (error) {
        console.error('❌ เกิดข้อพลาดในการสร้างเมนู:', error);
        res.status(500).json({ message: 'เกิดข้อพลาดในการสร้างเมนู' });
    }
});

// --- 2. (PUT) อัปเดต/แก้ไขเมนู ---
app.put('/api/menus/:id', async (req, res) => {
    try {
        const menuId = req.params.id;
        const { name, price, image } = req.body; // ดึงข้อมูลที่จะอัปเดต

        const updatedMenu = await Menu.findByIdAndUpdate(
            menuId,
            { name, price, image }, // สิ่งที่จะอัปเดต
            { new: true } // ส่งค่าที่อัปเดตแล้วกลับมา
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

// --- 3. (DELETE) ลบเมนู ---
app.delete('/api/menus/:id', async (req, res) => {
    try {
        const menuId = req.params.id;
        const deletedMenu = await Menu.findByIdAndDelete(menuId);

        if (!deletedMenu) {
            return res.status(404).json({ message: 'หาเมนูไม่เจอ' });
        }

        console.log(`✅ ลบเมนู: ${deletedMenu.name}`);
        res.status(200).json({ message: `เมนู "${deletedMenu.name}" ถูกลบแล้ว` });

    } catch (error) {
        console.error('❌ เกิดข้อพลาดในการลบเมนู:', error);
        res.status(500).json({ message: 'เกิดข้อพลาดในการลบเมนู' });
    }
});
// --- API Route สำหรับ "ส่งออเดอร์ทั้งหมด" (หน้า Admin) ---
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders); 
    } catch (error) {
        console.error('❌ เกิดข้อพลาดในการดึงออเดอร์:', error);
        res.status(500).json({ message: 'เกิดข้อพลาดในการดึงออเดอร์' });
    }
});

// --- (นี่คืออันที่เราเพิ่มล่าสุด) API Route สำหรับ "ลบออเดอร์" ---
app.delete('/api/orders/:id', async (req, res) => {
    try {
        const orderId = req.params.id; 
        const deletedOrder = await Order.findByIdAndDelete(orderId);

        if (!deletedOrder) {
            return res.status(404).json({ message: 'หาออเดอร์ไม่เจอ' });
        }

        console.log(`✅ ออเดอร์ #${orderId} ถูกลบแล้ว`);
        res.status(200).json({ message: `ออเดอร์ #${orderId} ถูกลบแล้ว` });

    } catch (error) {
        console.error('❌ เกิดข้อพลาดในการลบออเดอร์:', error);
        res.status(500).json({ message: 'เกิดข้อพลาดในการลบออเดอร์' });
    }
});
// --- API Route ใหม่ สำหรับ "อัปเดตสถานะ" ---
// เราใช้ 'app.put' เพื่ออัปเดต
app.put('/api/orders/:id/status', async (req, res) => {
    try {
        const orderId = req.params.id;
        const { status } = req.body; // ดึง 'สถานะใหม่' ที่ส่งมาจากหน้า Admin

        if (!status) {
            return res.status(400).json({ message: 'กรุณาส่งสถานะที่ต้องการอัปเดต' });
        }

        // สั่ง Mongoose ให้ "ค้นหา" (Find By Id) และ "อัปเดต" (And Update)
        // { new: true } หมายความว่า "ส่งค่าที่อัปเดตแล้วกลับมาด้วย"
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId, 
            { status: status }, // สิ่งที่จะอัปเดต
            { new: true } 
        );

        if (!updatedOrder) {
            return res.status(404).json({ message: 'หาออเดอร์ไม่เจอ' });
        }

        console.log(`✅ อัปเดตสถานะ ออเดอร์ #${orderId} เป็น: ${status}`);
        res.status(200).json(updatedOrder); // ส่งออเดอร์ที่อัปเดตแล้วกลับไป

    } catch (error) {
        console.error('❌ เกิดข้อพลาดในการอัปเดตสถานะ:', error);
        res.status(500).json({ message: 'เกิดข้อพลาดในการอัปเดตสถานะ' });
    }
});
// --- API Route สำหรับ "รับออเดอร์" (อันที่ 'กดสั่งไม่ได้' ตอนนี้) ---
app.post('/api/order', async (req, res) => { 
    try {
        const orderData = req.body; 
        let total = orderData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        const newOrder = new Order({
            items: orderData.items,
            total: total
        });
        await newOrder.save(); 

        console.log('============= 🌟 ออเดอร์ใหม่ถูก *บันทึก* ลง DB แล้ว! =============');
        console.log(newOrder); 
        console.log('===========================================================');

        res.status(201).json({ 
            message: 'ได้รับออเดอร์ (บันทึกแล้ว!) กำลังเตรียมอาหาร...' 
        });
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดในการบันทึกออเดอร์:', error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการบันทึกออเดอร์' });
    }
});

// --- (โบนัส) ฟังก์ชันเติมเมนูอัตโนมัติ (เหมือนเดิม) ---
async function seedDatabase() {
    try {
        const count = await Menu.countDocuments();
        if (count > 0) {
            console.log('เมนูมีอยู่แล้ว ไม่ต้องเติม');
            return;
        }
        console.log('เมนูว่าง กำลังเติมเมนูเริ่มต้น...');
        const initialMenus = [
            { name: 'กะเพราหมูสับ', price: 50, image: 'https://via.placeholder.com/150?text=กะเพรา' },
            { name: 'ข้าวผัดกุ้ง', price: 60, image: 'https://via.placeholder.com/150?text=ข้าวผัด' },
            { name: 'คะน้าหมูกรอบ', price: 60, image: 'https://via.placeholder.com/150?text=คะน้า' },
            { name: 'ไข่ดาว', price: 10, image: 'https://via.placeholder.com/150?text=ไข่ดาว' }
        ];
        await Menu.insertMany(initialMenus);
        console.log('✅ เติมเมนู 4 รายการสำเร็จ!');
    } catch (error) {
        console.error('❌ เกิดข้อผิดพลาดตอนเติมเมนู:', error);
    }
}

// --- สั่งให้เซิร์ฟเวอร์เริ่มทำงาน (เหมือนเดิม) ---
app.listen(PORT, () => {
    console.log(`Backend server is running at http://localhost:${PORT}`);
});