import React from 'react'
import CIcon from '@coreui/icons-react'

import { cilAirplaneMode, cilCalendar, cilCalculator, cilAlarm, cilShieldAlt, cilDescription, cilEyedropper, cilSettings, cilChart } from '@coreui/icons'
import { CNavGroup, CNavItem } from '@coreui/react'

const nav_components = [
  {
    component: CNavGroup,
    name: 'Dashboard',
    code: '*',
    icon: <CIcon icon={cilChart} customClassName="nav-icon" />,
    items:
      [
        {
          component: CNavItem,
          name: 'User Activity',
          to: '/dashboard-activity',
        },
      ]
  },
  {
    component: CNavGroup,
    name: 'Access Management',
    code: 'AM',
    icon: <CIcon icon={cilSettings} customClassName="nav-icon" />,
    items:
      [
        {
          component: CNavItem,
          name: 'Users',
          to: '/users',
        },
        {
          component: CNavItem,
          name: 'Forms',
          to: '/forms',
        },
        //   {
        //     component: CNavItem,
        //     name: 'Permissions',
        //     to: '/',
        //   },
      ],
  },
  {
    component: CNavGroup,
    name: 'Timesheet',
    code: 'TS',
    icon: <CIcon icon={cilCalendar} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List of Timesheet',
        to: '/timesheet',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Billing Telkomsel',
    code: 'BT',
    icon: <CIcon icon={cilCalculator} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Transactions',
        to: '/billing-telkomsel',
      },
      {

        component: CNavItem,
        name: 'Master',
        to: 'billing-telkomsel/master',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Service Request',
    code: 'SR',
    icon: <CIcon icon={cilAlarm} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Request List',
        to: '/service-request',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Travel Authority',
    code: 'TA',
    icon: <CIcon icon={cilAirplaneMode} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List of travels',
        to: '/travel-authority',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'HIAS',
    code: 'HS',
    icon: <CIcon icon={cilShieldAlt} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List',
        to: '/hias',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Working Permit',
    code: 'WP',
    icon: <CIcon icon={cilDescription} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'List',
        to: '/working-permit',
      },
    ],
  },
  {
    component: CNavGroup,
    name: 'Fuel System',
    code: 'FS',
    icon: <CIcon icon={cilEyedropper} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Fuel Requests',
        to: '/requests/list',
      },
      {
        component: CNavItem,
        name: 'Fuel Delivery',
        to: '/delivery/list',
      },
      {
        component: CNavItem,
        name: 'Job Location',
        to: '/job-location/list',
      },
      {
        component: CNavItem,
        name: 'Equipments',
        to: '/equipment/list',
      },
      {
        component: CNavItem,
        name: 'Operator',
        to: '/operator/list',
      },
      {
        component: CNavItem,
        name: 'Equipment Activity',
        to: '/equipment-activity/list',
      },
    ],
  },
];

export default nav_components;
