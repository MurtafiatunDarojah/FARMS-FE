import redirectUri from './redirects';

export const msalConfig = {
  auth: {
    clientId: process.env.REACT_APP_MSAL_CLIENT_ID,
    authority: process.env.REACT_APP_MSAL_AUTHORITY,
    redirectUri: redirectUri
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["User.Read", "User.Read.All"],
};


export const graphConfig = {
  graphMeEndpoint: process.env.REACT_APP_GRAPH_ME_ENDPOINT,
};

const getActiveBackend = (environment) => {
  switch (environment) {
    case "FARGATE":
      return {
        endpoint: process.env.REACT_APP_BACKEND_ENDPOINT_FARGATE,
        api_key: process.env.REACT_APP_BACKEND_API_KEY_FARGATE,
      };
    case "EC2":
      return {
        endpoint: process.env.REACT_APP_BACKEND_ENDPOINT_EC2,
        api_key: process.env.REACT_APP_BACKEND_API_KEY_EC2,
      };
    default:
      return null;
  }
};

export const farms_backend = getActiveBackend('FARGATE');


