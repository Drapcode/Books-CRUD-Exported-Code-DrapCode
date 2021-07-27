export const isEmptyObject = (object) => {
  return Object.keys(object).length === 0 && object.constructor === Object;
};

export const parseJsonString = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return {};
  }
};

export const isObject = (item) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

export const convertItemToArray = (itemValue) => {
  if (Array.isArray(itemValue)) {
    return itemValue;
  }
  return [itemValue];
};
