import express from 'express';
import Contact from '../models/Contact.js';
import User from '../models/User.js';

const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const { type, phone, name, email, address, feedback } = req.body;

        if (!type || !phone) {
            return res.status(400).json({ error: 'Thiếu thông tin bắt buộc' });
        }

        const newContact = new Contact({ type, phone, name, email, address, feedback });
        await newContact.save();
        res.status(201).json({ message: 'Gửi thành công!' });
    } catch (err) {
        res.status(500).json({ error: 'Lỗi máy chủ' });
    }
});

// ✅ API: Lấy tất cả feedbacks
router.get('/feedbacks', async (req, res) => {
    try {
        const feedbacks = await Contact.find({ type: 'feedback' }).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách feedbacks' });
    }
});

// ✅ API: Lấy tất cả callback requests
router.get('/callbacks', async (req, res) => {
    try {
        const callbacks = await Contact.find({ type: 'callback' }).sort({ createdAt: -1 }).populate('calledBy', 'fullname');
        res.json(callbacks);
    } catch (err) {
        res.status(500).json({ error: 'Lỗi khi lấy danh sách callbacks' });
    }
});

// API staff đã gọi
router.put('/callback/:id/call', async (req, res) => {
    try {
        const { staffId } = req.body;

        const staff = await User.findById(staffId);
        if (!staff || staff.role !== 'staff') {
            return res.status(403).json({ error: 'Không hợp lệ hoặc không phải nhân viên' });
        }

        const updated = await Contact.findByIdAndUpdate(
            req.params.id,
            { called: true, calledBy: staff._id },
            { new: true }
        ).populate('calledBy', 'fullname'); // chỉ lấy fullname để hiển thị

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Lỗi khi cập nhật trạng thái đã gọi' });
    }
});


export default router;
