const jwt = require("jsonwebtoken");
const ApiError = require("../api-error");
const config = require("../config");

// Middleware xác thực JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return next(new ApiError(401, "Không tìm thấy token xác thực"));
  }

  // Token có dạng "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return next(new ApiError(401, "Token không hợp lệ"));
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new ApiError(403, "Token đã hết hạn hoặc không hợp lệ"));
  }
};

module.exports = verifyToken;
