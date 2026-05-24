import multer from "multer";
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn 2MB
    fileFilter: (req, file, fileFilterCallback) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            fileFilterCallback(null, true);
        } else {
            fileFilterCallback(new Error('Định dạng file không hợp lệ! Chỉ chấp nhận JPEG hoặc PNG.'), false);
        }
    }
});

export const validateAvatar = (req, res, next) => {
    upload.single('avatar')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(400).json({ success: false, message: 'File quá lớn! Tối đa chỉ được 2MB.' });
            }
            return res.status(400).json({ success: false, message: err.message });
        } else if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        next(); // Nếu file hợp lệ, cho phép đi tiếp
    });
};