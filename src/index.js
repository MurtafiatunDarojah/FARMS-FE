import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./config/api-config";

import 'antd/dist/antd.min.css';
import 'react-app-polyfill/stable';
import 'core-js';

import reportWebVitals from './reportWebVitals';
import store from './redux/store';
import App from './App';

const msalInstance = new PublicClientApplication(msalConfig);

ReactDOM.render(
  <Provider store={store}>
    <MsalProvider instance={msalInstance}>
      <App />
    </MsalProvider>
  </Provider>,
  document.getElementById('root')
);

reportWebVitals();
