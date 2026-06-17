import CefrLevel from '../../models/cefrLevel.model.js';
import AppError from '../../utils/AppError.js';
import { generateSlug } from '../../utils/generate.js';

export const listCefrLevels = async () => {
  return CefrLevel.find().sort({ code: 1 });
};

export const getCefrLevelById = async (id) => {
  const level = await CefrLevel.findById(id);
  if (!level) {
    throw new AppError('Không tìm thấy CEFR Level', 404);
  }
  return level;
};

const checkDuplicateCefrLevel = async (payload, excludeId = null) => {
  const { label } = payload;

  const conditions = [];
  if (label) {
    conditions.push({ label });
  } else {
    throw new AppError('Dữ liệu không hợp lệ', 400, [
      {
        field: 'label',
        message: 'Trường label là bắt buộc',
      },
    ]);
  }
  const query = {
    $or: conditions,
  };
  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  const existing = await CefrLevel.findOne(query);
  if (existing) {
    throw new AppError('Dữ liệu đã tồn tại', 409, [
      {
        field: 'label',
        message: 'Label CEFR level này đã tồn tại',
      },
    ]);
  }
};

export const createCefrLevel = async (payload) => {
  await checkDuplicateCefrLevel(payload);
  payload.code = generateSlug(payload.label);
  return CefrLevel.create(payload);
};

export const updateCefrLevel = async (id, payload) => {
  const level = await CefrLevel.findById(id);
  if (!level) {
    throw new AppError('Không tìm thấy CEFR Level', 404);
  }
  await checkDuplicateCefrLevel(payload, id);
  payload.code = generateSlug(payload.label);
  Object.assign(level, payload);
  //copy tất cả thuộc tính trong payload vào object level
  //(ghi đè các field trùng tên, field cũ không ghi đè thì giữ nguyên)

  return level.save();
};

export const deleteCefrLevel = async (id) => {
  const level = await CefrLevel.findByIdAndDelete(id); //trả về document vừa bị xóa
  if (!level) {
    throw new AppError('Không tìm thấy CEFR Level', 404);
  }
  return level;
};
