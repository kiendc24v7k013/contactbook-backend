const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");
const UserService = require("../services/user.service");
const MongoDB = require("../utils/mongodb.util");
const config = require("../config");

// Đăng ký tài khoản mới
exports.register = async (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return next(new ApiError(400, "Tên, email và mật khẩu không được để trống"));
  }

  try {
    const userService = new UserService(MongoDB.client);

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      return next(new ApiError(400, "Email đã được sử dụng"));
    }

    const user = await userService.create({ name, email, password });
    return res.send({
      message: "Đăng ký thành công",
      user,
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi xảy ra khi đăng ký tài khoản"),
    );
  }
};

// Đăng nhập
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ApiError(400, "Email và mật khẩu không được để trống"));
  }

  try {
    const userService = new UserService(MongoDB.client);

    // Tìm user theo email
    const user = await userService.findByEmail(email);
    if (!user) {
      return next(new ApiError(401, "Email hoặc mật khẩu không đúng"));
    }

    // So sánh mật khẩu bằng bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return next(new ApiError(401, "Email hoặc mật khẩu không đúng"));
    }

    // Tạo JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn },
    );

    return res.send({
      message: "Đăng nhập thành công",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(
      new ApiError(500, "Lỗi xảy ra khi đăng nhập"),
    );
  }
};
