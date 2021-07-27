import { findItemById, filterItemService, removeItemById, saveItem } from './new_books.service';

import { filters, fields } from './new_books.metadata';

export const findOneItem = async (req, res, next) => {
  const { itemId } = req.params;
  try {
    const result = await findItemById(itemId);
    if (!result) {
      res.status(404).send({ message: `Record not found with id ${itemId}` });
      return;
    }
    res.status(result.code).send(result.data);
  } catch (error) {
    next(error);
  }
};

export const productFilterItems = async (req, res, next) => {
  try {
    const { filterId } = req.params;
    const { authorization } = req.headers;
    const selectedFilter = filters[filterId];
    let { code, result, message } = await filterItemService(
      selectedFilter,
      fields,
      req.query,
      authorization,
      false,
      false,
    );

    let resp = code != 200 ? message : result;
    res.status(code || 500).send(resp || []);
  } catch (err) {
    next(err);
  }
  res.status(200);
};

export const productFilterItemCount = async (req, res, next) => {
  try {
    const { filterId } = req.params;
    const { authorization } = req.headers;
    const selectedFilter = filters[filterId];
    // Read Collection from File
    let { code, result, message } = await filterItemService(
      selectedFilter,
      fields,
      req.query,
      authorization,
      true,
      false,
    );

    let resp = code != 200 ? message : result;
    res.status(code || 500).send(resp || []);
  } catch (err) {
    next(err);
  }
};

export const createItem = async (req, res, next) => {
  const { constructorId } = req.params;
  try {
    const response = await saveItem(req.body, constructorId, req.user);
    return res.status(response.code).send(response.data);
  } catch (err) {
    next(err);
  }
};

export const deleteItem = async (req, res, next) => {
  try {
    let { itemId } = req.params;
    let data = await removeItemById(itemId);
    res.status(data.code || 500).send(data);
  } catch (error) {
    next(error);
  }
};
