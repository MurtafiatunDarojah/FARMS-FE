import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";

import { Route, Routes } from 'react-router-dom'
import { useDispatch } from 'react-redux'

import { loginRequest } from "src/config/api-config";
import { callMsGraph } from "src/utils/graph";

import { CContainer, CSpinner } from '@coreui/react'

import React, { Suspense, useEffect } from 'react'
import { useSelector } from 'react-redux'

// routes config
import routes from '../routes/routes'

// API 
import HeaderFarms from "src/utils/header_farms";
import API from "src/services";

import { Report } from "notiflix";

const AppContent = () => {

  const session = useSelector((state) => state.session)

  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const dispatch = useDispatch()

  async function RequestToken() {
    try {
      const request = {
        ...loginRequest,
        account: accounts[0],
      };

      const responseToken = await instance.acquireTokenSilent(request);

      // GetMail
      const response = await callMsGraph(responseToken.accessToken);

      await getRoles(response.mail, responseToken.accessToken);

    } catch (e) {
      // Handle errors
      console.error(e);
    }
  }

  async function getRoles(email, token) {
    try {

      const res = await API.Roles(HeaderFarms(token), {
        email
      });

      dispatch({ type: 'set', session: res });
    } catch (e) {

      console.error(e)

      if (e.response?.status === 404) {
        Report.warning(
          'User Not Found',
          'User yang dimasukan belum terdaftar',
        )
      } else if (e.response?.status === 403) {
        Report.warning(
          'Need Admin Role',
          'Maaf anda tidak berhak masuk ke halaman ini',
        )

      } else {
        Report.warning(
          'Terjadi Kesalahan',
          'Server sedang down',
        )
      }
    }
  }

  useEffect(() => {

    if (inProgress === InteractionStatus.None && accounts.length === 0) {
      instance.loginRedirect(loginRequest);
    }

    if (isAuthenticated) {
      RequestToken()
    }

  }, [isAuthenticated])

  return (
    // <CContainer >
    <Suspense fallback={<CSpinner color="primary" />}>
      <Routes>
        {routes.map((route, idx) => {
          if (session) {
            if (session.access_permission && session.access_permission.find(a => a.code === route.code || route.code === "*")) {
              return (
                route.element && (
                  <Route
                    key={idx}
                    path={route.path}
                    exact={route.exact}
                    name={route.name}
                    element={<route.element />}
                  />
                )
              )
            }
          }
        })}
      </Routes>
    </Suspense>
    // </CContainer>
  )
}

export default React.memo(AppContent)
