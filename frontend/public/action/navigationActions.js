const goToPage = (args) => {
  const {
    parameters: { sendCurrentObjectID, destination },
    response,
  } = args;

  let urlToRedirect = destination;

  if (sendCurrentObjectID && (sendCurrentObjectID == true || sendCurrentObjectID === 'true')) {
    if (response && response !== 'undefined') {
      const { data, config } = response;
      let collectionName = config.url;
      collectionName = collectionName.split('collection-form/')[1];
      collectionName = collectionName.split('/items')[0];
      const collectionItemId = data.uuid;
      urlToRedirect += `/${collectionName}/${collectionItemId}`;
    }
  }
  window.location = urlToRedirect;
};
