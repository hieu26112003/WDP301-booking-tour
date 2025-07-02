import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const register = async (req, res) => {
  try {
    const existingUser = await User.findOne({
      $or: [{ email: req.body.email }, { username: req.body.username }],
    });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email hoặc username đã tồn tại!",
      });
    }

    // Hash mật khẩu
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    // Tạo người dùng mới
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hash,
      fullname: req.body.fullname || "",
      address: req.body.address || "",
      phone: req.body.phone || "",
      avatar: req.file ? `user_images/${req.file.filename}` : null,
    });

    await newUser.save();

    res.status(200).json({ success: true, message: "Đăng ký thành công!" });
  } catch (error) {
    console.error("Lỗi đăng ký:", error);
    res.status(500).json({
      success: false,
      message: `Đăng ký thất bại: ${error.message}`,
    });
  }
};

// Đăng nhập người dùng
export const login = async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tồn tại!",
      });
    }

    const checkCorrectPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!checkCorrectPassword) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu sai!",
      });
    }

    const { password, role, ...rest } = user._doc;

    // Tạo accessToken (hết hạn trong 15 phút)
    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );

    // Tạo refreshToken (hết hạn trong 15 ngày)
    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: "15d" }
    );

    // Lưu refreshToken và accessToken vào cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 ngày
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 phút
    });

    res.status(200).json({
      success: true,
      accessToken,
      role: user.role,
      data: { ...rest, role: user.role },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({
      success: false,
      message: `Đăng nhập thất bại: ${error.message}`,
    });
  }
};

// Làm mới token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy refresh token!",
      });
    }

    // Xác minh refreshToken
    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY,
      (err, user) => {
        if (err) {
          return res.status(403).json({
            success: false,
            message: "Refresh token không hợp lệ!",
          });
        }

        // Tạo accessToken mới
        const newAccessToken = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "15m" }
        );

        // Lưu accessToken mới vào cookie
        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          maxAge: 15 * 60 * 1000,
        });

        res.status(200).json({
          success: true,
          accessToken: newAccessToken,
        });
      }
    );
  } catch (error) {
    console.error("Lỗi làm mới token:", error);
    res.status(500).json({
      success: false,
      message: `Lỗi làm mới token: ${error.message}`,
    });
  }
};

// Lấy thông tin người dùng hiện tại
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tìm thấy!",
      });
    }
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Lỗi lấy thông tin người dùng:", error);
    res.status(500).json({
      success: false,
      message: `Lỗi: ${error.message}`,
    });
  }
};

// Đăng xuất
export const logout = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json({
      success: true,
      message: "Đăng xuất thành công!",
    });
  } catch (error) {
    console.error("Lỗi đăng xuất:", error);
    res.status(500).json({
      success: false,
      message: `Lỗi đăng xuất: ${error.message}`,
    });
  }
};

// Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tìm thấy!",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);

    user.password = hash;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Đặt lại mật khẩu thành công!",
    });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: `Lỗi đặt lại mật khẩu: ${error.message}`,
    });
  }
};

// Cập nhật hồ sơ người dùng
export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, fullname, address, phone } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tìm thấy!",
      });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.fullname = fullname || user.fullname;
    user.address = address || user.address;
    user.phone = phone || user.phone;

    if (req.file) {
      user.avatar = `user_images/${req.file.filename}`;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Cập nhật hồ sơ thành công!",
      data: user,
    });
  } catch (error) {
    console.error("Lỗi cập nhật hồ sơ:", error);
    res.status(500).json({
      success: false,
      message: `Lỗi cập nhật hồ sơ: ${error.message}`,
    });
  }
};

// Đổi mật khẩu
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Người dùng không tìm thấy!",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Mật khẩu hiện tại không đúng!",
      });
    }

    const salt = bcrypt.genSaltSync(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công!",
    });
  } catch (error) {
    console.error("Lỗi đổi mật khẩu:", error);
    res.status(500).json({
      success: false,
      message: `Lỗi đổi mật khẩu: ${error.message}`,
    });
  }
};
