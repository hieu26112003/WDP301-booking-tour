import Comment from "../models/Comment.js";

/**
 * Tạo comment mới (user gửi)
 * @route POST /api/comments
 */
export const createComment = async (req, res) => {
  try {
    const { content, tourId } = req.body;

    if (!content || !tourId) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
    }

    const comment = await Comment.create({ content, tourId });
    res.status(201).json({ success: true, data: comment });
  } catch (err) {
    console.error("Error in createComment:", err);
    res.status(500).json({ success: false, message: "Lỗi khi tạo comment" });
  }
};



export const getAllComments = async (req, res) => {
  try {
    // Lấy tất cả comments và populate tên tour
    const comments = await Comment.find()
      .populate("tourId", "title")  // chỉ lấy trường 'title' của Tour
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (err) {
    console.error("Error in getAllComments:", err);
    return res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách comments",
    });
  }
};


/**
 * Lấy danh sách comment đã duyệt của 1 tour
 * @route GET /api/comments/tour/:tourId
 */
export const getCommentsByTourId = async (req, res) => {
  try {
    const { tourId } = req.params;
    const comments = await Comment.find({ tourId, approved: true }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: comments });
  } catch (err) {
    console.error("Error in getCommentsByTourId:", err);
    res.status(500).json({ success: false, message: "Lỗi khi lấy comment" });
  }
};

/**
 * Lấy danh sách comment chưa duyệt (dành cho staff)
 * @route GET /api/comments/pending
 */
export const getPendingComments = async (req, res) => {
  try {
    const comments = await Comment.find({ approved: false }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: comments });
  } catch (err) {
    console.error("Error in getPendingComments:", err);
    res.status(500).json({ success: false, message: "Lỗi khi lấy comment chờ duyệt" });
  }
};

/**
 * Duyệt comment (staff)
 * @route PATCH /api/comments/:id/approve
 */
export const approveComment = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Comment.findByIdAndUpdate(id, { approved: true }, { new: true });

    if (!updated) {
      return res.status(404).json({ success: false, message: "Không tìm thấy comment" });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    console.error("Error in approveComment:", err);
    res.status(500).json({ success: false, message: "Lỗi khi duyệt comment" });
  }
};

/**
 * Xóa comment (staff)
 * @route DELETE /api/comments/:id
 */
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Comment.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Không tìm thấy comment" });
    }

    res.status(200).json({ success: true, message: "Đã xóa comment" });
  } catch (err) {
    console.error("Error in deleteComment:", err);
    res.status(500).json({ success: false, message: "Lỗi khi xóa comment" });
  }
};
