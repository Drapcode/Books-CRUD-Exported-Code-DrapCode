

const addMarkerInfo = (itemData, map, fieldLat, fieldLong, fieldHeader, fieldDescription) => {
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

const clearInfoClickReference = (infoClickObject) => {
  infoClickObject.map((obj) => {
    obj.set('marker', null);
    obj.close();
  });
};
