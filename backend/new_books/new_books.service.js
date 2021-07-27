import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

import { convertItemToArray, isEmptyObject, isObject, parseJsonString } from '../utils/appUtils';
import { FieldTypes } from '../utils/FieldTypes';
import { queryParser } from '../utils/drapcode-utility';
import { COLLECTION_NAME, fields, constructors } from './new_books.metadata';

const mergeConstructorAndRequestData = (target = {}, source) => {
  target = target === 'undefined' ? {} : target;
  let output = Object.assign({}, target);
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];
      if (!sourceValue) return;
      if (typeof sourceValue === 'object' && sourceValue.length === 0) return;
      if (isObject(source[key])) {
        if (!(key in target)) Object.assign(output, { [key]: source[key] });
        else output[key] = mergeConstructorAndRequestData(target[key], source[key]);
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }
  return output;
};

export const validateItemCollection = async (itemData, itemId = null, isValidateFields = true) => {
  let arr = Object.keys(itemData);
  let isExist = false;
  if (isValidateFields) {
    for (let obj of arr) {
      let find = fields.find((field) => field.fieldName === obj);
      if (!find) {
        isExist = obj;
        break;
      }
    }
  }
  if (isExist) return { field: 0, isExist };
  const requireFields = fields.filter((field) => field.required || field.unique);
  for (const field of requireFields) {
    if (!itemData[`${field.fieldName}`]) {
      return { field: field.fieldTitle.get('en') + ' field is required' };
    }
  }
  //Checking if data has unique data for unique fields
  let errorResponse = await validateUniqueFieldsKeyData(itemData, itemId);

  return !isEmptyObject(errorResponse)
    ? { field: errorResponse ? errorResponse.message : errorResponse }
    : {};
};

export const convertSingleItemToList = async (itemData) => {
  const { static_option, dynamic_option, reference } = FieldTypes;

  const arrayOptionFields = fields.filter((field) => {
    const { type } = field;
    return type === static_option.id || type === dynamic_option.id || type === reference.id;
  });
  const fieldsInItemData = Object.keys(itemData);
  if (arrayOptionFields.length > 0) {
    await Promise.all(
      arrayOptionFields.map(async (field) => {
        if (fieldsInItemData.includes(field.fieldName))
          itemData[field.fieldName] = itemData[field.fieldName]
            ? convertItemToArray(itemData[field.fieldName])
            : [];
      }),
    );
  }
  return itemData;
};

export const convertStringDataToObject = async (itemData) => {
  const fileUploadFields = fields.filter(
    (field) =>
      field.type === FieldTypes.image.id ||
      field.type === FieldTypes.file.id ||
      field.type === FieldTypes.multi_image.id,
  );
  if (fileUploadFields.length > 0) {
    await Promise.all(
      fileUploadFields.map(async (field) => {
        const fieldValue = itemData[field.fieldName];
        if (fieldValue && typeof fieldValue === 'string') {
          itemData[field.fieldName] = parseJsonString(fieldValue);
        }
      }),
    );
  }
  return itemData;
};

const validateUniqueFieldsKeyData = async (itemData, itemId) => {
  let errorJson = {};
  const uniqueFields = fields.filter((field) => field.unique);
  let errors = await filter(uniqueFields, async (field) => {
    return (await countByQueryOther(field.fieldName, itemData[[field.fieldName]], itemId)) > 0;
  });
  errors.some((field) => {
    if (field) {
      errorJson.message = 'This ' + field.fieldTitle.get('en') + ' already exits';
      return true;
    }
  });
  return errorJson;
};

export const findItemById = async (itemId) => {
  let query = [{ $match: { uuid: itemId } }];

  let dbConnection = mongoose.connection;
  let result = await dbConnection.collection(COLLECTION_NAME);
  result = await result.aggregate(query).toArray();
  if (!result.length) {
    return { code: 404, message: 'Item not found with provided id' };
  }
  return { code: 200, message: 'success', data: result[0] };
};
async function filter(arr, callback) {
  const fail = Symbol();
  return (
    await Promise.all(arr.map(async (item) => ((await callback(item)) ? item : fail)))
  ).filter((i) => i !== fail);
}

export const countByQueryOther = async (fieldName, fieldValue, itemId) => {
  if (!fieldValue) return;
  let dbConnection = mongoose.connection;
  const result = await dbConnection.collection(COLLECTION_NAME);
  let query = [
    {
      $project: {
        [fieldName]: { $toLower: `$${fieldName}` },
      },
    },
    {
      $match: {
        [fieldName]: { $eq: fieldValue ? fieldValue.toString().toLowerCase() : fieldValue },
      },
    },
    { $group: { _id: null, count: { $sum: 1 } } },
  ];

  if (itemId)
    query = [
      {
        $project: {
          [fieldName]: { $toLower: `$${fieldName}` },
          uuid: '$uuid',
        },
      },
      {
        $match: {
          uuid: { $ne: itemId },
          [fieldName]: { $eq: fieldValue ? fieldValue.toString().toLowerCase() : fieldValue },
        },
      },
      { $group: { _id: null, count: { $sum: 1 } } },
    ];

  let data = await result.aggregate(query).toArray();
  if (data.length) return data[0].count;
  return;
};

export const removeItemById = async (itemId) => {
  let dbConnection = mongoose.connection;
  let result = await dbConnection.collection(COLLECTION_NAME).remove({ uuid: itemId });
  if (!result || (result.result && !result.result.n)) {
    return { code: 404, message: 'Item not found with provided id', data: {} };
  }
  return { code: 200, message: 'Item Deleted Successfully', data: {} };
};

export const filterItemService = async (
  selectedFilter,
  fields,
  queryData,
  headerToken,
  count = false,
  search = false,
) => {
  let { externalKey, selector } = selectedFilter;

  if (count) selector = 'COUNT';
  /**
   * Check all params exist or not
   */
  if (externalKey && externalKey.length != 0) {
    const reqQueryParams = Object.keys(queryData);
    if (!externalKey.every((param) => reqQueryParams.includes(param.key))) {
      return {
        code: 422,
        message: `External params should be in [${externalKey}]`,
        result: [],
        count,
      };
    }
  }

  /**
   * Prepare search object and search query
   */
  let serachQueryTypeObj = {},
    searchObj = null;

  if (search) {
    searchObj = Object.assign({}, queryData);
    delete searchObj.offset;
    delete searchObj.limit;
    if (externalKey.length) {
      externalKey.forEach((param) => {
        delete searchObj[param];
      });
    }
    Object.keys(searchObj).forEach((field) => {
      let isIxist = fields.find((x) => x.fieldName === field);
      if (!isIxist) delete searchObj[field];
      if (isIxist && isIxist.type == 'number') serachQueryTypeObj[field] = 'number';
    });
  }

  try {
    // eslint-disable-next-line no-unused-vars
    let db = mongoose.connection;

    let queryStr = await queryParser(COLLECTION_NAME, selectedFilter, count, queryData);
    let result = await eval(queryStr);

    if (selector == 'COUNT') result = '' + (result && result.length ? result[0].count : 0);
    return { code: 200, message: 'success', result, count };
  } catch (error) {
    console.log('error message :>> ', error.message);
    return { code: 400, message: error.message };
  }
};

export const saveItem = async (itemData, constructorId = null) => {
  let dbConnection = mongoose.connection;

  if (constructorId) {
    const constructor = constructors.find((constructor) => constructor.uuid === constructorId);
    if (constructor) {
      let { constructorData } = constructor;
      itemData = mergeConstructorAndRequestData(constructorData, itemData);
    }
  }

  const errorJson = await validateItemCollection(itemData);
  console.log('errorJson', errorJson);
  if (Object.keys(errorJson).length !== 0) {
    if (errorJson.field === 0)
      return { code: 500, data: `${errorJson.isExist} field does not exist.`, message: {} };
    if (errorJson.field)
      return {
        code: 409,
        message: 'Validation Failed',
        data: errorJson.field,
      };
  } else {
    itemData = await convertStringDataToObject(itemData);
    itemData = await convertSingleItemToList(itemData);
    itemData.createdAt = new Date();
    itemData.updatedAt = new Date();
    itemData.uuid = uuidv4();
    const result = await dbConnection.collection('new_books');
    const savedItem = await result.insertOne(itemData);

    /*end save belongs to field flow */
    return {
      code: 201,
      message: 'Item Created Successfully',
      data: savedItem ? savedItem.ops[0] : {},
    };
  }
};
