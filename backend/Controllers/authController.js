import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
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

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

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

    const accessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_REFRESH_SECRET_KEY,
      { expiresIn: "15d" }
    );

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
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

export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Không tìm thấy refresh token!",
      });
    }

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

        const newAccessToken = jwt.sign(
          { id: user.id, role: user.role },
          process.env.JWT_SECRET_KEY,
          { expiresIn: "15m" }
        );

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

export const logout = async (req, res) => {
  try {
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
export const resetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại!" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "1h",
    });
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Đặt lại mật khẩu",
      html: `
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào link dưới đây để đặt lại:</p>
        <a href="${process.env.REACT_URL}/reset-password/${token}">Đặt lại mật khẩu</a>
        <p>Link này sẽ hết hạn sau 1 giờ.</p>
      `,
    };
    await transporter.sendMail(mailOptions);
    res.status(200).json({
      success: true,
      message: "Link đặt lại mật khẩu đã được gửi qua email!",
    });
  } catch (error) {
    console.error("Lỗi gửi email đặt lại mật khẩu:", error);
    res.status(500).json({ success: false, message: `Lỗi: ${error.message}` });
  }
};
export const resetPasswordConfirm = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Người dùng không tồn tại!" });
    }

    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(newPassword, salt);
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Đặt lại mật khẩu thành công!" });
  } catch (error) {
    console.error("Lỗi đặt lại mật khẩu:", error);
    res
      .status(400)
      .json({ success: false, message: "Link không hợp lệ hoặc đã hết hạn!" });
  }
};

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
