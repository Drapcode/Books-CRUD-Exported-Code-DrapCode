window.addEventListener('DOMContentLoaded', async function () {
  searchQueryFromURL();
  loadDynamicFilterDataIntoElements();

  const modals = document.querySelectorAll('.modal');
  modals.forEach((modal) => {
    modal.classList.remove('show');
  });

  const { itemData, collectionId, collectionItemId } = await getPageItemData();

  const dataField = `data-${collectionId}`;
  const dataURLField = `data-url-${collectionId}`;
  const dataImageTag = `data-img-src-${collectionId}`;
  const dataVideoTag = `data-video-src-${collectionId}`;
  if (collectionId && collectionItemId && itemData) {
    let hyperLinks = window.document.querySelectorAll('[data-path-collection-name]');
    let imageElements = window.document.querySelectorAll('[' + dataImageTag + ']');
    let videoElements = window.document.querySelectorAll('[' + dataVideoTag + ']');
    let textContentElements = window.document.querySelectorAll('[' + dataField + ']');
    let urlContentElements = window.document.querySelectorAll('[' + dataURLField + ']');
    console.log(
      'loadDataTable dataField: ',
      dataField,
      'dataURLField: ',
      dataURLField,
      'urlContentElements: ',
      urlContentElements,
      'itemData::',
      itemData,
      'hyperLinks:::',
      hyperLinks,
      'textContentElements:::',
      textContentElements,
    );
    if (
      (textContentElements || imageElements || hyperLinks || urlContentElements || videoElements) &&
      collectionId &&
      collectionItemId
    ) {
      if (itemData) {
        textContentElements.forEach((textElement) => {
          let fieldName = textElement.getAttribute(dataField);
          let type = textElement.getAttribute('type');
          if (fieldName.includes('"') && 'functionType' in JSON.parse(fieldName)) {
            textElement.textContent = getDerivedFieldData(fieldName, itemData);
          } else {
            if (type === 'reference' || type === 'multi_reference' || type === 'belongsTo') {
              const { nestedFieldName } = JSON.parse(textElement.getAttribute('metaData'));
              if (!fieldName.includes('.')) {
                fieldName = fieldName + '.' + nestedFieldName;
              }
            }
            //TODO: testing on bases field type (only for boolean now)
            const fieldType = textElement.getAttribute('data-field-type');
            const value = parseValueFromData(itemData, fieldName) || '';
            if (htmlRegex.test(value)) {
              textElement.innerHTML = value;
            } else if (fieldType === 'boolean') {
              textElement.textContent = value ? 'Yes' : 'No';
            } else {
              textElement.textContent = value;
            }
          }
        });
        hyperLinks.forEach((element) => {
          const fieldName = element.getAttribute('data-path-field-name');
          if (fieldName) {
            if (
              !(
                element.hasAttribute('data-gjs') &&
                element.getAttribute('data-gjs') === 'data-table-link'
              )
            ) {

              const href = element.getAttribute('href');
              let fieldHref = fieldName ? parseValueFromData(itemData, fieldName) : '';
              fieldHref = fieldHref.split(', ');
              fieldHref = fieldHref[0];
              const replaceHref = href.replace(fieldName, fieldHref);
              element.setAttribute('href', replaceHref);
            }
          }
        });
        urlContentElements.forEach((element) => {
          const fieldType = element.getAttribute('data-field-type');
          if (fieldType === 'file') {
            replaceContentOfFileLinkElements(itemData, element, dataURLField);
          } else {
            const fieldName = element.getAttribute(dataURLField);
            const href = element.getAttribute(dataURLField);
            const replaceHref = href.replace(fieldName, parseValueFromData(itemData, fieldName));
            element.setAttribute('href', replaceHref);
          }
        });
        imageElements.forEach((imageElement) => {
          const fieldName = imageElement.getAttribute(dataImageTag);
          let itemImageData = fieldName ? parseValueFromData(itemData, fieldName) : '';
          if (Array.isArray(itemImageData)) {
            itemImageData = itemImageData[0];
          }
          let imageSrcUrl;
          if (itemImageData) {
            if (typeof itemImageData === 'object') {
              const imageKey = itemImageData.key;
              if (imageKey) imageSrcUrl = IMAGE_SERVER_URL + imageKey;
            } else if (typeof itemImageData === 'string' && itemImageData.startsWith('http')) {
              imageSrcUrl = itemImageData;
            }
            imageElement.src = imageSrcUrl;
          }
        });
        videoElements.forEach((videoElement) => {
          const fieldName = videoElement.getAttribute(dataVideoTag);
          const videoType = videoElement.getAttribute('data-video-type');
          let itemVideoData = fieldName ? parseValueFromData(itemData, fieldName) : '';
          if (itemVideoData && ['youtube-nocookie', 'youtube', 'vimeo'].includes(videoType)) {
            const iframeVideoSrc = videoElement.getAttribute('src');
            videoElement.src = iframeVideoSrc
              ? getIframeVideoUrlForYoutubeOrVimeo(iframeVideoSrc, itemVideoData, videoType)
              : '';
          } else if (itemVideoData) {
            videoElement.src = itemVideoData;
          } else {
            videoElement.src = '';
          }
        });
      }
    }

    const formEl = document.querySelector('[data-form-collection=' + collectionId + ']');
    if (formEl) {
      collectionFormDetailForUpdate(formEl, itemData);
    }
  }
  await addDynamicDataIntoFormElements(itemData);
  let sessionAttributes = document.querySelectorAll('[data-session]');
  if (sessionAttributes) {
    const loggedInUserData = localStorage.getItem('user');
    if (loggedInUserData !== 'undefined') {
      const loggedInUser = JSON.parse(loggedInUserData);
      sessionAttributes.forEach((element) => {
        const fieldName = element.getAttribute('data-session');
        element.textContent = loggedInUser ? parseValueFromData(loggedInUser, fieldName) : '';
      });
    }
  }
});

const addDynamicDataIntoFormElements = async (itemData = null) => {
  if (!itemData) {
    const response = await getPageItemData();
    itemData = response.itemData;
  }
  const loggedInUser = JSON.parse(localStorage.getItem('user'));
  const forms = document.querySelectorAll('form');
  forms.forEach((form) => {
    const collectionFormElements = form.querySelectorAll('[data-form-element-collection]');
    const sessionFormElements = form.querySelectorAll('[data-form-element-session]');
    sessionFormElements.forEach((sessionElement) => {
      const fieldName = sessionElement.getAttribute('data-form-element-session');
      const fieldValue = parseValueFromData(loggedInUser, fieldName);
      insertFormElementValue(fieldValue, sessionElement);
    });
    collectionFormElements.forEach((collectionElement) => {
      const fieldName = collectionElement.getAttribute('data-form-element-collection');
      const fieldValue = parseValueFromData(itemData, fieldName);
      insertFormElementValue(fieldValue, collectionElement);
    });
  });
};

/**
 * This method getting use to set values in update collection form
 */
const insertFormElementValue = (data, element) => {
  if (isCheckbox(element)) {
    if (data) {
      element.checked = true;
    }
  } else if (element.type === 'file') {
    let fileDisplay = element.parentElement.getElementsByClassName('file-list-display')[0];
    if (data && typeof data === 'object') {
      fileDisplay.innerHTML = data.originalName;
    }
    if (data && Array.isArray(data)) {
      const fileNameList = data.map((file) => {
        return file.originalName ? file.originalName : '';
      });
      fileDisplay.innerHTML = fileNameList.join(',');
    }
    const hiddenElement = element.parentElement.querySelector(
      `input[name="${element.name}"][type='hidden']`,
    );
    hiddenElement.value = typeof data === 'object' ? JSON.stringify(data) : '';
  } else if (element.type === 'datetime-local') {
    element.value = data ? timestampToDatetimeInputString(new Date(data)) : '';
  } else if ($(element).attr('flat-picker-date-type') === 'datetime-local') {
    element.value = data ? flatpickr.formatDate(new Date(data), 'Y-m-d h:i K') : '';
  } else if (element.tagName === 'SELECT') {
  } else if (element.tagName === 'TEXTAREA' && element.hasAttribute('data-show-editor')) {
    $(element).summernote('code', data);
  } else if ($(element).attr('type') === 'tel') {
    $(element).intlTelInput('setNumber', data);
  } else {
    element.value = data;
  }
};

const collectionFormDetailForUpdate = (form, item) => {
  form.method = 'put';
  form.setAttribute('action', form.getAttribute('action') + '/' + item.uuid);
};

const isCheckbox = (element) => element.type === 'checkbox';
const isMultiSelect = (element) => element.options && element.multiple;

function timestampToDatetimeInputString(timestamp) {
  const date = new Date(timestamp + _getTimeZoneOffsetInMs());
  // slice(0, 19) includes seconds
  return date.toISOString().slice(0, 19);
}

function _getTimeZoneOffsetInMs() {
  return new Date().getTimezoneOffset() * -60 * 1000;
}

const convertTimeStampToDate = (timeStampDate) => {
  let timezone = +document.getElementById('project-timezone').innerText || 0;
  if (timeStampDate) {
    return moment(timeStampDate)
      .utcOffset(timezone)
      .format(timeStampDate.length > 10 ? 'Do MMM YYYY, h:mm a' : 'Do MMM YYYY');
    // return moment(timeStampDate).format('MMMM d, yyyy, h:mm a');
  } else {
    return '';
  }
};

const getPageItemData = async () => {
  let result = {};

  const queryString = window.location.search;

  const pathArray = window.location.pathname.split('/');
  const collectionId = pathArray[pathArray.length - 2];
  let collectionItemId = pathArray[pathArray.length - 1];
  if (collectionItemId && collectionItemId.includes('_')) {
    collectionItemId = collectionItemId.split('_')[1];
  }
  console.log('collectionId && collectionItemId', collectionId, '---', collectionItemId);

  const urlParams = new URLSearchParams(queryString);
  const collectionName = urlParams.get('c');
  const itemId = urlParams.get('i');
  const localStorage = window.localStorage;
  const sessionStorage = window.sessionStorage;
  if (collectionId && collectionItemId) {
    if (collectionId !== 'reset-password') {
      const endpoint = collectionId + '/item/' + collectionItemId;
      var itemData = sessionStorage.getItem('itemData' + collectionItemId);
      if (!itemData) {
        console.log('API Call to endpoint->>>>', endpoint);
        let itemDataResponse = await securedGetCall(endpoint);
        itemData = itemDataResponse ? itemDataResponse.data : {};
        sessionStorage.setItem('itemData' + collectionItemId, JSON.stringify(itemData));
      } else {
        itemData = JSON.parse(itemData);
      }
    }

    result = { itemData, collectionId, collectionItemId };
  }
  return result;
};

const searchQueryStringFromUrl = async function () {
  const urlObj = new URL(window.location.href);
  let searchQuery = urlObj.search;
  return searchQuery;
};

const searchQueryFromURL = async function () {
  const searchQuery = await searchQueryStringFromUrl();
  if (searchQuery.length > 0) {
    const searchParams = new URLSearchParams(searchQuery);
    let genericSearchFormElements = document.querySelectorAll(
      '[data-gjs=' + 'page-search-form' + ']',
    );
    if (genericSearchFormElements) {
      genericSearchFormElements.forEach((element) => {
        for (let searchObj of searchParams.keys()) {
          const searchElement = element.querySelector('[name=' + searchObj + ']');
          if (searchElement) {
            searchElement.value = searchParams.get(searchObj);
          }
        }
      });
    }
  }
};

const loadDynamicFilterDataIntoElements = () => {
  let filterElements = window.document.querySelectorAll('[data-filter-collection]');
  filterElements.forEach(async (element) => {
    const filterId = element.getAttribute('data-filter-id');
    const collection = element.getAttribute('data-filter-collection');
    const endpoint = `collection-table/${collection}/finder/${filterId}/items/`;
    const response = await securedGetCall(endpoint);
    const filterResult = response.data;
    if (response) {
      if (typeof filterResult !== 'object') element.textContent = filterResult;
    }
  });
};

const loadDynamicSelectOptions = (select, collectionField) => {
  const field = collectionField ? JSON.parse(collectionField) : '';
  if (
    ['static_option', 'dynamic_option', 'reference', 'multi_reference', 'belongsTo'].includes(
      field.type,
    )
  ) {
    if (field.isMultiSelect) {
      select.setAttribute('name', `${field.fieldName}[]`);
      select.setAttribute('multiple', 'multiple');
    }
    select.setAttribute('placeholder', `Select ${field.fieldName}`);
    // const elId = select.getAttribute('id');
    // checkAndConvertToSelect(elId);
  }

  if (field) {
    if (field.type === 'static_option') {
      staticOptions(field, select);
    } else if (
      ['dynamic_option', 'reference', 'multi_reference', 'belongsTo'].includes(field.type)
    ) {
      referenceAndDynamicOptions(field, select);
    }
  }
};

const setPredefinedValuesInSelect = async (select, field) => {
  const fieldName = select.getAttribute('data-form-element-collection');
  let fieldValue = '';
  if (fieldName) {
    const response = await getPageItemData();
    const itemData = response.itemData;
    if (itemData) {
      fieldValue = parseValueFromData(itemData, field.fieldName);
      if (['reference', 'multi_reference', 'belongsTo'].includes(field.type)) {
        if (Array.isArray(fieldValue)) {
          fieldValue = fieldValue ? fieldValue.map((item) => item.uuid) : [];
        } else if (typeof fieldValue === 'object') {
          fieldValue = fieldValue ? fieldValue.uuid : '';
        }
      } else if (field.type === 'static_option' || field.type === 'dynamic_option') {
        if (field.isMultiSelect) {
          fieldValue = fieldValue.length > 0 ? fieldValue.split(', ') : [];
        }
      }
    }
  }
  //select.value = fieldValue;
  $('#' + select.id)
    .select2()
    .val(fieldValue)
    .trigger('change');
};

const staticOptions = (field, select) => {
  let options = [`<option value="">-Select-</option>`];
  options = options.concat(
    field.staticOptions.map((item) => {
      return `<option value="${item}">${item}</option>`;
    }),
  );
  select.innerHTML = options.join('');
  setPredefinedValuesInSelect(select, field);
};

const referenceAndDynamicOptions = (field, select) => {
  let itemsUrl = `collection-table/${field.refCollection.collectionName}/items/`;
  publicGetCall(itemsUrl).then((response) => {
    select.innerHTML = referenceOptions(field, response.data);
    setPredefinedValuesInSelect(select, field);
  });
};

const referenceOptions = (field, itemOptions) => {
  let options = [`<option value="">-Select-</option>`];
  options = options.concat(
    Array.isArray(itemOptions)
      ? itemOptions.map((item) => {
          const itemValue = item[field.refCollection.collectionField];
          let optionValue = field.type === 'dynamic_option' ? itemValue : item.uuid;
          if (itemValue && optionValue) {
            return `<option value="${optionValue}">${itemValue}</option>`;
          }
        })
      : '',
  );
  return options.filter(() => true).join('');
};

const isLoggedInUser = () => {
  const loggedInUserData = localStorage.getItem('user');
  return !!loggedInUserData;
};
