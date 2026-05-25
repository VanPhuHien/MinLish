import multer from "multer";
import AppError from "../utils/AppError.js"
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn 2MB
    fileFilter: (req, file, fileFilterCallback) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            fileFilterCallback(null, true);
        } else {
            fileFilterCallback(new AppError('Định dạng file không hợp lệ! Chỉ chấp nhận JPEG hoặc PNG.', 400), false);
        }
    }
});

export const validateAvatar = (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                next(new AppError("File quá lớn! Tối đa chỉ được 2MB.", 400));
            }
            next(new AppError(err.message, 400));
        } else if (err) {
            next(new AppError(err.message, 400));
        }
        next(); // Nếu file hợp lệ, cho phép đi tiếp
    });
};