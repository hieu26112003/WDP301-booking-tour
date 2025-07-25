import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Tên đăng nhập là bắt buộc"],
      unique: true,
      maxlength: [50, "Tên đăng nhập không được vượt quá 50 ký tự"],
      trim: true,
    },
    fullname: {
      type: String,
      required: [true, "Họ và tên là bắt buộc"],
      maxlength: [100, "Họ và tên không được vượt quá 100 ký tự"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Địa chỉ là bắt buộc"],
      maxlength: [255, "Địa chỉ không được vượt quá 255 ký tự"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Số điện thoại là bắt buộc"],
      maxlength: [20, "Số điện thoại không được vượt quá 20 ký tự"],
      trim: true,
      unique: true,
      match: [
        /^(\+84|0)[35789][0-9]{8}$/,
        "Số điện thoại không hợp lệ (VD: +84987654321 hoặc 0987654321)",
      ],
    },
    email: {
      type: String,
      required: [true, "Email là bắt buộc"],
      unique: true,
      maxlength: [100, "Email không được vượt quá 100 ký tự"],
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Vui lòng nhập địa chỉ email hợp lệ",
      ],
    },
    password: {
      type: String,
      required: [true, "Mật khẩu là bắt buộc"],
      match: [
        /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
        "Mật khẩu phải có ít nhất 8 ký tự và chứa ít nhất 1 ký tự đặc biệt",
      ],
      maxlength: [255, "Mật khẩu không được vượt quá 255 ký tự"],
    },
    avatar: {
      type: String,
      maxlength: [255, "Đường dẫn ảnh không được vượt quá 255 ký tự"],
    },
    role: {
      type: String,
      enum: ["user", "admin", "staff"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
