const showAlertMessage = function (args) {
  const previousActionResponse = args.response;
  const form = args.element;
  let alertMessageDiv = form.getElementsByClassName('alert-message')[0];
  let successMessageDiv = form.getElementsByClassName('success-message')[0];

  let response = {};
  response.data = previousActionResponse;
  if (previousActionResponse) {
    if (previousActionResponse.status === 201 || previousActionResponse.status === 200) {
      toastr.success(args.parameters.successMessage, 'Success');
      response.status = 'success';
    } else if (previousActionResponse.status === 409) {
      toastr.error(
        previousActionResponse.data || 'Validation Failed',
        `Error: ${previousActionResponse.status}`,
      );
      response.status = 'error';
    } else if (previousActionResponse.status === 404) {
      toastr.error(
        previousActionResponse.data.error || 'This collection does not found',
        `Error: ${previousActionResponse.status}`,
      );
      response.status = 'error';
    } else if (previousActionResponse.status === 403) {
      toastr.error(
        args.parameters.errorMessage || 'Forbidden Access',
        `Error: ${previousActionResponse.status}`,
      );
      response.status = 'error';
    } else {
      toastr.error(
        previousActionResponse.data.error || 'Some Internal error',
        `Error: ${previousActionResponse.status}`,
      );
      response.status = 'error';
    }
  } else {
    toastr.error('Sorry,We are not able get response from previos actions', 'Error');
    response.status = 'error';
  }
  return response;
};
