const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const fs = require("fs");

// Tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Đăng ký user mới
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Tạo user mới
    const user = await User.create({
      name,
      email,
      password,
    });

    // Tạo token
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra email và password
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    // Tìm user và kiểm tra password
    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Đăng xuất
exports.logout = (req, res) => {
  res.json({ message: "Logout successful" });
};

// Xem thông tin cá nhân
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    // Kiểm tra xem email đã tồn tại chưa (trừ chính user hiện tại)
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: req.user.id },
      });
      if (existingUser) {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true }
    ).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Forgot Password - THÊM HÀM NÀY
const transporter = require("../config/nodemailer");
exports.forgotPassword = async (req, res) => {
  // KHAI BÁO resetToken Ở ĐẦU HÀM
  let resetToken;

  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // KHÔNG thông báo email không tồn tại vì lý do bảo mật
      return res.json({
        success: true,
        message: "Nếu email tồn tại, hướng dẫn reset password đã được gửi.",
      });
    }

    // Tạo reset token - GIỜ DÙNG BIẾN ĐÃ KHAI BÁO
    resetToken = crypto.randomBytes(20).toString("hex");

    // Lưu token đã hash vào database
    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 phút

    await user.save();

    // Tạo URL reset password
    const resetUrl = `${
      process.env.FRONTEND_URL || "https://group-7-project-xi.vercel.app"
    }/reset-password/${resetToken}`;

    // Cấu hình email template
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "🔐 Đặt lại mật khẩu - Hệ thống của bạn",
      html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Yêu cầu đặt lại mật khẩu</h2>
      
      <p>Xin chào <strong>${user.name}</strong>,</p>
      
      <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #007bff; color: white; padding: 12px 24px; 
                  text-decoration: none; border-radius: 5px; display: inline-block;
                  font-size: 16px; font-weight: bold;">
          🚀 CLICK VÀO ĐÂY ĐỂ ĐẶT LẠI MẬT KHẨU
        </a>
      </div>
      
      <p><strong>Link đặt lại mật khẩu:</strong></p>
      <div style="background: #f5f5f5; padding: 10px; border-radius: 5px; word-break: break-all;">
        ${resetUrl}
      </div>
      
      <p><strong>Lưu ý quan trọng:</strong></p>
      <ul>
        <li>Link chỉ có hiệu lực trong <strong>10 phút</strong></li>
        <li>Nếu bạn không yêu cầu, vui lòng bỏ qua email này</li>
        <li>Liên kết này sẽ đưa bạn thẳng đến trang đặt lại mật khẩu</li>
      </ul>
      
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #666; font-size: 12px;">
        Email tự động - Vui lòng không trả lời
      </p>
    </div>
  `,
    };

    console.log("📧 Attempting to send email to:", user.email);
    console.log("🔗 Reset URL:", resetUrl);

    // Gửi email
    await transporter.sendMail(mailOptions);

    console.log("✅ Password reset email sent successfully to:", user.email);

    res.json({
      success: true,
      message:
        "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.",
    });
  } catch (error) {
    console.error("❌ Forgot password error:", error);

    // Xử lý lỗi cụ thể - CHỈ trả về resetToken nếu nó đã được định nghĩa
    if (error.code === "EAUTH" || error.code === "EENVELOPE") {
      console.error(
        "Email authentication failed. Check EMAIL_USER and EMAIL_PASS in .env"
      );

      // CHỈ trả về token nếu nó tồn tại
      const response = {
        message: "Lỗi cấu hình email. Vui lòng thử lại sau.",
      };

      if (resetToken) {
        response.debugToken = resetToken;
      }

      return res.status(500).json(response);
    }

    // Xử lý lỗi chung
    const response = {
      message: "Có lỗi xảy ra. Vui lòng thử lại sau.",
    };

    // CHỈ thêm debugToken trong development và nếu resetToken tồn tại
    if (process.env.NODE_ENV === "development" && resetToken) {
      response.debugToken = resetToken;
    }

    res.status(500).json(response);
  }
};

// Reset Password - THÊM HÀM NÀY
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params; // ĐÚNG: token từ URL params
    const { password } = req.body;

    console.log("🔑 Reset password token:", token);
    console.log("🔑 New password:", password ? "Provided" : "Missing");

    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash token để so sánh
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    // Cập nhật mật khẩu mới
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("❌ Reset password error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Upload Avatar - THÊM HÀM NÀY (tạm thời đơn giản)
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a file" });
    }

    // Tạo URL đầy đủ
    const getBaseUrl = () => {
      if (process.env.NODE_ENV === "production") {
        return "https://group-7-project-tqac.onrender.com";
      }
      return `${req.protocol}://${req.get("host")}`;
    };

    const avatarUrl = `${getBaseUrl()}/uploads/${req.file.filename}`;

    // Cập nhật avatar URL trong database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    // SỬA: Trả về user thay vì chỉ avatar
    res.json({
      success: true,
      message: "Avatar uploaded successfully",
      user: user, // Trả về toàn bộ user object
    });
  } catch (error) {
    // Xóa file tạm nếu có lỗi
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: error.message });
  }
};

// Delete Avatar - THÊM HÀM NÀY
exports.deleteAvatar = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: null },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Avatar deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.uploadAvatarFromUrl = async (req, res) => {
  try {
    const { avatarUrl } = req.body;

    if (!avatarUrl) {
      return res.status(400).json({ message: "Avatar URL is required" });
    }

    // Validate URL
    try {
      new URL(avatarUrl);
    } catch (error) {
      return res.status(400).json({ message: "Invalid URL" });
    }

    // Cập nhật avatar URL trong database
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { avatar: avatarUrl },
      { new: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Avatar updated successfully",
      user: user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
