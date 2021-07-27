const numeral = require('numeral');
const v = require('voca');
const moment = require('moment');

const getTimezoneOffset = (time = '(GMT+5:30)') => {
  if (!time) {
    time = '(GMT+5:30)';
  }
  const str = time.substring(4, 10);
  return moment().utcOffset(str).utcOffset();
};
const capitalize = function (str, restToLower) {
  return v.capitalize(str, restToLower === 'TRUE');
};
const lowerCase = function (str) {
  return v.lowerCase(str);
};
const upperCase = function (str) {
  return v.upperCase(str);
};
const slugify = function (str) {
  return v.slugify(str);
};
const trim = function (subject, whitespace, type) {
  if (type === 'LEFT') {
    return v.trimLeft(subject, whitespace);
  } else if (type === 'RIGHT') {
    return v.trimRight(subject, whitespace);
  } else {
    return v.trim(subject, whitespace);
  }
};
const titleCase = function (subject, noSplitopt) {
  return v.titleCase(subject, [noSplitopt]);
};
const truncate = function (subject, length, endopt) {
  return v.truncate(subject, length, endopt);
};

const median = (arr = []) => arr.reduce((sume, el) => sume + el, 0) / arr.length;

const average = function (formatType, { numbers }) {
  return numeral(median([...numbers])).format(formatType ? formatType : '00.00');
};

const addition = function (formatType, { numbers }) {
  let sum = [...numbers].reduce((a, b) => a + b, 0);
  return numeral(sum).format(formatType ? formatType : '00.00');
};

const multiply = function (formatType, { numbers }) {
  let multipliedValue = [...numbers].reduce((a, b) => a * b, 0);
  return numeral(multipliedValue).format(formatType ? formatType : '00.00');
};

let add = (arr = []) => {
  return arr.reduce((a, b) => a + b, 0);
};
const substraction = function (formatType, { numbers1, numbers2 }) {
  const actNumber1 = Array.isArray(numbers1) ? add([...numbers1]) : numbers1;
  const actNumber2 = Array.isArray(numbers2) ? add([...numbers2]) : numbers2;
  const subtractedVal = actNumber1 - actNumber2;
  return numeral(subtractedVal).format(formatType ? formatType : '00.00');
};

export const prepareFunction = (functionDef, field, timezone) => {
  console.log('functionDef.args', timezone, functionDef.args);
  let formatType = '',
    restToLower = '',
    whitespace = '',
    noSplitopt = '',
    type = '',
    length = '',
    endopt = '';
  let args = [];
  timezone = timezone;
  functionDef.args.forEach((element) => {
    const { name, key } = element;
    const excludes = [
      'formatType',
      'restToLower',
      'whitespace',
      'type',
      'noSplitopt',
      'length',
      'endopt',
    ];
    if (name === 'formatType') {
      formatType = key;
    } else if (name === 'restToLower') {
      restToLower = key;
    } else if (name === 'whitespace') {
      whitespace = key;
    } else if (name === 'type') {
      type = key;
    } else if (name === 'noSplitopt') {
      noSplitopt = key;
    } else if (name === 'length') {
      length = key;
    } else if (name === 'endopt') {
      endopt = key;
    }

    let innerArgs = [];
    if (!excludes.includes(name)) {
      if (Array.isArray(key)) {
        key.forEach((k) => {
          if (field) innerArgs.push(field[k]);
        });
        args.push(innerArgs);
      } else {
        if (field) args.push(field[key]);
      }
    }
  });

  switch (functionDef.functionType) {
    case 'CAPITALIZE':
      return capitalize(args[0], restToLower);
    case 'LOWER_CASE':
      return lowerCase(args[0]);
    case 'UPPER_CASE':
      return upperCase(args[0]);
    case 'SLUGIFY':
      return slugify(args[0]);
    case 'TRIM':
      return trim(args[0], whitespace, type);
    case 'TITLE_CASE':
      return titleCase(args[0], noSplitopt);
    case 'TRUNCATE':
      return truncate(args[0], length, endopt);
    case 'ADDITION':
      return addition(formatType, { numbers: args[0] });
    case 'AVERAGE':
      return average(formatType, { numbers: args[0] });
    case 'MULTIPLY':
      return multiply(formatType, { numbers: args[0] });
    case 'SUBSTRACTION':
      return substraction(formatType, { numbers1: args[0], numbers2: args[1] });
    case 'FORMAT_DATE':
      if (!timezone) timezone = '(GMT+5:30)';
      const str = timezone.substring(4, 10);
      timezone = moment().utcOffset(str).utcOffset();
      return formatDate(formatType, args[0], timezone);
    default:
      return;
  }
};

const formatDate = function (formatType, datentime, timezone) {
  return moment(datentime).utcOffset(timezone).format(formatType);
};
