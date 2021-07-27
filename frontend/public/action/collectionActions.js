const saveCollection = async (args) => {
  // const data = getFormDataOfElement(args.element);
  const data = serializeFormData(args.element.elements);
  let form = args.element;
  const { constructor, collectionRequest } = args.parameters;

  const isSecuredCall = !collectionRequest || collectionRequest === 'Open' ? false : true;

  let endpoint = form.getAttribute('action');
  let method = form.getAttribute('method');
  endpoint = endpoint + '/constructor/' + constructor;
  console.log('endpoint', endpoint, method);
  let response = {};
  try {
    if (isSecuredCall) {
      response.data = await securedPostCall(data, endpoint);
    } else {
      endpoint = 'open/' + endpoint;
      response.data = await unSecuredPostCall(data, endpoint);
    }
    response.status = 'success';
    resetCollectionForm(form);
  } catch (error) {
    console.log('Error: ', error.response);
    if (error.response) {
      response.data = error.response;
      response.status = 'error';
    }
  }
  return response;
};


const updateCollection = async (args) => {
  const data = serializeFormData(args.element.elements);
  let form = args.element;

  const { collectionRequest } = args.parameters;
  const isSecuredCall = !collectionRequest || collectionRequest === 'Open' ? false : true;

  let endpoint = form.getAttribute('action');
  const method = form.getAttribute('method');

  let alertMessageDiv = form.getElementsByClassName('alert-message')[0];
  let successMessageDiv = form.getElementsByClassName('success-message')[0];
  let response = {};
  try {
    if (isSecuredCall) {
      response.data = await securedPutCall(data, endpoint);
    } else {
      endpoint = 'open/' + endpoint;
      response.data = await unSecuredPutCall(data, endpoint);
    }
    if (response.data && response.data.data && response.data.data.uuid) {
      const sessionStorage = window.sessionStorage;
      const keyOfItemToUpdate = 'itemData' + response.data.data.uuid;
      sessionStorage.setItem(keyOfItemToUpdate, JSON.stringify(response.data.data));
    }
    response.status = 'success';
  } catch (error) {
    console.log('Error ', error);
    if (error.response) {
      response.data = error.response;
      response.status = 'error';
    }
  }
  return response;
};

const deleteCollectionItem = async (args) => {
  const itemId = args.targetElement.getAttribute('data-item-id');
  const {
    collection: collectionName,
    confirmationMessage,
    successMessage,
    collectionRequest,
  } = args.parameters;

  const isSecuredCall = !collectionRequest || collectionRequest === 'Open' ? false : true;

  let response = {};
  await Swal.fire({
    text: confirmationMessage || 'Are you sure about deleting this item?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ff0055',
    cancelButtonColor: '#999999',
    reverseButtons: true,
    focusConfirm: false,
    focusCancel: true,
  }).then(async (willDelete) => {
    if (willDelete.isConfirmed) {
      let endpoint = `collection-form/${collectionName}/items/${itemId}`;
      try {
        if (isSecuredCall) {
          response.data = await securedDeleteCall(endpoint);
        } else {
          endpoint = 'open/' + endpoint;
          response.data = await unSecuredDeleteCall(endpoint);
        }

        if (response.data.status === 200) {
          await Swal.fire('', successMessage || 'Poof! Your item been deleted!', 'success').then(
            async (willDelete) => {},
          );
        }
        response.status = 'success';
      } catch (error) {
        console.log('Error: ', error);
        if (error.response) {
          response.data = error.response;
          response.status = 'error';
          Swal.fire('', 'This item could not be deleted right now.', 'error');
        }
      }
    } else {
      response.status = 'error';
    }
  });
  return response;
};

const resetTextArea = (form) => {
  let textarea = $(form).find('.textarea');
  let isTextareaFieldExist = textarea.length;
  if (isTextareaFieldExist) {
    textarea.each(function () {
      let input = $(this);
      //Checking to show/hide WYSIWYG Editor
      let showTextEditor = input[0].hasAttribute('data-show-editor');
      if (showTextEditor) {
        input.summernote('reset');
      }
    });
  }
};

const resetCollectionForm = (form) => {
  form.reset();
  Array.from(form.getElementsByClassName('file-list-display')).forEach(function (e) {
    e.innerHTML = 'Select file';
  });
  $(form)
    .find(
      'input[type=hidden] :not([data-form-element-collection]) , input[type=hidden] :not([data-form-element-session])',
    )
    .each(function () {
      this.value = '';
    });
  $(form).find('.select').val('').trigger('change');
  resetTextArea(form);
};




