// config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js"; // sửa đường dẫn tùy dự án

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:8000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
  try {
    // 1. Kiểm tra nếu đã có tài khoản với cùng googleId
    let existingUser = await User.findOne({ googleId: profile.id });
    if (existingUser) {
      return done(null, existingUser);
    }

    // 2. Nếu chưa có googleId, kiểm tra email (trường hợp user đã đăng ký thủ công bằng email)
    existingUser = await User.findOne({ email: profile.emails[0].value });
    if (existingUser) {
      // Gán thêm googleId và avatar cho user cũ
      existingUser.googleId = profile.id;
      existingUser.avatar = profile.photos[0].value; // cập nhật avatar nếu cần
      await existingUser.save();
      return done(null, existingUser);
    }

    // 3. Nếu không tìm thấy, tạo mới user hoàn toàn
    const newUser = new User({
      googleId: profile.id,
      name: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0].value,
    });

    await newUser.save();
    done(null, newUser);
  } catch (error) {
    done(error, null);
  }
}
  )
);

// serialize & deserialize user nếu dùng session
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id).then((user) => done(null, user));
});
