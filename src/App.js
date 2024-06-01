import React, { Component, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './assets/scss/style.scss'

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))

// Pages
const Login = React.lazy(() => import('./views/auth/login/Login'))
const Register = React.lazy(() => import('./views/auth/register/Register'))
const Page404 = React.lazy(() => import('./views/auth/page404/Page404'))
const Page500 = React.lazy(() => import('./views/auth/page500/Page500'))

import PrintBillingTelkomsel from './views/billing_telkomsel/transactions/Print'
import PrintServiceRequest from './views/service_request/transactions/Print'


class App extends Component {
  render() {
    return (
      <BrowserRouter>
        <Suspense fallback={loading}>
          <Routes>
            <Route exact path="/login" name="Login Page" element={<Login />} />
            <Route exact path="/register" name="Register Page" element={<Register />} />
            <Route exact path="/404" name="Page 404" element={<Page404 />} />
            <Route exact path="/500" name="Page 500" element={<Page500 />} />
            <Route path="*" name="Home" element={<DefaultLayout />} />

            {/* Print */}
            <Route exact path="/bt/invoice/:id" name="Billing Telkomsel Invoice" element={<PrintBillingTelkomsel />} />
            <Route exact path="/sr/print/:id" name="Billing Telkomsel Invoice" element={<PrintServiceRequest />} />

          </Routes>
        </Suspense>
      </BrowserRouter>
    )
  }
}

export default App
