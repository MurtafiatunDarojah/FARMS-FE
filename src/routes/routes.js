import ViewBillingTelkomsel from '../views/billing_telkomsel/transactions/View'
import ListBillingTelkomsel from '../views/billing_telkomsel/transactions/List'
import ListMasterBilling from '../views/billing_telkomsel/master/List'
import CreateMaster from '../views/billing_telkomsel/master/Create'
import ViewMaster from '../views/billing_telkomsel/master/View'

import ViewTimesheet from '../views/timesheet/View/View'
import ListTimesheet from '../views/timesheet/List/List'

import ListServiceRequest from '../views/service_request/transactions/List'
import ViewServiceRequest from '../views/service_request/transactions/View'

import ListTravelAuthority from 'src/views/travel_authority/List'
import ViewTA from 'src/views/travel_authority/View'

import ListHias from 'src/views/hias/List'
import ViewHias from 'src/views/hias/View'


import ListWorkingPermit from 'src/views/working_permit/List'
import CreateEquipment from 'src/views/fuel_system/equipments/Create'
import ViewEquipment from 'src/views/fuel_system/equipments/View'
import ListEquipment from 'src/views/fuel_system/equipments/List'
import ListFuelRequest from 'src/views/fuel_system/fuel_request/List'
import ListFuelDelivery from 'src/views/fuel_system/delivery_request/List'
import CreateOperator from 'src/views/fuel_system/operators/Create'
import ViewOperator from 'src/views/fuel_system/operators/View'

import CreateUser from 'src/views/access_management/user/Create'
import ListUsers from 'src/views/access_management/user/List'

import ListForm from 'src/views/access_management/form/List'
import CreateForm from 'src/views/access_management/form/Create'
import ListOperator from 'src/views/fuel_system/operators/List'
import Dashboard from 'src/views/dashboard/Activity'

import ListJobLocation from 'src/views/fuel_system/job_location/List'
import ViewJobLocation from 'src/views/fuel_system/job_location/View'
import CreateJobLocation from 'src/views/fuel_system/job_location/Create'

import CreateEquipmentActivity from 'src/views/fuel_system/equipment_actifvity/Create'
import ViewEquipmentActivity from 'src/views/fuel_system/equipment_actifvity/View'
import ListEquipmentActivity from 'src/views/fuel_system/equipment_actifvity/List'

const routes = [
  { path: '/' },

  { path: '/dashboard-activity', name: 'User Activity', code: '*', element: Dashboard },

  { path: '/users', name: 'Users', code: 'AM', element: ListUsers },
  { path: '/users/create', name: 'Create Users', code: 'AM', element: CreateUser },
  { path: '/users/:id', name: 'Edit Users', code: 'AM', element: CreateUser },

  { path: '/forms', name: 'Form', code: 'AM', element: ListForm },
  { path: '/form/create', name: 'Create Form', code: 'AM', element: CreateForm },
  { path: '/form/:id', name: 'Edit Form', code: 'AM', element: CreateForm },

  { path: '/timesheet', name: 'Timesheet', code: 'TS', element: ListTimesheet },
  { path: '/timesheet/view/:id', name: 'View Timesheet', code: 'TS', element: ViewTimesheet },

  { path: '/billing-telkomsel', name: 'Billing Telkomsel', code: 'BT', element: ListBillingTelkomsel },
  { path: '/billing-telkomsel/:id', name: 'View', code: 'BT', element: ViewBillingTelkomsel },

  { path: '/billing-telkomsel/master', name: 'Master', code: 'BT', element: ListMasterBilling },
  { path: '/billing-telkomsel/master/:id', name: 'View', code: 'BT', element: ViewMaster },
  { path: '/billing-telkomsel/master/create', name: 'Create', code: 'BT', element: CreateMaster },

  { path: '/service-request', name: 'Create', code: 'SR', element: ListServiceRequest },
  { path: '/service-request/:id', name: 'View', code: 'SR', element: ViewServiceRequest },

  { path: '/travel-authority', name: 'Travel Authority', code: 'TA', element: ListTravelAuthority },
  { path: '/travel-authority/:id', name: 'TA Detail', code: 'TA', element: ViewTA },

  { path: '/hias', name: 'Hias', code: 'HS', element: ListHias },
  { path: '/hias/:id', name: 'View', code: 'HS', element: ViewHias },

  { path: '/working-permit', name: 'Working Permit', code: 'WP', element: ListWorkingPermit },
  { path: '/working-permit/:id', name: 'View', code: 'WP', element: ListWorkingPermit },

  { path: '/equipment/list', name: 'Equipments', code: 'FS', element: ListEquipment },
  { path: '/equipment/:id', name: 'View', code: 'FS', element: ViewEquipment },
  { path: '/equipment', name: 'Create', code: 'FS', element: CreateEquipment },

  { path: '/operator/list', name: 'List Operator', code: 'FS', element: ListOperator },
  { path: '/operator/:id', name: 'View', code: 'FS', element: ViewOperator },
  { path: '/operator', name: 'Operator', code: 'FS', element: CreateOperator },

  { path: '/job-location/list', name: 'List Job-Location', code: 'FS', element: ListJobLocation },
  { path: '/job-location/:id', name: 'View', code: 'FS', element: ViewJobLocation },
  { path: '/job-location', name: 'Job-Location', code: 'FS', element: CreateJobLocation },

  { path: '/equipment-activity/list', name: 'List Equipment Activity', code: 'FS', element: ListEquipmentActivity },
  { path: '/equipment-activity/:id', name: 'View', code: 'FS', element: ViewEquipmentActivity },
  { path: '/equipment-activity', name: 'Equipment Activity', code: 'FS', element: CreateEquipmentActivity },

  { path: '/requests/list', name: 'Fuel Request', code: 'FS', element: ListFuelRequest },
  { path: '/delivery/list', name: 'Fuel Delivery', code: 'FS', element: ListFuelDelivery },

];

routes.forEach(route => {
  route.exact = false;
});


export default routes;
