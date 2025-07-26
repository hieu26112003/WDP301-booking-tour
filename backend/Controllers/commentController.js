import Comment from "../models/Comment.js";

/**
 * Tạo comment mới (user gửi)
 * @route POST /api/comments
 */
export const createComment = async (req, res) => {
  try {
    const { content, tourId } = req.body;
    const userId = req.user.id;
    
    if (!content || !tourId) {
      return res.status(400).json({ success: false, message: "Thiếu dữ liệu" });
    }
    
    const comment = await Comment.create({ 
      content, 
      tourId, 
      userId 
    });
    
    // Populate ngay sau khi tạo để trả về đầy đủ thông tin
    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username');
    
    res.status(201).json({ success: true, data: populatedComment });
  } catch (err) {
    console.error("Error in createComment:", err);
    res.status(500).json({ success: false, message: "Lỗi khi tạo comment" });
  }
};



// Trong commentController.js
export const getAllComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate('userId', 'username email') // Đảm bảo populate email
      .populate('tourId', 'title')
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: comments });
  } catch (err) {
    console.error("Error in getAllComments:", err);
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};


/**
 * Lấy danh sách comment đã duyệt của 1 tour
 * @route GET /api/comments/tour/:tourId
 */
// Trong commentController.js
export const getCommentsByTourId = async (req, res) => {
  try {
    const { tourId } = req.params;
    
    const comments = await Comment.find({ tourId })
      .populate('userId', 'username') // Populate để lấy username
      .sort({ createdAt: -1 });
    
    res.status(200).json({ success: true, data: comments });
  } catch (err) {
    console.error("Error in getCommentsByTourId:", err);
    res.status(500).json({ success: false, message: "Lỗi khi lấy comments" });
  }
};


// Trong commentController.js
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    console.log("Delete request - Comment ID:", id); // Debug
    console.log("Delete request - User ID:", userId); // Debug
    console.log("Delete request - User role:", req.user.role); // Debug
    
    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: "Comment không tồn tại" 
      });
    }
    
    console.log("Found comment - Owner ID:", comment.userId); // Debug
    
    // Chỉ cho phép user sở hữu comment hoặc admin/staff xóa
    if (comment.userId.toString() !== userId && 
        req.user.role !== 'admin' && 
        req.user.role !== 'staff') {
      return res.status(403).json({ 
        success: false, 
        message: "Không có quyền xóa comment này" 
      });
    }
    
    await Comment.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true, 
      message: "Xóa comment thành công" 
    });
  } catch (err) {
    console.error("Error in deleteComment:", err);
    res.status(500).json({ 
      success: false, 
      message: "Lỗi server: " + err.message 
    });
  }
};
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment không tồn tại" });
    }

    // Chỉ cho phép user sở hữu comment hoặc admin edit
    if (comment.userId.toString() !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Không có quyền" });
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      id, 
      { content }, 
      { new: true }
    ).populate('userId', 'username');

    res.status(200).json({ success: true, data: updatedComment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
};
