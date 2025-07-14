import Guide from '../models/Guide.js';

// [GET] /api/guides - Lấy tất cả bài viết
export const getAllGuides = async (req, res) => {
  try {
    const guides = await Guide.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: guides });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// [GET] /api/guides/:slug - Lấy chi tiết bài viết theo slug
export const getGuideBySlug = async (req, res) => {
  try {
    const guide = await Guide.findOne({ slug: req.params.slug });

    if (!guide) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    res.status(200).json({ success: true, data: guide });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
};

// [POST] /api/guides - Tạo bài viết mới (cần middleware bảo vệ)
export const createGuide = async (req, res) => {
  try {
    const newGuide = new Guide(req.body);
    await newGuide.save();
    res.status(201).json({ success: true, data: newGuide });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Không thể tạo bài viết' });
  }
};

// [PUT] /api/guides/:id - Cập nhật bài viết
export const updateGuide = async (req, res) => {
  try {
    const updatedGuide = await Guide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedGuide) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    res.status(200).json({ success: true, data: updatedGuide });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Không thể cập nhật bài viết' });
  }
};

// [DELETE] /api/guides/:id - Xóa bài viết
export const deleteGuide = async (req, res) => {
  try {
    const deleted = await Guide.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: 'Không tìm thấy bài viết để xóa' });
    }

    res.status(200).json({ success: true, message: 'Xóa bài viết thành công' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa bài viết' });
  }
};
