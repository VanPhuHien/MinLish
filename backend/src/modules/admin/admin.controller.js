import { successResponse } from '../../utils/response.js';
import * as tagService from '../tag/tag.service.js';

export const listTags = async (req, res, next) => {
  try {
    const levels = await tagService.listTags();
    return res
      .status(200)
      .json(successResponse('Lấy danh sách Tags thành công', levels));
  } catch (error) {
    next(error);
  }
};

export const getTagById = async (req, res, next) => {
  try {
    const level = await tagService.getTagById(req.params.id);
    return res
      .status(200)
      .json(successResponse('Lấy chi tiết Tag thành công', level));
  } catch (error) {
    next(error);
  }
};

export const createTag = async (req, res, next) => {
  try {
    const level = await tagService.createTag(req.body);
    return res
      .status(201)
      .json(successResponse('Tạo mới Tag thành công', level));
  } catch (error) {
    next(error);
  }
};

export const updateTag = async (req, res, next) => {
  try {
    const level = await tagService.updateTag(req.params.id, req.body);
    return res
      .status(200)
      .json(successResponse('Cập nhật Tag thành công', level));
  } catch (error) {
    next(error);
  }
};

export const deleteTag = async (req, res, next) => {
  try {
    await tagService.deleteTag(req.params.id);
    return res.status(200).json(successResponse('Xóa Tag thành công'));
  } catch (error) {
    next(error);
  }
};
