const SERVER_URL = getBackendServerUrl();
let localStorage = window.localStorage;

const getHeaderForSeverForSecuredRequest = () => {
  const accessToken = localStorage.getItem('token');
  const projectId = localStorage.getItem('projectId');
  return {
    headers: {
      'Content-Type': 'application/json',
      'x-project-id': projectId,
      authorization: accessToken,
    },
  };
};
const getHeaderForServerForPublicRequest = () => {
  const projectId = localStorage.getItem('projectId');
  const accessToken = localStorage.getItem('token');
  if (accessToken) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-project-id': projectId,
        authorization: accessToken,
      },
    };
  } else {
    return {
      headers: {
        'Content-Type': 'application/json',
        'x-project-id': projectId,
      },
    };
  }
};
const headerMultipartFormDataForSecuredRequest = () => {
  const accessToken = localStorage.getItem('token');
  const projectId = localStorage.getItem('projectId');
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
      'x-project-id': projectId,
      authorization: accessToken,
    },
  };
};
const headerMultipartFormDataForPublicRequest = () => {
  return {
    headers: {
      'Content-Type': 'multipart/form-data',
      'x-hostname': window.location.hostname,
    },
  };
};
const headerJsonDataForPublicRequest = () => {
  return {
    headers: {
      'Content-Type': 'application/json',
      'x-hostname': window.location.hostname,
    },
  };
};
const publicPostCall = async (data, endpoint) => {
  const header = headerJsonDataForPublicRequest();
  return await axios.post(getBackendServerUrl() + endpoint, data, header);
};
const publicGetCall = async (endpoint) => {
  try {
    const header = headerJsonDataForPublicRequest();
    return await axios.get(getBackendServerUrl() + endpoint, header);
  } catch (error) {
    if (error.response) {
      let { status } = error.response;
      if (status == 401 && endpoint.includes('finder')) {
        let isCount = endpoint.includes('count');
        return { data: isCount ? 0 : [], _$isPrivateFilter: true };
      }
    }
    throw Error(error);
  }
};
const unSecuredPostCall = async (data, endpoint) => {
  const header = getHeaderForServerForPublicRequest();
  return await axios.post(SERVER_URL + endpoint, data, header);
};
const securedPostCall = async (data, endpoint) => {
  const header = getHeaderForSeverForSecuredRequest();
  return await axios.post(SERVER_URL + endpoint, data, header);
};
const securedGetCall = async (endpoint) => {
  try {
    const header = getHeaderForSeverForSecuredRequest();
    return await axios.get(SERVER_URL + endpoint, header);
  } catch (error) {
    if (error.response) {
      let { status } = error.response;
      if (status == 401 && endpoint.includes('finder')) {
        let isCount = endpoint.includes('count');
        return { data: isCount ? 0 : [], _$isPrivateFilter: true };
      }
    }
    throw Error(error);
  }
};
const securedPutCall = async (data, endpoint) => {
  const header = getHeaderForSeverForSecuredRequest();
  return axios.put(SERVER_URL + endpoint, data, header);
};
const unSecuredPutCall = async (data, endpoint) => {
  const header = getHeaderForServerForPublicRequest();
  return axios.put(SERVER_URL + endpoint, data, header);
};
const securedDeleteCall = async (endpoint) => {
  const header = getHeaderForSeverForSecuredRequest();
  return axios.delete(SERVER_URL + endpoint, header);
};
const unSecuredDeleteCall = async (endpoint) => {
  const header = getHeaderForServerForPublicRequest();
  return axios.delete(SERVER_URL + endpoint, header);
};
const multipartFormDataPublicCall = async (data, endpoint) => {
  const header = headerMultipartFormDataForPublicRequest();
  return await axios.post(SERVER_URL + endpoint, data);
};
const multipartFormDataSecuredCall = async (data, endpoint) => {
  const header = headerMultipartFormDataForPublicRequest();
  return await axios.post(SERVER_URL + endpoint, data, header);
};
const getCall = async (endpoint) => {
  const header = getHeaderForSeverForSecuredRequest();
  return await axios.get(SERVER_URL + endpoint, header);
};
