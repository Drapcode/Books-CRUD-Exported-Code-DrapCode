function getNumberOfPages(totalRecords, numberPerPage) {
  return Math.ceil(totalRecords / numberPerPage);
}

function nextDataTablePage(paginationData) {
  paginationData.currentPage += 1;
  loadDataList(paginationData);
}

let dataTablePaginationDataMap = new Map();
let stylesMap = new Map();

async function searchInDataTable(paginationData, ev, searchQuery = '') {
  if (typeof ev !== 'undefined') {
    const elements = ev.target;
    paginationData.searchString = convertQueryStringFromFormElements(elements);
  }

  if (
    typeof paginationData.searchString !== 'undefined' &&
    paginationData.searchString &&
    searchQuery
  ) {
    if (searchQuery.startsWith('?')) {
      searchQuery = searchQuery.replace('?', '&');
    }
    paginationData.searchString =
      paginationData.searchString + '&' + paginationData.searchString + searchQuery;
  } else if (typeof paginationData.searchString === 'undefined' && searchQuery) {
    if (searchQuery.startsWith('?')) {
      searchQuery = searchQuery.replace('?', '');
    }
    paginationData.searchString = searchQuery;
  }

  console.log(
    '##### searchInDataTable ##### searchQueryFromURL AFTER searchQuery::',
    searchQuery,
    'searchString::',
    paginationData.searchString,
  );

  const { dataTable, searchString, finderId, collectionName, tbodyElement } = paginationData;
  const theadElement = dataTable.querySelector('thead');
  const columnCount = theadElement.rows[0].cells.length;
  if (validateDataTableProps(finderId, collectionName, columnCount, tbodyElement)) {
    const countItemsEndpoint = `collection-table/${collectionName}/finder/${finderId}/items/count?${searchString}`;
    const totalCount = await securedGetCall(countItemsEndpoint);
    let isPrivateFilter = totalCount ? totalCount._$isPrivateFilter : null;
    if (totalCount.data > 0) {
      paginationData.numberOfPages = getNumberOfPages(
        totalCount.data,
        paginationData.numberPerPage,
      );
      // await prepareTableColumn(paginationData);
      paginationData.currentPage = 1;
      loadDataList(paginationData);
    } else {
      if (isPrivateFilter) {
        tbodyElement.innerHTML = `<tr><td  class="text-center" colspan="${columnCount}">This data is private hence cannot be displayed</td></tr>`;
        validatePaginationButton(1, 1, dataTable);
        return;
      }
      tbodyElement.innerHTML = `<tr><td  class="text-center" colspan="${columnCount}"> No Records</td></tr>`;
      validatePaginationButton(1, 1, dataTable);
    }
  } else {
    validatePaginationButton(1, 1, dataTable);
  }
  // loadDataList(paginationData);
}

function previousDataTablePage(paginationData) {
  paginationData.currentPage -= 1;
  loadDataList(paginationData);
}

function firstDataTablePage(paginationData) {
  paginationData.currentPage = 1;
  loadDataList(paginationData);
}

function lastDataTablePage(paginationData) {
  paginationData.currentPage = paginationData.numberOfPages;
  loadDataList(paginationData);
}

async function loadDataList(paginationData) {
  const { currentPage, numberPerPage, filteredItemsUrl, fieldName, searchString } = paginationData;
  let endpoint = '';
  if (fieldName) {
    endpoint = filteredItemsUrl;
  } else {
    const begin = (currentPage - 1) * numberPerPage;
    const end = begin + numberPerPage;
    endpoint = filteredItemsUrl + '?offset=' + begin + '&limit=' + numberPerPage;
    console.log('loadDataTable filteredItemsUrlfilteredItemsUrl', endpoint);
    searchString ? (endpoint = endpoint + '&' + searchString) : '';
    // pageList = list.slice(begin, end);
  }
  await renderDataTable(endpoint, paginationData);
  validatePaginationButton(
    paginationData.numberOfPages,
    paginationData.currentPage,
    paginationData.dataTable,
  );
}

const addTablePlaceholder = (numberOfItem, dataTableId, tbodyRef) => {
  const tableCell = tbodyRef.rows[0].cells.length;
  for (let i = 0; i < numberOfItem; i++) {
    const newRow = tbodyRef.insertRow();
    for (let j = 0; j < tableCell; j++) {
      const newCell = newRow.insertCell();
      newCell.innerHTML = `<div class="drapcode-item-table">
      <div class="drapcode-col-12">
          <div class="drapcode-row">
              <div class="drapcode-col-12 big"></div>
          </div>
      </div>
    </div>`;
    }
  }
};

const loadDataTable = async (finderId, collectionName, paginationData) => {
  const { dataTable, fieldName, numberPerPage } = paginationData;
  const theadElement = dataTable.querySelector('thead');
  const columnCount = theadElement.rows[0].cells.length;
  const tbodyElement = dataTable.querySelector('[data-js=table-body]');
  const tablePlaceholder = addTablePlaceholder(numberPerPage || 1, dataTable.id, tbodyElement);
  if (validateDataTableProps(finderId, collectionName, fieldName, columnCount, tbodyElement)) {
    let totalCount = 0;
    let isPrivateFilter = false;
    if (finderId) {
      const countItemsEndpoint = `collection-table/${collectionName}/finder/${finderId}/items/count`;
      const totalCountResponse = await securedGetCall(countItemsEndpoint);
      totalCount = totalCountResponse.data;
      paginationData.numberOfPages = getNumberOfPages(totalCount, paginationData.numberPerPage);
      isPrivateFilter = totalCountResponse ? totalCountResponse._$isPrivateFilter : null;
    } else if (fieldName) {
      const { itemData } = await getPageItemData();
      const itemIds = parseValueFromData(itemData, fieldName);
      totalCount = itemIds.length;
      // paginationData.numberOfPages = getNumberOfPages(itemIds.length, paginationData.numberPerPage);
      paginationData.numberOfPages = 1;
      paginationData.filteredItemsUrl = `collection-table/${collectionName}/itemList`;
      paginationData.itemIds = itemIds;
    }

    if (totalCount > 0) {
      paginationData.tbodyElement = tbodyElement;
      await setTableMetaData(paginationData);
      let searchQuery = await searchQueryStringFromUrl();
      if (searchQuery) {
        searchInDataTable(paginationData, undefined, searchQuery);
      } else {
        loadDataList(paginationData);
      }
      addDataTableDataToMap(paginationData, paginationData.dataTable);
    } else {
      if (isPrivateFilter) {
        tbodyElement.innerHTML = `<tr><td  class="text-center" colspan="${columnCount}">This data is private hence cannot be displayed</td></tr>`;
        validatePaginationButton(1, 1, dataTable);
        return;
      }
      tbodyElement.innerHTML = `<tr><td  class="text-center" colspan="${columnCount}"> No Records</td></tr>`;
      validatePaginationButton(1, 1, dataTable);
    }
  } else {
    validatePaginationButton(1, 1, dataTable);
  }
  // loadDataList()
};

const addDataTableDataToMap = async (paginationData, originalDataGroup) => {
  dataTablePaginationDataMap.set('ptdata_' + originalDataGroup.id, paginationData);
};

const validateDataTableProps = (finderId, collectionName, fieldName, columnCount, tbodyElement) => {
  let isValid = true;
  // if (!finderId) {
  //   tbodyElement.innerHTML = `<tr><td  class="text-center" colspan="${columnCount}"> Please use valid finders</td></tr>`;
  //   isValid = false;
  // }
  if (!collectionName) {
    tbodyElement.innerHTML = `<tr><td  class="text-center" colspan="${columnCount}"> Please select a valid collection</td></tr>`;
    isValid = false;
  }
  return isValid;
};
const setTableMetaData = async (paginationData) => {
  const { dataTable, tbodyElement } = paginationData;
  paginationData.firstRowElements = tbodyElement.rows[0].cloneNode(true);
  paginationData.columnsMap = getColumnsMetaData(dataTable);
};

const getColumnsMetaData = (dataTable) => {
  let columnsMap = [];
  const tableRows = dataTable.querySelector('[data-custom-js-row=collection-row]');
  if (tableRows) {
    const tableHeadingCells = tableRows ? tableRows.cells : [];
    Object.values(tableHeadingCells).map((column) => {
      let columnKey = column.getAttribute('data-selected-column');
      if (columnKey.includes('"')) {
        columnKey = columnKey.split("'").join('"');
      }
      const columnValue = column.getAttribute('type');
      if (columnKey) {
        columnsMap[columnKey] = columnValue;
        if (
          columnValue === 'reference' ||
          columnValue === 'multi_reference' ||
          columnValue === 'createdBy' ||
          columnValue === 'belongsTo'
        ) {
          let refCollection = column.getAttribute('metadata');
          if (columnValue === 'createdBy' && !refCollection) {
            refCollection = null;
          }
          columnsMap[columnKey] = {
            metaData: JSON.parse(refCollection),
            type: columnValue,
          };
        }
      }
    });
  }
  return columnsMap;
};

const renderDataTable = async (endpoint, paginationData) => {
  const { columnsMap, firstRowElements, tbodyElement, itemIds } = paginationData;
  if (tbodyElement) {
    let rows = ``;
    tbodyElement.innerHTML = rows;
    let tableData;
    if (columnsMap) {
      if (itemIds) {
        tableData = itemIds;
      } else {
        const response = await securedGetCall(endpoint);
        tableData = response.data;
      }
      rows += await createTableRecords(tableData, columnsMap, firstRowElements);
      tbodyElement.innerHTML = rows;
    }
  }

  /* Set the style */
  for (let [key, value] of stylesMap) {
    let doSelectorExists = selectorExists(`[id^="${key}"]`);
    if (!doSelectorExists) {
      let elementStyle = `*[id^="${key}"] ${value}`;
      addStyle(elementStyle);
    }
  }
};
const createTableRecords = async function (items, columnsMap, firstRowElements) {
  const currentTableRows = items.map(async (item) => {
    const columns = await getTableColumns(item, columnsMap, firstRowElements);

    const orgTrElement = firstRowElements.tagName === 'TR' ? firstRowElements : '';
    let orgTrElementTagId = '';
    if (orgTrElement) {
      const sourceElement = orgTrElement.cloneNode(true);
      orgTrElementTagId = orgTrElement.getAttribute('id');
      applyUserDefinedStyles(sourceElement, orgTrElement, stylesMap);
    }

    return `<tr ${setIdAttribute(orgTrElementTagId)}>${columns}</tr>`;
  });
  return (await Promise.all(currentTableRows)).join('');
};
const getTableColumns = async (item, columnsMap, firstRowElements) => {
  const column = Object.keys(columnsMap).map(async (el) => {
    const firstRowColumns = firstRowElements.cells;
    const rowColumn = Object.values(firstRowColumns).find((cell) => {
      return cell.getAttribute('data-selected-column') === el;
    });

    const orgTdElement = rowColumn.tagName === 'TD' ? rowColumn : '';
    const orgThElement = rowColumn.tagName === 'TH' ? rowColumn : '';
    let orgTdElementTagId = '';
    let orgThElementTagId = '';
    if (orgTdElement) {
      const sourceElement = orgTdElement.cloneNode(true);
      orgTdElementTagId = orgTdElement.getAttribute('id');
      applyUserDefinedStyles(sourceElement, orgTdElement, stylesMap);
    } else if (orgThElement) {
      const sourceElement = orgThElement.cloneNode(true);
      orgThElementTagId = orgThElement.getAttribute('id');
      applyUserDefinedStyles(sourceElement, orgThElement, stylesMap);
    }

    const cellComponents = rowColumn ? rowColumn.children : '';

    if (el.includes('"') && 'functionType' in JSON.parse(el)) {
      const textContent = getDerivedFieldData(el, item);
      return `<td ${setIdAttribute(orgTdElementTagId)}>${setColumnDataIntoHtmlElement(
        textContent,
        cellComponents[0],
      )}</td>`;
    } else if (columnsMap[el] === 'boolean') {
      if (el in item) {
        let textContent = item[el] ? 'Yes' : 'No';
        return `<td ${setIdAttribute(orgTdElementTagId)}>${setColumnDataIntoHtmlElement(
          textContent,
          cellComponents[0],
        )}</td>`;
      } else {
        return `<td ${setIdAttribute(orgTdElementTagId)}>${setColumnDataIntoHtmlElement(
          null,
          cellComponents[0],
        )}</td>`;
      }
    } else if (columnsMap[el] === 'image' || columnsMap[el] === 'file') {
      return renderFileColumnData(item, el, cellComponents[0]);
    } else if (columnsMap[el] === 'multi_image' || columnsMap[el] === 'multi_file') {
      return renderMultiFileColumnData(item, el, cellComponents[0]);
    } else if (
      columnsMap[el] === 'updatedAt' ||
      columnsMap[el] === 'createdAt' ||
      columnsMap[el] === 'date'
    ) {
      return renderTimestampColumnData(item, el, cellComponents[0]);
    } else if (typeof columnsMap[el] === 'object') {
      const column = await renderReferenceTypeData(item, columnsMap[el], el, cellComponents[0]);
      return column;
    } else if (columnsMap[el] === 'action') {
      return `<td ${setIdAttribute(orgTdElementTagId)}>${renderActionColumnData(
        item,
        el,
        cellComponents,
      )}</td>`;
    } else if (columnsMap[el] === 'large_text') {
      return renderTableLargeTextColumn(item, el, cellComponents[0], orgTdElementTagId);
    } else {
      return renderTableBodyColumn(item, el, cellComponents[0], orgTdElementTagId);
    }
  });
  return (await Promise.all(column)).join('');
};

const setIdAttribute = (elementTagId) => {
  if (elementTagId) {
    return `id=${elementTagId}-${uuidv4()}`;
  } else {
    return '';
  }
};

const renderTableBodyColumn = (item, column, tableColumnContentTag, orgTdElementTagId) => {
  let textContent = item[column] ? item[column] : '';
  return `<td ${setIdAttribute(orgTdElementTagId)}>${setColumnDataIntoHtmlElement(
    textContent,
    tableColumnContentTag,
  )}</td>`;
};

const renderTableLargeTextColumn = (item, column, tableColumnContentTag, orgTdElementTagId) => {
  let isHtml = item[column] ? htmlRegex.test(item[column]) : false;
  let textContent = item[column] ? item[column] : '';
  return `<td ${setIdAttribute(orgTdElementTagId)}>${setColumnDataIntoHtmlElement(
    textContent,
    tableColumnContentTag,
    isHtml,
  )}</td>`;
};

const setColumnDataIntoHtmlElement = (textContent, tableColumnContentTag, isHtml = false) => {
  if (tableColumnContentTag) {
    setAttributeInColumnData(tableColumnContentTag);
    if (isHtml) {
      tableColumnContentTag.innerHTML = textContent ? textContent : '';
    } else {
      tableColumnContentTag.textContent = textContent ? textContent : '';
    }
    return tableColumnContentTag.outerHTML;
  } else {
    return textContent ? textContent : '';
  }
};
const renderImageColumnData = (item, column, tableColumnContentTag) => {
  const itemImageData = column ? item[column] : '';
  let imageUrl = '';
  let fileName = '';
  if (typeof itemImageData === 'object') {
    imageUrl = IMAGE_SERVER_URL + itemImageData.key;
    fileName = itemImageData.originalName;
  } else if (typeof itemImageData === 'string' && itemImageData.startsWith('http')) {
    imageUrl = itemImageData;
    fileName = itemImageData;
  }
  const innerTag = tableColumnContentTag ? tableColumnContentTag.tagName : '';
  if (innerTag && innerTag === 'IMG') {
    const newImgTag = tableColumnContentTag.cloneNode(true);
    newImgTag.src = imageUrl ? imageUrl : newImgTag.src;
    return `<td>${newImgTag.outerHTML}</td>`;
  } else {
    const anchorLink = document.createElement('a');
    anchorLink.href = imageUrl ? imageUrl : imageUrl;
    anchorLink.innerText = fileName ? fileName : imageUrl;
    if (tableColumnContentTag) {
      tableColumnContentTag.innerHTML = anchorLink.outerHTML;
      return `<td>${tableColumnContentTag.outerHTML}</td>`;
    } else {
      return `<td>${anchorLink.outerHTML}</td>`;
    }
  }
};
const renderFileColumnData = (item, column, tableColumnContentTag) => {
  const itemImageData = column ? item[column] : '';
  let imageUrl = '';
  let fileName = '';
  let data = '';

  if (typeof itemImageData === 'object' && !Array.isArray(itemImageData)) {
    if (typeof itemImageData === 'object') {
      imageUrl = IMAGE_SERVER_URL + itemImageData.key;
      fileName = itemImageData.originalName;
    } else if (typeof itemImageData === 'string' && itemImageData.startsWith('http')) {
      imageUrl = itemImageData;
      fileName = itemImageData;
    }
    const innerTag = tableColumnContentTag ? tableColumnContentTag.tagName : '';
    if (innerTag && innerTag === 'IMG') {
      const newImgTag = tableColumnContentTag.cloneNode(true);
      newImgTag.src = imageUrl ? imageUrl : newImgTag.src;
      // return `<td>${newImgTag.outerHTML}</td>`;
      data = [newImgTag.outerHTML];
    } else {
      const anchorLink = document.createElement('a');
      anchorLink.href = imageUrl ? imageUrl : imageUrl;
      anchorLink.innerText = fileName ? fileName : imageUrl;
      if (tableColumnContentTag) {
        tableColumnContentTag.innerHTML = anchorLink.outerHTML;
        data = [tableColumnContentTag.outerHTML];
        // return `<td>${tableColumnContentTag.outerHTML}</td>`;
      } else {
        data = [anchorLink.outerHTML];
        // return `<td>${anchorLink.outerHTML}</td>`;
      }
    }
  } else if (itemImageData && Array.isArray(itemImageData)) {
    data = itemImageData.map((record) => {
      const imageUrl = record && record.key ? IMAGE_SERVER_URL + record.key : '';
      const fileName = record && record.originalName ? record.originalName : '';
      const innerTag = tableColumnContentTag ? tableColumnContentTag.tagName : '';
      if (innerTag && innerTag === 'IMG') {
        const newImgTag = tableColumnContentTag.cloneNode(true);
        imageUrl ? (newImgTag.src = imageUrl) : newImgTag.src;
        return newImgTag.outerHTML;
      } else {
        const anchorLink = document.createElement('a');
        anchorLink.href = imageUrl;
        anchorLink.innerText = fileName ? fileName : imageUrl;
        if (tableColumnContentTag) {
          tableColumnContentTag.innerHTML = anchorLink.outerHTML;
          return tableColumnContentTag.outerHTML;
        } else {
          return anchorLink.outerHTML;
        }
      }
    });
  }
  return `<td>${data ? data.join(' ') : ''} </td>`;
};
const renderMultiFileColumnData = (item, column, tableColumnContentTag) => {
  let data = '';
  if (item[column] && Array.isArray(item[column])) {
    data = item[column].map((record) => {
      const imageUrl = record && record.key ? IMAGE_SERVER_URL + record.key : '';
      const fileName = record && record.originalName ? record.originalName : '';
      const innerTag = tableColumnContentTag ? tableColumnContentTag.tagName : '';
      if (innerTag && innerTag === 'IMG') {
        const newImgTag = tableColumnContentTag.cloneNode(true);
        imageUrl ? (newImgTag.src = imageUrl) : newImgTag.src;
        return newImgTag.outerHTML;
      } else {
        const anchorLink = document.createElement('a');
        anchorLink.href = imageUrl;
        anchorLink.innerText = fileName ? fileName : imageUrl;
        if (tableColumnContentTag) {
          tableColumnContentTag.innerHTML = anchorLink.outerHTML;
          return tableColumnContentTag.outerHTML;
        } else {
          return anchorLink.outerHTML;
        }
      }
    });
  }
  return `<td>${data ? data.join(' ') : ''} </td>`;
};

const renderTimestampColumnData = (item, column, tableColumnContentTag) => {
  let textContent = item[column] ? convertTimeStampToDate(item[column]) : '';
  return `<td>${setColumnDataIntoHtmlElement(textContent, tableColumnContentTag)}</td>`;
};

const renderReferenceTypeData = (item, columnsMap, columnName, tableColumnContentTag) => {
  let { nestedFieldName } = columnsMap.metaData || {};
  if (!nestedFieldName) {
    let belongsToMetaData = item['_$belongsToMetaData'];
    let { collectionField } = belongsToMetaData ? belongsToMetaData.refCollection : {};
    nestedFieldName = collectionField ? collectionField : undefined;
    if (columnsMap.type === 'createdBy') {
      nestedFieldName = 'userName';
    }
  }
  if (!columnName.includes('.')) {
    columnName = columnName + '.' + nestedFieldName;
  }
  const columnData = parseValueFromData(item, columnName);
  if (columnData) {
    return `<td>${setColumnDataIntoHtmlElement(columnData, tableColumnContentTag)}</td>`;
  } else {
    return '<td></td>';
  }
};

const renderActionColumnData = (item, column, innerActionChildren) => {
  const tdElement = document.createElement('div');
  Object.values(innerActionChildren).map((children) => {
    const actionButtonLink = children.cloneNode(true);
    const elementOrgId = children.getAttribute('id');

    if (elementOrgId) {
      const newElementId = elementOrgId + '-' + item['uuid'];
      actionButtonLink.setAttribute('id', newElementId);
      applyUserDefinedStyles(children, actionButtonLink, stylesMap);
    }

    actionButtonLink.setAttribute('data-item-id', item['uuid']);
    const fieldName = actionButtonLink.getAttribute('data-path-field-name');
    const seoName = actionButtonLink.getAttribute('data-path-field-seo');

    if (fieldName) {
      const href = actionButtonLink.getAttribute('href');
      let fieldHref = fieldName ? parseValueFromData(item, fieldName) : '';

      fieldHref = fieldHref.split(', ');
      fieldHref = fieldHref[0];

      let replaceHref = href.replace(fieldName, fieldHref);
      /**
       * Changes to replace seo
       */
      if (seoName) {
        let seoHref = seoName ? parseValueFromData(item, seoName) : '';
        seoHref = slugify(seoHref);
        replaceHref = replaceHref.replace(seoName, seoHref);
      }

      actionButtonLink.setAttribute('href', replaceHref);
    }

    tdElement.appendChild(actionButtonLink);
  });
  return tdElement.innerHTML;
};

const setAttributeInColumnData = (tableColumnContentTag) => {
  const sourceElement = tableColumnContentTag.cloneNode(true);
  let orgTableColumnContentTagId = tableColumnContentTag.getAttribute('id');
  orgTableColumnContentTagId = orgTableColumnContentTagId ? orgTableColumnContentTagId : uuidv4();
  applyUserDefinedStyles(sourceElement, tableColumnContentTag, stylesMap);
  if (tableColumnContentTag.hasAttribute('data-org-id')) {
    tableColumnContentTag.setAttribute(
      'id',
      tableColumnContentTag.getAttribute('data-org-id') + '-' + uuidv4(),
    );
  } else {
    tableColumnContentTag.setAttribute('id', orgTableColumnContentTagId + '-' + uuidv4());
    tableColumnContentTag.setAttribute('data-org-id', orgTableColumnContentTagId);
  }
  return tableColumnContentTag;
};
