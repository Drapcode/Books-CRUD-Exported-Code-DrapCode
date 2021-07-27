//TODO: Need to move below uuidv4() function to some common place.
function uuidv4() {
  return 'xxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let paginationDataMap = new Map();

function getNumberOfPages(totalRecords, numberPerPage) {
  return Math.ceil(totalRecords / numberPerPage);
}

function nextDataGroupPage(paginationData) {
  paginationData.replacedElement.innerHTML = '';
  paginationData.currentPage += 1;
  loadGroupData(paginationData);
}

function loadMoreRecords(paginationData) {
  paginationData.currentPage += 1;
  loadGroupData(paginationData);
}

function previousDataGroupPage(paginationData) {
  paginationData.replacedElement.innerHTML = '';
  paginationData.currentPage -= 1;
  loadGroupData(paginationData);
}

function firstDataGroupPage(paginationData) {
  paginationData.replacedElement.innerHTML = '';
  paginationData.currentPage = 1;
  loadGroupData(paginationData);
}

function lastDataGroupPage(paginationData) {
  paginationData.replacedElement.innerHTML = '';
  paginationData.currentPage = paginationData.numberOfPages;
  loadGroupData(paginationData);
}

async function searchInDataGroup(paginationData, ev) {
  paginationData.replacedElement.innerHTML = '';
  const elements = ev.target;
  paginationData.searchString = convertQueryStringFromFormElements(elements);
  const { dataGroupChildren, searchString, finderId, collectionName } = paginationData;
  const countItemsEndpoint = `collection-table/${collectionName}/finder/${finderId}/items/count?${searchString}`;
  const totalCount = await securedGetCall(countItemsEndpoint);
  let isPrivateFilter = totalCount ? totalCount._$isPrivateFilter : null;
  paginationData.numberOfPages = getNumberOfPages(totalCount.data, paginationData.numberPerPage);
  paginationData.currentPage = 1;
  loadGroupData(paginationData, isPrivateFilter);
}

async function loadGroupData(paginationData, isPrivateFilter) {
  console.log('#####========>> loadGroupData paginationData::', paginationData);

  const {
    numberPerPage,
    numberOfPages,
    filteredItemsUrl,
    collectionId,
    dataGroupChildren,
    replacedElement,
    currentPage,
    searchString,
    originalDataGroup,
    itemIds,
    fieldName,
    collectionName,
    externalQueryParamKeys,
  } = paginationData;
  addPaginationDataToDataMap(paginationData, originalDataGroup);
  let searchQuery = await searchQueryStringFromUrl();
  let endpoint = '';
  let offsetValue = '';

  if (fieldName) {
    endpoint = filteredItemsUrl;
  } else {
    const begin = (currentPage - 1) * numberPerPage;
    const end = begin + numberPerPage;
    offsetValue = begin;
    endpoint = filteredItemsUrl + '?offset=' + begin + '&limit=' + numberPerPage;
    // searchString ? (endpoint = endpoint + '&' + searchString) : '';

    if (typeof searchString !== 'undefined' && searchString && searchQuery) {
      if (searchQuery.startsWith('?')) {
        searchQuery = searchQuery.replace('?', '&');
      }
      endpoint = endpoint + '&' + searchString + searchQuery;
    } else if (typeof searchString !== 'undefined' && searchString && !searchQuery) {
      endpoint = endpoint + '&' + searchString;
    } else if ((typeof searchString === 'undefined' || !searchString) && searchQuery) {
      if (searchQuery.startsWith('?')) {
        searchQuery = searchQuery.replace('?', '&');
      }
      endpoint = endpoint + searchQuery;
    }

    const { itemData } = await getPageItemData(); //Get Item of the collection binded with page

    endpoint = prepareItemDataAndExternalQueryParam(
      externalQueryParamKeys,
      endpoint,
      itemData,
      originalDataGroup,
    );
  }

  console.log('##### searchQueryFromURL externalQueryParamKey', endpoint, 'itemIds:::', itemIds);

  let stylesMap = new Map();

  await renderDataGroupItem(
    collectionName,
    endpoint,
    dataGroupChildren,
    replacedElement,
    originalDataGroup,
    itemIds,
    offsetValue,
    stylesMap,
    isPrivateFilter,
  );
  validatePaginationButton(numberOfPages, currentPage, originalDataGroup);

  /* Set the style */
  for (let [key, value] of stylesMap) {
    let doSelectorExists = selectorExists(`[id^="${key}"]`);

    if (!doSelectorExists) {
      let elementStyle = `*[id^="${key}"] ${value}`;
      addStyle(elementStyle);
    }
  }
}

const createContentPlaceholder = (numberOfItem, elementId, className) => {
  let placeholderItem = '';
  for (let i = 0; i < numberOfItem; i++) {
    placeholderItem += `<div class="drapcode-item ${className} ${elementId}-placeholder">
    <div class="drapcode-col-12">
        <div class="drapcode-picture"></div>
        <div class="drapcode-row">
            <div class="drapcode-col-6 big"></div>
            <div class="drapcode-col-4 empty big"></div>
            <div class="drapcode-col-2 big"></div>
            <div class="drapcode-col-4"></div>
            <div class="drapcode-col-8 empty"></div>
            <div class="drapcode-col-6"></div>
            <div class="drapcode-col-6 empty"></div>
            <div class="drapcode-col-12"></div>
        </div>
    </div>
  </div>`;
  }
  return placeholderItem;
};

const prepareItemDataAndExternalQueryParam = (
  externalQueryParamKeys,
  endpoint,
  itemData,
  originalDataGroup,
) => {
  if (externalQueryParamKeys && externalQueryParamKeys.length > 0) {
    externalQueryParamKeys.forEach((param) => {
      const paramKey = originalDataGroup.getAttribute(param);
      console.log('param', param, 'paramKey:>> ', paramKey);
      if (paramKey && itemData) {
        console.log('I have page item param :>> ', param);
        const extParamValue = itemData[paramKey];
        if (extParamValue) {
          endpoint += `&${param}=${extParamValue}`;
        }
      } else {
        console.log('I do not have page item param or param key :>> ', param);
      }
    });
  }
  return endpoint;
};

const loadDataGroupItems = async (paginationData, originalDataGroup) => {
  const {
    finderId,
    collectionName,
    fieldName,
    numberPerPage,
    dataGroupChildren,
    passIdToFilter,
    externalQueryParamKeys,
    searchString,
  } = paginationData;

  console.log('externalQueryParamKeys data-group:>> ', externalQueryParamKeys);
  const placeholderItem = createContentPlaceholder(
    numberPerPage || 1,
    dataGroupChildren[0].id,
    dataGroupChildren[0].className,
  );
  originalDataGroup.innerHTML = '';
  // originalDataGroup.innerHTML = "<div class='col-md-12 text-center'>Loading items</div>";

  const parentElement = document.createElement('div');
  parentElement.classList.add('data-group-content' + originalDataGroup.getAttribute('id'));
  parentElement.classList.add('row');
  parentElement.innerHTML = placeholderItem;
  originalDataGroup.style.display = ''; //TODO use hide class
  const searchPluginIndex = Object.keys(dataGroupChildren).findIndex((key) => {
    return dataGroupChildren[key].getAttribute('data-gjs') === 'search-form';
  });
  const mapPluginIndex = Object.keys(dataGroupChildren).findIndex((key) => {
    return dataGroupChildren[key].getAttribute('data-gjs') === 'data-group-map';
  });
  const searchElement = dataGroupChildren[searchPluginIndex];
  const mapElement = dataGroupChildren[mapPluginIndex];
  if (searchElement) originalDataGroup.appendChild(searchElement);
  if (mapElement) {
    originalDataGroup.appendChild(mapElement);
  }
  originalDataGroup.appendChild(parentElement);

  const index = Object.keys(dataGroupChildren).findIndex((key) => {
    return dataGroupChildren[key].getAttribute('data-gjs') === 'pagination';
  });
  const dontRepeatElement = dataGroupChildren[index];
  if (dontRepeatElement) originalDataGroup.appendChild(dontRepeatElement);
  paginationData.replacedElement = parentElement;
  paginationData.originalDataGroup = originalDataGroup;
  let isPrivateFilter = false;
  const { itemData } = await getPageItemData(); //Get Item of the collection binded with page
  if (finderId) {
    console.log('Load data group with finders ');
    let countItemsEndpoint = `collection-table/${collectionName}/finder/${finderId}/items/count?`;
    console.log('filteredItemsUrl externalQueryParamKey', countItemsEndpoint, dataGroupChildren);
    countItemsEndpoint = prepareItemDataAndExternalQueryParam(
      externalQueryParamKeys,
      countItemsEndpoint,
      itemData,
      originalDataGroup,
    );

    console.log('countItemsEndpoint externalQueryParamKey :>> ', countItemsEndpoint);
    /**
     * This is to get search query from URL and append it to endpoint
     */
    let searchQuery = await searchQueryStringFromUrl();
    console.log(
      'searchString For Count:>> ',
      searchString,
      'searchQuery externalQueryParamKey:>>',
      searchQuery,
    );
    if (typeof searchString !== 'undefined' && searchString) {
      if (searchQuery) {
        if (searchQuery.startsWith('?')) {
          searchQuery = searchQuery.replace('?', '&');
        }
        countItemsEndpoint = countItemsEndpoint + '&' + searchString + searchQuery;
      } else {
        countItemsEndpoint = countItemsEndpoint + '&' + searchString;
      }
    } else {
      if (searchQuery) {
        if (searchQuery.startsWith('?')) {
          searchQuery = searchQuery.replace('?', '&');
        }
        countItemsEndpoint = countItemsEndpoint + searchQuery;
      }
    }
    console.log('countItemsEndpoint externalQueryParamKey:>> ', countItemsEndpoint);
    const totalCount = await securedGetCall(countItemsEndpoint);
    paginationData.numberOfPages = getNumberOfPages(totalCount.data, paginationData.numberPerPage);
    isPrivateFilter = totalCount ? totalCount._$isPrivateFilter : null;
  } else if (fieldName) {
    console.log('itemData :>>', itemData, 'itemData[fieldName] :>>', itemData[fieldName]);
    const itemIds = parseValueFromData(itemData, fieldName);
    // paginationData.numberOfPages = getNumberOfPages(itemIds.length, paginationData.numberPerPage);
    paginationData.numberOfPages = 1;
    paginationData.filteredItemsUrl = `collection-table/${collectionName}/itemList`;
    paginationData.itemIds = itemIds;
  }
  loadGroupData(paginationData, isPrivateFilter);
  // addPaginationDataToDataMap(paginationData, originalDataGroup);
  // loadList()
};

const addPaginationDataToDataMap = async (paginationData, originalDataGroup) => {
  console.log('paginationData :: >>', paginationData);
  paginationDataMap.set('pdata_' + originalDataGroup.id, paginationData);
};

const renderDataGroupItem = async (
  collectionName,
  endpoint,
  dataGroupBody,
  renderDataGroupElement,
  originalDataGroup,
  itemIds,
  offsetValue = '',
  stylesMap,
  isPrivateFilter,
) => {
  console.log(
    'endpoint',
    endpoint,
    'dataGroupBody',
    dataGroupBody,
    'renderDataGroupElement',
    renderDataGroupElement,
    'originalDataGroup',
    originalDataGroup,
    'offsetValue',
    offsetValue,
    'itemIds',
    itemIds,
  );
  let itemsData = [];

  if (endpoint) {
    let response;
    if (itemIds) {
      // response = await securedPostCall({ ids: itemIds }, endpoint);
      itemsData = itemIds;
    } else {
      response = await securedGetCall(endpoint);
      itemsData = response.data;
    }

    if (itemsData.length > 0) {
      renderMapData(itemsData, originalDataGroup);
      renderData(
        collectionName,
        itemsData,
        dataGroupBody,
        renderDataGroupElement,
        offsetValue,
        stylesMap,
      );
    } else {
      if (isPrivateFilter) {
        renderDataGroupElement.innerHTML =
          "<div class='col-md-12 text-center'>This data is private hence cannot be displayed</div>";
        return;
      }
      renderDataGroupElement.innerHTML = "<div class='col-md-12 text-center'>No Records</div>";
    }
  }
};

const renderMapData = (items, originalDataGroup) => {
  Object.keys(originalDataGroup.children).forEach((elementKey) => {
    const element = originalDataGroup.children[elementKey];
    if (element.getAttribute('data-gjs') === 'data-group-map') {
      const fieldLat = element.getAttribute('data-group-map-lat');
      const fieldLong = element.getAttribute('data-group-map-long');
      const fieldHeader = element.getAttribute('data-group-map-header');
      const fieldDescription = element.getAttribute('data-group-map-description');
      const elementId = element.id;

      element.innerHTML = `<div id="map-${elementId}" class="map"></div> <style>.map{
      height:100%;width:100%;
       }</style>`;

      const map = new google.maps.Map(document.getElementById(`map-${elementId}`), {
        zoom: 15,
        center: new google.maps.LatLng(Number(items[0][fieldLat]), Number(items[0][fieldLong])),
      });

      if (items.length > 0) {
        addMarkerInfo(items, map, fieldLat, fieldLong, fieldHeader, fieldDescription);
      }
    }
  });
};

const addDataGroupMarkerInfo = (
  itemData,
  map,
  fieldLat,
  fieldLong,
  fieldHeader,
  fieldDescription,
) => {
  let infoClickObj = [];
  itemData.map((field) => {
    const marker = new google.maps.Marker({
      position: new google.maps.LatLng({
        lat: Number(field[fieldLat]),
        lng: Number(field[fieldLong]),
      }),
      map: map,
    });

    let prepareContent = '<div>';
    if (field[fieldHeader]) {
      prepareContent += `<h6>${field[fieldHeader]}</h6>`;
    }
    if (field[fieldDescription]) {
      prepareContent += `<p>${field[fieldDescription]}</p>`;
    }

    prepareContent += '</div>';
    const infoWindow = new google.maps.InfoWindow({
      content: prepareContent,
    });
    marker.addListener('click', function () {
      clearInfoClickReference(infoClickObj);
      infoWindow.open(marker.get('map'), marker);
      infoClickObj[0] = infoWindow;
    });
  });
};

const renderData = (
  collectionName,
  items,
  originalDataGroup,
  parentElement,
  offsetValue = '',
  stylesMap,
) => {
  const innerChildren = originalDataGroup;
  document
    .querySelectorAll(
      `.${
        originalDataGroup[0] && originalDataGroup[0] !== 'undefined' ? originalDataGroup[0].id : ''
      }-placeholder`,
    )
    .forEach((e) => e.remove());
  const elementList = items.forEach((item, index) => {
    const tdElement = document.createElement('div');
    replaceContentOfItem(
      collectionName,
      item,
      innerChildren,
      parentElement,
      index,
      offsetValue,
      stylesMap,
    );
  });
  return elementList;
};

const updateChildrenIds = (htmlChildren, newHtml, stylesMap) => {
  if (htmlChildren[0].hasAttribute('id')) {
    const orgChildId = htmlChildren[0].getAttribute('id');
    applyUserDefinedStyles(htmlChildren[0], newHtml, stylesMap);
    htmlChildren[0].setAttribute('id', orgChildId + '-' + uuidv4());
  }

  htmlChildren[0].childNodes.forEach((child) => {
    if (child.attributes && child.hasAttribute('id')) {
      updateInnerChildIds(child, newHtml, stylesMap);
    }
  });
};

const updateInnerChildIds = (htmlChildren, newHtml, stylesMap) => {
  if (htmlChildren.hasAttribute('id')) {
    const orgChildId = htmlChildren.getAttribute('id');
    applyUserDefinedStyles(htmlChildren, newHtml, stylesMap);
    htmlChildren.setAttribute('id', orgChildId + '-' + uuidv4());
  }

  htmlChildren.childNodes.forEach((child) => {
    if (child.attributes && child.hasAttribute('id')) {
      updateInnerChildIds(child, newHtml, stylesMap);
    }
  });
};

const replaceContentOfItem = (
  collectionName,
  item,
  innerChildren,
  replacedElement,
  index = '',
  offsetValue = '',
  stylesMap,
) => {
  Object.keys(innerChildren).forEach(async (key) => {
    const element = innerChildren[key];
    if (
      element.getAttribute('data-gjs') === 'pagination' ||
      element.getAttribute('data-gjs') === 'search-form'
    ) {
    } else if (element.getAttribute('data-gjs') === 'data-group-map') {
    } else {
      const newHtml = element.cloneNode(true);
      const elementOrgId = newHtml.getAttribute('id');
      if (elementOrgId && (index || offsetValue)) {
        if (index) {
          newHtml.setAttribute('id', elementOrgId + '-' + key + index + '-' + uuidv4());
        }
        if (offsetValue) {
          const newElementId = newHtml.getAttribute('id');
          newHtml.setAttribute('id', newElementId + '-' + offsetValue);
        }
      }

      applyUserDefinedStyles(element, newHtml, stylesMap);

      const { itemData, collectionId, collectionItemId } = await getPageItemData();
      const dataField = `data-${collectionId}`;
      const dataURLField = `data-url-${collectionId}`;

      if (element.children.length > 0) {
        const orgChildHtml = newHtml.children;

        updateChildrenIds(orgChildHtml, newHtml, stylesMap);

        const dynamicHtml = newHtml.querySelectorAll('[data-text-content]');
        const imageHtml = newHtml.querySelectorAll('[data-img-src]');
        let hyperLinks = newHtml.querySelectorAll('[data-path-collection-name]');
        // const uuidHtml = newHtml.querySelectorAll('[shopping-cart-type]');
        const marketplaceFormHtml = newHtml.querySelectorAll('[data-gjs="marketplace-form"]');
        const progressBarHtml = newHtml.querySelectorAll("[role='progressbar']");
        const allButtons = newHtml.querySelectorAll('a, button');
        const collectionURLHtml = newHtml.querySelectorAll('[data-href-content]');
        const formElements = newHtml.querySelectorAll('form');

        const innerDataGroup = newHtml.querySelectorAll('[data-ref-field]');
        const textContentElements = newHtml.querySelectorAll('[' + dataField + ']');
        const urlContentElements = newHtml.querySelectorAll('[' + dataURLField + ']');

        const fileLinkElements = newHtml.querySelectorAll(
          '[data-text-content][data-field-type="file"][data-href-content]',
        );

        innerDataGroup.forEach((element) => {
          replaceInnerGroup(collectionName, item, element, stylesMap);
        });
        imageHtml.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) renderImageFromDB(item, element, stylesMap);
        });
        Object.values(dynamicHtml).map((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) replaceContentOfTextContent(item, element, stylesMap);
        });
        // uuidHtml.forEach((element) => {
        //   const isInnerDataGroup = element.closest('[data-ref-field]');
        //   if (!isInnerDataGroup) replaceContentWithUUID(item, element);
        // });
        progressBarHtml.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) replaceContentOfProgressBarContent(item, element);
        });
        hyperLinks.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) replaceHrefOfHyperLinks(item, element);
        });
        allButtons.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) addItemUuidIntoButtonAndLink(item, element);
        });
        collectionURLHtml.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) replaceContentOfFieldURL(item, element);
        });
        formElements.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) replaceContentOfFormElements(item, element);
        });
        marketplaceFormHtml.forEach((element) => {
          addValueToMarketplaceCheck(collectionName, item, element);
        });
        textContentElements.forEach((textElement) => {
          const fieldName = textElement.getAttribute(dataField);
          const fieldType = textElement.getAttribute('data-field-type');
          let value = itemData[fieldName] || '';
          let isHtml = value && fieldType === 'large_text' ? htmlRegex.test(value) : false;
          if (isHtml) {
            textElement.innerHTML = value;
          } else if (fieldType === 'boolean') {
            textElement.textContent = value ? 'Yes' : 'No';
          } else {
            textElement.textContent = value;
          }
        });
        urlContentElements.forEach((urlElement) => {
          const fieldName = urlElement.getAttribute(dataURLField);
          const href = urlElement.getAttribute(dataURLField);
          const replaceHref = href.replace(fieldName, itemData[fieldName]);
          urlElement.setAttribute('href', replaceHref);
        });
        fileLinkElements.forEach((element) => {
          const isInnerDataGroup = element.closest('[data-ref-field]');
          if (!isInnerDataGroup) replaceContentOfFileLinkElements(item, element);
        });
      } else {
        replaceContentOfTextContent(item, newHtml, stylesMap);
        renderImageFromDB(item, newHtml, stylesMap);
        replaceHrefOfHyperLinks(item, newHtml);
        replaceContentOfFieldURL(item, newHtml);
        replaceContentOfFormElements(item, newHtml);
      }
      replacedElement.appendChild(newHtml);
      addDynamicDataIntoFormElements();
    }
  });
};

const replaceContentOfFormElements = (item, element) => {
  const dataGroupFormElements = element.querySelectorAll('[data-form-element-data-group]');
  dataGroupFormElements.forEach((formElement) => {
    const fieldName = formElement.getAttribute('data-form-element-data-group');
    const fieldValue = parseValueFromData(item, fieldName);
    insertFormElementValue(fieldValue, formElement);
  });
};

const addValueToMarketplaceCheck = (collectionName, item, formElement) => {
  const quantityField = formElement.getAttribute('quantityfield');
  const priceField = formElement.getAttribute('pricefield');
  const nameField = formElement.getAttribute('namefield');
  const descriptionField = formElement.getAttribute('descriptionfield');

  formElement.elements['quantity-field'].value = quantityField;
  formElement.elements['price-field'].value = priceField;
  formElement.elements['productId'].value = item.uuid;
  formElement.elements['collectionName'].value = collectionName;
  formElement.elements['name-field'].value = nameField;
  formElement.elements['description-field'].value = descriptionField;
};

const replaceHrefOfHyperLinks = (item, htmlElement) => {
  const fieldName = htmlElement.getAttribute('data-path-field-name');
  const seoName = htmlElement.getAttribute('data-path-field-seo');

  const elementOrgId = htmlElement.getAttribute('id');

  if (fieldName) {
    const href = htmlElement.getAttribute('href');
    let fieldHref = fieldName ? parseValueFromData(item, fieldName) : '';

    fieldHref = fieldHref.split(', ');
    fieldHref = fieldHref[0];

    let replaceHref = href.replace(fieldName, fieldHref);
    if (seoName) {
      let seoHref = seoName ? parseValueFromData(item, seoName) : '';
      seoHref = slugify(seoHref);
      replaceHref = replaceHref.replace(seoName, seoHref);
    }

    htmlElement.setAttribute('href', replaceHref);
  }
};
const addItemUuidIntoButtonAndLink = (item, htmlElement) => {
  htmlElement.setAttribute('data-item-id', item['uuid']);
};

/**
 * this method also getting used for normal page file render
 */
const replaceContentOfFileLinkElements = (item, htmlElement, dataURLField = null) => {
  let fieldName;
  if (dataURLField) {
    fieldName = htmlElement.getAttribute(dataURLField);
  } else {
    fieldName = htmlElement.getAttribute('data-text-content');
  }
  const type = htmlElement.getAttribute('data-field-type');
  if (fieldName) {
    const value = parseValueFromData(item, fieldName);
    if (type === 'file') {
      let imageUrl = '';
      let fileName = '';
      let data = '';
      if (typeof value === 'object' && !Array.isArray(value)) {
        imageUrl = IMAGE_SERVER_URL + value.key;
        fileName = value.originalName;
        htmlElement.href = imageUrl ? imageUrl : '';
        htmlElement.innerText = fileName ? fileName : imageUrl;
      } else if (value && Array.isArray(value)) {
        data = value.map((record) => {
          const imageUrl = record && record.key ? IMAGE_SERVER_URL + record.key : '';
          const fileName = record && record.originalName ? record.originalName : '';
          const anchorLink = document.createElement('a');
          anchorLink.href = imageUrl;
          anchorLink.innerText = fileName ? fileName : imageUrl;
          //anchorLink.id = uuidv4();
          anchorLink.id = htmlElement.id;
          anchorLink.classList = htmlElement.classList;
          return anchorLink;
        });
        htmlElement.replaceWith(...data);
      }
      return;
    }
  }
};

let replaceTextContent = false;
const replaceContentOfTextContent = (item, htmlElement, stylesMap) => {
  // htmlElement.removeAttribute('id');

  if (replaceTextContent) {
    const sourceElement = htmlElement.cloneNode(true);
    const elementOrgId = htmlElement.getAttribute('id');
    const newElementId = elementOrgId;
    htmlElement.setAttribute('id', newElementId);
    applyUserDefinedStyles(sourceElement, htmlElement, stylesMap);
  } else {
    replaceTextContent = true;
  }

  let fieldName = htmlElement.getAttribute('data-text-content');
  const type = htmlElement.getAttribute('data-field-type');
  if (fieldName) {
    if (fieldName.includes('"') && 'functionType' in JSON.parse(fieldName)) {
      htmlElement.textContent = getDerivedFieldData(fieldName, item);
    } else {
      if (type === 'reference' || type === 'multi_reference' || type === 'belongsTo') {
        let { nestedFieldName } = JSON.parse(htmlElement.getAttribute('metaData')) || {};
        if (!nestedFieldName) {
          let belongsToMetaData = item['_$belongsToMetaData'];
          let { collectionField } = belongsToMetaData ? belongsToMetaData.refCollection : {};
          nestedFieldName = collectionField ? collectionField : undefined;
        }
        if (!fieldName.includes('.')) {
          fieldName = fieldName + '.' + nestedFieldName;
        }
      }
      if (type === 'createdBy') {
        fieldName = fieldName + '.' + 'userName';
      }
      const value = parseValueFromData(item, fieldName);
      if (value && type === 'large_text') {
        let isHtml = htmlRegex.test(value);
        if (isHtml) {
          htmlElement.innerHTML = value;
          return;
        }
      }
      if (type === 'boolean') {
        htmlElement.textContent = value ? 'Yes' : 'No';
        return;
      }
      htmlElement.textContent = value;
    }
  }
};

const replaceInnerGroup = (collectionName, item, htmlElement, stylesMap) => {
  const newParentChildDataGroup = htmlElement.cloneNode(true);
  htmlElement.innerHTML = '';
  const fieldName = newParentChildDataGroup.getAttribute('data-ref-field');
  const refCollectionName = newParentChildDataGroup.getAttribute('data-ref-collection');
  let innerItems = fieldName ? parseValueFromData(item, fieldName) : [];
  if (innerItems && Array.isArray(innerItems)) {
    innerItems.forEach((item) => {
      renderItemOfReferenceField(
        collectionName,
        item,
        newParentChildDataGroup,
        htmlElement,
        stylesMap,
      );
    });
  } else {
    renderItemOfReferenceField(
      collectionName,
      innerItems,
      newParentChildDataGroup,
      htmlElement,
      stylesMap,
    );
  }
};
const replaceContentOfFieldURL = (item, htmlElement) => {
  const fieldName = htmlElement.getAttribute('data-href-content');
  const elementOrgId = htmlElement.getAttribute('id');
  const type = htmlElement.getAttribute('data-field-type');

  if (fieldName && type !== 'file') {
    const replaceFieldURL = fieldName.replace(fieldName, parseValueFromData(item, fieldName));
    htmlElement.setAttribute('href', replaceFieldURL);
  }
};

const renderItemOfReferenceField = (collectionName, item, newParentChildDataGroup, htmlElement) => {
  const innerChildren = newParentChildDataGroup.children;
  replaceContentOfItem(collectionName, item, innerChildren, htmlElement, '', '', stylesMap);
};

let renderImgContent = false;
const renderImageFromDB = (item, htmlElement, stylesMap) => {
  const fieldName = htmlElement.getAttribute('data-img-src');
  const type = htmlElement.getAttribute('data-field-type');
  if (fieldName) {
    let imageSrcUrl = htmlElement.src;
    let itemImageData = fieldName ? parseValueFromData(item, fieldName) : '';
    if (Array.isArray(itemImageData)) {
      itemImageData = itemImageData[0];
    }

    // htmlElement.removeAttribute('id');

    if (renderImgContent) {
      const sourceElement = htmlElement.cloneNode(true);
      const elementOrgId = htmlElement.getAttribute('id');
      const newElementId = elementOrgId + '-' + uuidv4();
      htmlElement.setAttribute('id', newElementId);
      applyUserDefinedStyles(sourceElement, htmlElement, stylesMap);
    } else {
      renderImgContent = true;
    }

    if (itemImageData) {
      if (typeof itemImageData === 'object') {
        const imageKey = itemImageData.key;
        if (imageKey) imageSrcUrl = IMAGE_SERVER_URL + imageKey;
      } else if (typeof itemImageData === 'string' && itemImageData.startsWith('http')) {
        imageSrcUrl = itemImageData;
      }
      htmlElement.src = imageSrcUrl;
    }
  }
};

const replaceContentOfProgressBarContent = (item, htmlElement) => {
  htmlElement = htmlElement.parentElement;

  const fieldNow = htmlElement.getAttribute('data-progress-now');
  const fieldMin = htmlElement.getAttribute('data-progress-min');
  const fieldMax = htmlElement.getAttribute('data-progress-max');

  const child = htmlElement.children[0];
  if (fieldNow && item[fieldNow]) {
    if (fieldNow.includes('"') && 'functionType' in JSON.parse(fieldNow)) {
      const derivedFieldData = getDerivedFieldData(fieldNow, item);
      htmlElement.setAttribute('data-progress-now', derivedFieldData);
      child.setAttribute('aria-valuenow', derivedFieldData);
      child.style.nowWidth = `${derivedFieldData}%`;
    } else {
      htmlElement.setAttribute('data-progress-now', item[fieldNow]);
      child.setAttribute('aria-valuenow', item[fieldNow]);
      child.style.width = `${item[fieldNow]}%`;
    }
  }
  if (fieldMin && item[fieldMin]) {
    if (fieldMin.includes('"') && 'functionType' in JSON.parse(fieldMin)) {
      const derivedFieldData = getDerivedFieldData(fieldMin, item);
      htmlElement.setAttribute('data-progress-min', derivedFieldData);
      child.setAttribute('aria-valuemin', derivedFieldData);
      child.style.minWidth = `${derivedFieldData}%`;
    } else {
      htmlElement.setAttribute('data-progress-min', item[fieldMin]);
      child.setAttribute('aria-valuemin', item[fieldMin]);
      child.style.minWidth = `${item[fieldMin]}%`;
    }
  }
  if (fieldMax && item[fieldMax]) {
    if (fieldMax.includes('"') && 'functionType' in JSON.parse(fieldMax)) {
      const derivedFieldData = getDerivedFieldData(fieldMax, item);

      htmlElement.setAttribute('data-progress-max', derivedFieldData);
      child.setAttribute('aria-valuemax', derivedFieldData);
      child.style.maxWidth = `${derivedFieldData}%`;
    } else {
      htmlElement.setAttribute('data-progress-max', item[fieldMax]);
      child.setAttribute('aria-valuemax', item[fieldMax]);
      child.style.maxWidth = `${item[fieldMax]}%`;
    }
  }
};

const scrollEvents = (
  finderId,
  collectionName,
  recordsOnPage,
  dataGroupBody,
  originalDataGroup,
) => {};
