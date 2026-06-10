import AppError from '../utils/AppError.js';
import client from '../config/redis.js';

export const rateLimiter = ({ windowMs, max, message }) => {
  return async (req, res, next) => {
    // Nếu client Redis chưa sẵn sàng, cho qua để không ảnh hưởng dịch vụ
    if (!client.isOpen) {
      return next();
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    // Chuẩn hóa path để làm key
    const path = req.originalUrl || req.path;
    const key = `ratelimit:${path}:${ip}`;

    try {
      const current = await client.incr(key);

      if (current === 1) {
        // Đặt thời gian hết hạn (giây)
        await client.expire(key, Math.round(windowMs / 1000));
      }

      if (current > max) {
        return next(new AppError(message || 'Quá nhiều yêu cầu, vui lòng thử lại sau', 429));
      }

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next();
    }
  };
};
