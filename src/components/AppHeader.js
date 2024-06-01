import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderBrand,
  CHeaderDivider,
  CHeaderNav,
  CHeaderToggler,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'

import { AppBreadcrumb } from './index'
import logo from 'src/assets/brand/logo.png'
import { useMsal } from "@azure/msal-react";

const AppHeader = () => {
  const dispatch = useDispatch()
  const session = useSelector((state) => state.session)
  const sidebarShow = useSelector((state) => state.sidebarShow)
  const { instance } = useMsal();

  function handleLogout(instance) {
    instance.logoutRedirect().catch(e => {
      console.error(e);
    });
  }

  return (
    <CHeader position="sticky" className="mb-4">
      <CContainer fluid>
        <CHeaderToggler
          className="ps-1"
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>
        <CHeaderBrand to="/">
          <img src={logo} height={50} alt="Logo" />
        </CHeaderBrand>
        <CHeaderNav className="d-none d-md-flex me-auto">

        </CHeaderNav>
        <CHeaderNav className="ms-3" onClick={() => {
          localStorage.setItem('session', null)
          handleLogout(instance)
        }}>
          <span className="ms-1">{session && session.fullname}</span>
        </CHeaderNav>
      </CContainer>
      <CHeaderDivider />
      <CContainer fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
