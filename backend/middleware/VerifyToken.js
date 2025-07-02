import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export const verifyToken = (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    if (refreshToken) {
      // Thử làm mới token nếu có refreshToken
      jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET_KEY,
        (err, user) => {
          if (err) {
            return res
              .status(403)
              .json({ success: false, message: "Refresh token không hợp lệ!" });
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

          req.user = user;
          next();
        }
      );
    } else {
      return res
        .status(401)
        .json({ success: false, message: "Bạn chưa được xác thực!" });
    }
  } else {
    jwt.verify(accessToken, process.env.JWT_SECRET_KEY, (err, user) => {
      if (err) {
        if (refreshToken) {
          // Thử làm mới token nếu accessToken hết hạn
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

              res.cookie("accessToken", newAccessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                maxAge: 15 * 60 * 1000,
              });

              req.user = user;
              next();
            }
          );
        } else {
          return res
            .status(401)
            .json({ success: false, message: "Token không hợp lệ!" });
        }
      } else {
        req.user = user;
        next();
      }
    });
  }
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
