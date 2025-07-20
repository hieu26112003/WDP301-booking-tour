import express from 'express';
import Contact from '../models/Contact.js';

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

export default router;
