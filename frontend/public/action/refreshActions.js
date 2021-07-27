const refreshSection = async function (args) {
  let refreshComponent = args.parameters.refreshComponent;
  let refreshComponentType = refreshComponent.split(':')[0];
  let refreshComponentId = refreshComponent.split(':')[1];

  const element = document.getElementById(refreshComponentId);

  if (
    element &&
    element.attributes.getNamedItem('data-js') &&
    element.attributes['data-js'].value === refreshComponentType
  ) {
    let paginationData = {};
    let dataTablePaginationData = {};

    if (paginationDataMap.get('pdata_' + refreshComponentId)) {
      paginationData = paginationDataMap.get('pdata_' + refreshComponentId);
    }
    if (dataTablePaginationDataMap.get('ptdata_' + refreshComponentId)) {
      dataTablePaginationData = dataTablePaginationDataMap.get('ptdata_' + refreshComponentId);
    }

    if (paginationData && typeof paginationData.replacedElement !== 'undefined') {
      let orgNumberPerPage = paginationData.numberPerPage;
      let orgCurrentPage = paginationData.currentPage;

      modifyPaginationDataForRefresh(paginationData);
      loadGroupData(paginationData);
      resetPaginationData(paginationData, orgNumberPerPage, orgCurrentPage);
    }

    if (dataTablePaginationData && typeof dataTablePaginationData.dataTable !== 'undefined') {
      loadDataList(dataTablePaginationData);
    }
  }
};

modifyPaginationDataForRefresh = async function (paginationData) {
  paginationData.numberPerPage = paginationData.currentPage * paginationData.numberPerPage;
  paginationData.currentPage = 1;

  const placeholderItem = createContentPlaceholder(
    paginationData.replacedElement.childElementCount || 1,
    paginationData.dataGroupChildren[0].id,
    paginationData.dataGroupChildren[0].className,
  );
  paginationData.replacedElement.innerHTML = placeholderItem;
};
resetPaginationData = async function (paginationData, orgNumberPerPage, orgCurrentPage) {
  paginationData.numberPerPage = orgNumberPerPage;
  paginationData.currentPage = orgCurrentPage;
};
