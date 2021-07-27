/**
 * String Utility Function
 */

const capitalize = function (subject, restToLower) {
  return v.capitalize(subject, restToLower === 'TRUE');
};
const lowerCase = function (subject) {
  return v.lowerCase(subject);
};
const upperCase = function (subject) {
  return v.upperCase(subject);
};
const slugify = function (subject) {
  return v.slugify(subject);
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
const substr = function (subject, startLength, endLength) {
  return v.substr(subject, startLength, endLength);
};
/**
 * Math Utility Function
 */
// Math Operations
const addition = function (formatType, { numbers }) {
  return numeral(math.add(...numbers)).format(formatType ? formatType : '00.00');
};

const average = function (formatType, { numbers }) {
  return numeral(math.mean(...numbers)).format(formatType ? formatType : '00.00');
};

const multiply = function (formatType, { numbers }) {
  return numeral(math.multiply(...numbers)).format(formatType ? formatType : '00.00');
};

const substraction = function (formatType, { numbers1, numbers2 }) {
  const actNumber1 = Array.isArray(numbers1) ? math.add(...numbers1) : numbers1;
  const actNumber2 = Array.isArray(numbers2) ? math.add(...numbers2) : numbers2;
  return numeral(math.subtract(actNumber1, actNumber2)).format(formatType ? formatType : '00.00');
};

const count = function (subject) {
  return subject.length;
};

/**
 * Date Utility Function
 */

const formatDate = function (formatType, datentime, timezone) {
  if (formatType === 'FROM_NOW') {
    return datentime ? moment(datentime).utcOffset(timezone).fromNow() : '';
  }
  return datentime ? moment(datentime).utcOffset(timezone).format(formatType) : '';
};

const parseValueFromData = (data, fieldName) => {
  let value = '';
  if (fieldName && fieldName.includes('.')) {
    let fullNameParts = fieldName.split('.');
    let prefix = '';
    let stack = data || '';
    for (let k = 0; k < fullNameParts.length; k++) {
      prefix = fullNameParts[k];
      if (Array.isArray(stack)) {
        stack[prefix] = stack.map((item) => {
          if (item[prefix]) return item[prefix];
        });
      }
      if (!stack[prefix]) {
        stack[prefix] = '';
      }
      stack = stack[prefix];
    }
    value = stack ? stack : '';
    if (Array.isArray(value)) {
      value = value.filter(() => true);
    }
  } else {
    value = data ? data[fieldName] : '';
  }
  //TODO: Check Error posibility
  if (value && Array.isArray(value) && value.length === 1) return value[0];
  if (value && Array.isArray(value) && typeof value[0] === 'string') {
    return value.join(', ');
  }
  return value;
};

const getIframeVideoUrlForYoutubeOrVimeo = (iframeSrc, data, videoType) => {
  if (videoType === 'youtube' || videoType === 'youtube-nocookie') {
    const videoId = data.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#\&\?]*).*/);
    return videoId && videoId[2]
      ? videoType === 'youtube'
        ? iframeSrc.slice(0, 30) + videoId[2] + iframeSrc.slice(30)
        : iframeSrc.slice(0, 39) + videoId[2] + iframeSrc.slice(39)
      : '';
  }
  if (videoType === 'vimeo') {
    const videoId = data.match(
      /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/,
    );
    return videoId && videoId[3] ? iframeSrc.slice(0, 31) + videoId[3] + iframeSrc.slice(31) : '';
  }
};
