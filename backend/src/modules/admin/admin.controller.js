import { successResponse } from '../../utils/response.js';
import * as cefrLevelService from '../cefrLevel/cefrLevel.service.js';

export const listCefrLevels = async (req, res, next) => {
  try {
    const levels = await cefrLevelService.listCefrLevels();
    return res
      .status(200)
      .json(successResponse('Lấy danh sách CEFR levels thành công', levels));
  } catch (error) {
    next(error);
  }
};

export const getCefrLevelById = async (req, res, next) => {
  try {
    const level = await cefrLevelService.getCefrLevelById(req.params.id);
    return res
      .status(200)
      .json(successResponse('Lấy chi tiết CEFR level thành công', level));
  } catch (error) {
    next(error);
  }
};

export const createCefrLevel = async (req, res, next) => {
  try {
    const level = await cefrLevelService.createCefrLevel(req.body);
    return res
      .status(201)
      .json(successResponse('Tạo mới CEFR level thành công', level));
  } catch (error) {
    next(error);
  }
};

export const updateCefrLevel = async (req, res, next) => {
  try {
    const level = await cefrLevelService.updateCefrLevel(
      req.params.id,
      req.body
    );
    return res
      .status(200)
      .json(successResponse('Cập nhật CEFR level thành công', level));
  } catch (error) {
    next(error);
  }
};

export const deleteCefrLevel = async (req, res, next) => {
  try {
    await cefrLevelService.deleteCefrLevel(req.params.id);
    return res.status(200).json(successResponse('Xóa CEFR level thành công'));
  } catch (error) {
    next(error);
  }
};
