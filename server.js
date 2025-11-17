// --- (server.js เวอร์ชัน "Login" ... ผ่าตัดใหญ่) ---

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // (*** 1. เรียกใช้ "แม่กุญแจ" ***)
const jwt = require('jsonwebtoken'); // (*** 2. เรียกใช้ "ตั๋ว" ***)

// (เรียก "พิมพ์เขียว" ทั้ง 3 อัน)
const Order = require('./Order');
const Menu = require('./Menu'); 
const User = require('./User'); // (*** 3. เรียกใช้ "พิมพ์เขียวสมาชิก" ***)

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = 'mongodb+srv://witchapol8500_db_user:food12345@cluster0.kqtpois.mongodb.net/'; 

// (*** 4. "กุญแจลับ" ... เอาไว้ใช้ "สร้างตั๋ว" (Token) ***)
// (คุณจะเปลี่ยน 'YourSecretKey' เป็นอะไรก็ได้ที่ลับๆ)
const JWT_SECRET = 'MySuperSecretKeyForFoodApp12345';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ เชื่อมต่อ MongoDB Atlas สำเร็จ!');
        seedDatabase(); 
    })
    .catch((err) => console.error('❌ เกิดข้อผิดพลาดในการเชื่อมต่อ MongoDB:', err));

app.use(cors());
app.use(express.json());

// ===============================================
//         (*** 5. API ใหม่! ... สำหรับ "Login") ***
// ===============================================

// --- (POST) /api/auth/register (สมัครสมาชิก) ---
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // (กันเหนียว: เช็กว่ากรอกครบไหม)
        if (!username || !password) {
            return res.status(400).json({ message: 'กรุณากรอก username และ password' });
        }

        // (เช็กว่า "ซ้ำ" ไหม)
        const existingUser = await User.findOne({ username: username.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'Username นี้ถูกใช้ไปแล้ว' });
        }

        // (*** "เข้ารหัส" รหัสผ่าน! ***)
        const hashedPassword = await bcrypt.hash(password, 10); // (10 คือความยาก)

        // (สร้าง User ใหม่)
        const newUser = new User({
            username: username.toLowerCase(),
            password: hashedPassword // (เก็บรหัสที่ "เข้ารหัส" แล้ว)
        });

        await newUser.save();
        console.log(`✅ สมัครสมาชิกสำเร็จ: ${username}`);
        res.status(201).json({ message: `สร้าง User ${username} สำเร็จ!` });

    } catch (error) {
        console.error('❌ เกิดข้อพลาดในการ Register:', error);
        res.status(500).json({ message: 'เกิดข้อพลาดในเซิร์ฟเวอร์' });
    }
});


// --- (POST) /api/auth/login (เข้าสู่ระบบ) ---
app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // (1. หา User)
        const user = await User.findOne({ username: username.toLowerCase() });
        if (!user) {
            return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
        }

        // (2. "เปรียบเทียบ" รหัสผ่าน ... (bcrypt จะเทียบ "ของจริง" กับ "ที่เข้ารหัส"))
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
        }

        // (3. "ผ่าน!" ... สร้าง "ตั๋ว" (Token) ให้เขา)
        const token = jwt.sign(
            { userId: user._id, username: user.username }, // (ข้อมูลในตั๋ว)
            JWT_SECRET, // (ใช้ "กุญแจลับ" ของเรา)
            { expiresIn: '1d' } // (ตั๋วหมดอายุใน 1 วัน)
        );
        
        console.log(`✅ ${username} Login สำเร็จ!`);
        // (4. ส่ง "ตั๋ว" กลับไปให้ Frontend)
        res.status(200).json({ 
            message: 'Login สำเร็จ!',
            token: token,
            username: user.username
        });

    } catch (error) {
        console.error('❌ เกิดข้อพลาดในการ Login:', error);
        res.status(500).json({ message: 'เกิดข้อพลาดในเซิร์ฟเวอร์' });
    }
});


// ===============================================
//         API "เดิม" (เมนู, ออเดอร์) ... (ไม่แก้อะไรเลย)
// ===============================================
// (เราจะมา "ล็อค" API พวกนี้ในสเต็ปถัดไป ... ตอนนี้ปล่อยไว้ก่อน)

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
async function seedDatabase() { /* (เหมือนเดิม) */ }

// --- (เหมือนเดิม) สั่งให้เซิร์ฟเวอร์เริ่มทำงาน ---
app.listen(PORT, () => {
    console.log(`Backend server (เวอร์ชัน "Login") is running on port ${PORT}`);
});