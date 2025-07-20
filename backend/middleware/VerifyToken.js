import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(" ")[1];

  if (!accessToken) {
    return res
      .status(401)
      .json({ success: false, message: "Bạn chưa được xác thực!" });
  }

  jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, user) => {
    if (err) {
      return res
        .status(401)
        .json({ success: false, message: "Token không hợp lệ!" });
    }
    req.user = user;
    next();
  });
};

export const verifyUser = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.role === "user") {
      next();
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không được phép!" });
    }
  });
};

export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không được phép!" });
    }
  });
};
export const verifyStaff = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "staff") {
      next();
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không được phép!" });
    }
  });
};
