const prepareFunction = (functionDef, field) => {
  let formatType = '',
    restToLower = '',
    whitespace = '',
    noSplitopt = '',
    type = '',
    length = '',
    endopt = '';
  let args = [];
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
      'startLength',
      'endLength',
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
    } else if (name === 'startLength') {
      startLength = key;
    } else if (name === 'endLength') {
      endLength = key;
    }

    let innerArgs = [];
    if (!excludes.includes(name)) {
      if (Array.isArray(key)) {
        key.forEach((k) => {
          innerArgs.push(field[k]);
        });
        args.push(innerArgs);
      } else {
        args.push(field[key]);
      }
    }
  });
  switch (functionDef.functionType) {
    case 'CAPITALIZE':
      return capitalize(args[0], restToLower);
      break;
    case 'LOWER_CASE':
      return lowerCase(args[0]);
      break;
    case 'UPPER_CASE':
      return upperCase(args[0]);
      break;
    case 'SLUGIFY':
      return slugify(args[0]);
      break;
    case 'TRIM':
      return trim(args[0], whitespace, type);
      break;
    case 'TITLE_CASE':
      return titleCase(args[0], noSplitopt);
      break;
    case 'TRUNCATE':
      return truncate(args[0], length, endopt);
      break;
    case 'SUB_STRING':
      return substr(args[0], startLength, endLength);
      break;
    case 'ADDITION':
      return addition(formatType, { numbers: args[0] });
      break;
    case 'AVERAGE':
      return average(formatType, { numbers: args[0] });
      break;
    case 'MULTIPLY':
      return multiply(formatType, { numbers: args[0] });
      break;
    case 'SUBSTRACTION':
      return substraction(formatType, { numbers1: args[0], numbers2: args[1] });
      break;
    case 'COUNT':
      return count(args[0]);
      break;
    case 'FORMAT_DATE':
      let timezone = +document.getElementById('project-timezone').innerText || 0;
      return formatDate(formatType, args[0], timezone);
      break;
    default:
      return '';
      break;
  }
};

const validatePaginationButton = (numberOfPages, currentPage, element) => {
  const loadMore = element.querySelector('.loadMore');
  loadMore ? (loadMore.disabled = currentPage === numberOfPages) : '';
  const next = element.querySelector('.next');
  const previous = element.querySelector('.previous');
  const first = element.querySelector('.first');
  const last = element.querySelector('.last');
  next ? (next.disabled = currentPage === numberOfPages) : '';
  previous ? (previous.disabled = currentPage === 1) : '';
  first ? (first.disabled = currentPage === 1) : '';
  last ? (last.disabled = currentPage === numberOfPages) : '';
};
const convertQueryStringFromFormElements = (formElements) => {
  return Object.values(formElements)
    .map((el) => {
      if (el.name && el.value)
        return encodeURIComponent(el.name) + '=' + encodeURIComponent(el.value);
    })
    .filter(Boolean)
    .join('&');
};

const getDerivedFieldData = (derivedFieldData, item) => {
  const functionDef = JSON.parse(derivedFieldData);
  const { parentFieldName } = functionDef;
  let textContent = '';
  if (parentFieldName) {
    textContent = item[parentFieldName]
      .map((innerItem) => {
        return prepareFunction(functionDef, innerItem);
      })
      .join(', ');
  } else {
    textContent = prepareFunction(functionDef, item);
  }
  return textContent;
};

const applyUserDefinedStyles = (source, target, stylesMap) => {
  let sourceId = source.getAttribute('id');
  let sourceIdFull = '#' + sourceId;
  let targetId = '#' + target.getAttribute('id');
  let sheets = Array.from(document.styleSheets).filter(
    (styleSheet) => !styleSheet.href || styleSheet.href.startsWith(window.location.origin),
  );

  for (let i = 0; i < sheets.length; i++) {
    let rules = sheets[i].cssRules || sheets[i].rules;

    for (let r = 0; r < rules.length; r++) {
      let rule = rules[r];
      let selectorText = rule.selectorText;

      if (selectorText === sourceIdFull) {
        let styles = '';
        for (let l = 0; l < rule.style.length; l++) {
          styles += `${rule.style[l]}: ${rule.style[rule.style[l]]} !important;`;
        }
        stylesMap.set(sourceId, `{ ${styles} }`);
      }
    }
  }
};

/* Function to add style element */
const addStyle = (styles) => {
  /* Create style document */
  let css = document.createElement('style');

  if (css.styleSheet) {
    css.styleSheet.cssText = styles;
  } else {
    css.appendChild(document.createTextNode(styles));
  }
  /* Append style to the tag name */
  document.getElementsByTagName('head')[0].appendChild(css);
};

const getAllSelectors = () => {
  let ret = [];

  let sheets = Array.from(document.styleSheets).filter(
    (styleSheet) => !styleSheet.href || styleSheet.href.startsWith(window.location.origin),
  );

  for (let i = 0; i < sheets.length; i++) {
    let rules = sheets[i].rules || sheets[i].cssRules;
    for (let x in rules) {
      if (typeof rules[x].selectorText == 'string') ret.push(rules[x].selectorText);
    }
  }
  return ret;
};

const selectorExists = (selector) => {
  let selectors = getAllSelectors();
  for (let i = 0; i < selectors.length; i++) {
    if (selectors[i] == selector) return true;
  }
  return false;
};
