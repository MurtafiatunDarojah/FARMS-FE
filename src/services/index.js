import { farms_backend } from "../config/api-config";
import Post from "./axios/post";
import Get from "./axios/get";
import Put from "./axios/put";
import axios from "axios";
const createUrl = (path) => `${farms_backend.endpoint}${path}`;

// Get Data Talenta
const getEmployeeTalentaByEmployeeId = (header, data) => Get(
    `${farms_backend.endpoint}/api/talenta/employee?employee_id=${data}`,
    header
)

const getEmployeeTalentaByBranch = (header, data) => Get(
    `${farms_backend.endpoint}/api/talenta/employee/branch?branch_id=${data}`,
    header
)

// AUTH
const Roles = (header, data) => Post(createUrl("/api/dashboard/roles"), header, data);

// Access Management
const ListUsers = (header, data) => Get(createUrl("/api/access/users"), header, data);
const CreateUser = (header, data) => Post(createUrl("/api/access/users"), header, data);
const DetailUser = (header, data) => Get(createUrl(`/api/access/users/${data}`), header, data);
const UpdateUser = (header, data, id) => Put(createUrl(`/api/access/users/${id}`), header, data);
const ListForms = (header, data) => Get(createUrl("/api/access/forms"), header, data);
const CreateForm = (header, data) => Post(createUrl("/api/access/forms"), header, data);
const DetailForm = (header, data) => Get(createUrl(`/api/access/forms/${data}`), header, data);
const UpdateForm = (header, data, id) => Put(createUrl(`/api/access/forms/${id}`), header, data);

// TIMESHEET
const ListTimesheet = (header, data) => Get(createUrl(`/api/dashboard/timesheet/list?dateFrom=${data.dateFrom}&company_id=${data.company_id}`), header);
const ViewTimesheet = (header, data) => Get(createUrl(`/api/dashboard/timesheet/view?_id=${data}`), header);
const ApprovedTS = (header, data) => Post(createUrl("/api/dashboard/timesheet/approve"), header, data);
const RejectTS = (header, data) => Post(createUrl("/api/dashboard/timesheet/reject"), header, data);
const UpdateTS = (header, data) => Post(createUrl("/api/dashboard/timesheet/update"), header, data);

// TRAVEL AUTHORITY
const ListTravelAuthority = (header, data) => Get(createUrl(`/api/dashboard/travel-authority?date=${data}`), header, data);
const viewTA = (header, data) => Get(createUrl(`/api/dashboard/travel-authority/view?record_id=${data}`), header)
const CompleteTA = (header, data) => Post(createUrl(`/api/dashboard/travel-authority/complete-data`), header, data)
const AddDeparture = (header, data) => Put(createUrl("/api/dashboard/travel-authority/add-departure"), header, data)
const TravelAuthorityClosed = (header, data) => Post(createUrl("/api/dashboard/travel-authority/closed"), header, data)
const approvedByDeputy = (header, data) => Post(createUrl("/api/dashboard/travel-authority/approved-deputy"), header, data)
const CompleteTAReturn = (header, data) => Post(createUrl(`/api/dashboard/travel-authority/complete-data-return`), header, data)


// BILLING TELKOMSEL
const ListBillingTelkomsel = (header, data) => Get(createUrl("/api/access/billing/telkomsel"), header, data);
const ViewBillingTelkomsel = (header, data) => Get(createUrl(`/api/access/billing/telkomsel/detail?periode_upload=${data}`), header);
const UploadBillingTelkomsel = (header, data) => Post(createUrl("/api/access/billing/telkomsel"), header, data);
const ApplyToApproval = (header, data) => Post(createUrl("/api/access/billing/telkomsel/apply-approval"), header, data);
const ListMasterBillingTelkomsel = (header, data) => Get(createUrl("/api/access/billing/telkomsel/master"), header, data);
const ViewMasterBillingTelkomsel = (header, data) => Get(createUrl(`/api/access/billing/telkomsel/master/id?id=${data}`), header);
const UpdateMasterBillingTelkomsel = (header, data) => Put(createUrl("/api/access/billing/telkomsel/master"), header, data);
const CreateMasterBillingTelkomsel = (header, data) => Post(createUrl("/api/access/billing/telkomsel/master"), header, data);

// SERVICE REQUEST
const ServiceRequestClosed = (header, data) => Post(createUrl("/api/access/service-request/close"), header, data);
const ServiceRequestLink = (header, data) => Get(createUrl("/api/access/service-request"), header, data);
const ServiceRequestView = (header, data) => Get(createUrl(`/api/access/service-request/view?_id=${data}`), header);
const ServiceRequestApps = (header, data) => Get(createUrl("/api/access/service-request/applications"), header, data);
const ServiceITApproval = (header, data) => Post(createUrl("/api/access/service-request/it-approval"), header, data);

// HAZARD INFORMATION AND SUGGESTION
const ListHias = (header, _) => Get(createUrl("/api/access/hias/list"), header);
const ViewHias = (header, data) => Get(createUrl("/api/access/hias/detail?id=" + data), header, data);
//delete

export const DeleteHias = async (accessToken, id) => {
    try {
      const response = await axios.delete(`/api/access/hias/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data; // Mengembalikan respons dari server setelah penghapusan berhasil
    } catch (error) {
      throw error; // Melempar error jika terjadi masalah saat menghapus data Hias
    }
  };
  

// Working Permit
const ListWorkingPermit = (header, data) => Get(createUrl(`/api/dashboard/wp/monitor?startDate=${data.startDate}&endDate=${data.endDate}`), header);

// Fuel
const ListOperator = (header, _) => Get(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/operator`, header);
const CreateOperator = (header, data) => Post(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/operator/register`, header, data);
const GetOperator = (header, id) => Get(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/operator/${id}`, header);
const UpdateOperator = (header, data) => Put(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/operator`, header, data);

const ListJobLocations = (header) => Get(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/job-locations`, header);
const CreateJobLocation = (header, data) => Post(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/job-locations`, header, data);
const GetJobLocation = (header, id) => Get(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/job-locations/${id}`, header);
const UpdateJobLocation = (header, data) => Put(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/job-locations`, header, data);

const ListEquipmentActivities = (header) => Get(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/equipment-activities`, header);
const GetEquipmentActivity = (header, id) => Get(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/equipment-activities/${id}`, header);
const CreateEquipmentActivity = (header, data) => Post(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/equipment-activities`, header, data);
const UpdateEquipmentActivity = (header, data) => Put(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/equipment-activities`, header, data);
// const DeleteEquipmentActivity = (header, id) => Delete(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/equipment-activities/${id}`, header);

const ListEquipment = (header, _) => Get(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/equipment`, header);
const Equipment = (header, id) => Get(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/equipment/${id}`, header);

const UpdateEquipment = (header, data) => Put(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/equipment`, header, data);
const CreateEquipment = (header, data) => Post(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/equipment`, header, data);
const HistoryRequestFuel = (header, data) => Get(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/requests?startDate=${data.startDate}&endDate=${data.endDate}`, header, data)
const HistoryRequestDelivery = (header, data) => Get(`${process.env.REACT_APP_BACKEND_ENDPOINT_FMS}/api/delivery?startDate=${data.startDate}&endDate=${data.endDate}`, header, data)

// User Activity
const GetMostUsedService = (header, data) => Get(createUrl(`/api/access/dashboard/most-used-activity`), header, data)
const GetMostMethodRequest = (header, data) => Get(createUrl(`/api/access/dashboard/most-method-request`), header, data)
const GetMostOsRequest = (header, data) => Get(createUrl(`/api/access/dashboard/most-os-request`), header, data)
const GetMostBrowserRequest = (header, data) => Get(createUrl(`/api/access/dashboard/most-browser-request`), header, data)
const GetMostUserRequest = (header, data) => Get(createUrl(`/api/access/dashboard/most-user-request`), header, data)
const GetMostUnitRequest = (header, data) => Get(createUrl(`/api/access/dashboard/most-unit-request`), header, data)
const GetActivityUsers = (header, data) => Get(createUrl(`/api/access/dashboard/activity-user`), header, data)
const GetTrafficRequest = (header, data) => Get(createUrl(`/api/access/dashboard/activity-traffic`), header, data)



const API = {

    // User Activity    
    GetMostOsRequest,
    GetActivityUsers,
    GetMostUsedService,
    GetMostUnitRequest,
    GetMostUserRequest,
    GetMostMethodRequest,
    GetMostBrowserRequest,
    GetTrafficRequest,

    // AUTH
    Roles,

    // ACCESS MANAGEMENT
    ListUsers,
    CreateUser,
    DetailUser,
    UpdateUser,

    ListForms,
    CreateForm,
    DetailForm,
    UpdateForm,

    // TIMESHEET
    ListTimesheet,
    ViewTimesheet,
    ApprovedTS,
    RejectTS,
    UpdateTS,

    // BILLING TELKOMSEL
    ListBillingTelkomsel,
    ViewBillingTelkomsel,
    UploadBillingTelkomsel,
    ListMasterBillingTelkomsel,
    ViewMasterBillingTelkomsel,
    UpdateMasterBillingTelkomsel,
    CreateMasterBillingTelkomsel,
    ApplyToApproval,

    // SERVICE REQUEST
    ServiceRequestClosed,
    ServiceRequestLink,
    ServiceRequestView,
    ServiceRequestApps,
    ServiceITApproval,

    // TRAVEL AUTHORITY
    TravelAuthorityClosed,
    ListTravelAuthority,
    CompleteTAReturn,
    viewTA, CompleteTA,
    approvedByDeputy,
    AddDeparture,

    // HAZARD INFORMATION AND SUGGESTION
    ListHias,
    ViewHias,

    // Working Permit
    ListWorkingPermit,

    // Fuel
    HistoryRequestDelivery,
    HistoryRequestFuel,
    CreateEquipment,
    UpdateEquipment,
    CreateOperator,
    UpdateOperator,
    ListEquipment,
    ListOperator,
    GetOperator,
    UpdateJobLocation,
    CreateJobLocation,
    ListJobLocations,
    GetJobLocation,

    UpdateEquipmentActivity,
    CreateEquipmentActivity,
    ListEquipmentActivities,
    GetEquipmentActivity,

    Equipment,

    //Talenta
    getEmployeeTalentaByEmployeeId,
    getEmployeeTalentaByBranch
};

export default API;
