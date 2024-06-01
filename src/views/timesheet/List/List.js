import { DataGrid, GridToolbarFilterButton } from '@mui/x-data-grid';
import { CCard, CCardHeader, CCardBody } from '@coreui/react'
import { Button, DatePicker, Form, Popover } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import "gridjs/dist/theme/mermaid.css";
import { Report } from 'notiflix';
import moment from 'moment';

import HeaderFarms from 'src/utils/header_farms'
import API from 'src/services'
import './styles.css'

let XLSX = require("xlsx");

const ListTimesheet = () => {

  const [resultFilterDetail, setResultFilterDetail] = useState(null);
  const [timesheetList, setTimesheetList] = useState([])
  const [exportTSList, setExportTSList] = useState([])
  const [periode, setPeriode] = useState('')
  const [open, _] = useState(false);
  const dispatch = useDispatch()

  const session = useSelector((state) => state.session)

  let navigate = useNavigate();

  const onExportExcel = () => {


    let wb = XLSX.utils.book_new()
    let ws = XLSX.utils.json_to_sheet(exportTSList)

    var wscols = [
      { wch: 6 },
      { wch: 16 },
      { wch: 30 },
      { wch: 16 },
      { wch: 16 },
      { wch: 30 },
      { wch: 30 },
      { wch: 30 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
      { wch: 10 },
    ];

    ws['!cols'] = wscols;

    console.log(periode)

    XLSX.utils.book_append_sheet(wb, ws, moment(periode, 'YYYY-MM').format('YYYY-MM'))


    XLSX.writeFile(wb, moment(periode, 'YYYY-MM').format('YYYY-MM') + ".xlsx")
  }

  const getListTimeSheet = () => {

    let changeMonth = new Date(
      new Date(periode).setMonth(new Date(periode).getMonth() - 1)
    );

    API.ListTimesheet(HeaderFarms(session.accessToken), {
      dateFrom: moment(changeMonth).format("YYYY-MM"),
      company_id: session.company._id
    }).then(res => {

      let data_transfer = []
      let data_transfer_export = []

      res.data.forEach((item, index) => {

        if (item.direct_spv.length > 0) {
          data_transfer.push({
            id: index,
            fullname: item.fullname,
            nik: item.nik,
            phone_number: item.phone_number,
            department: item.department ? item.department.code : '',
            direct_spv: item.direct_spv[0].fullname,
            day_count: item.timesheet.day_count,
            total_work: item.timesheet.total_work,
            total_site: item.timesheet.total_site,
            total_sick: item.timesheet.total_sick,
            total_leave: item.timesheet.total_leave,
            total_home_base: item.timesheet.total_home_base,
            total_permit: item.timesheet.total_permit,
            approval_process_id: item.timesheet.approval_process_id.status || 'Not yet',
            level: item.level?.fullname,
            ts_id: item.timesheet._id
          })

          data_transfer_export.push({
            'No': index,
            'Status': item.timesheet.approval_process_id?.status || 'Not yet',
            'Fullname': item.fullname,
            'NIK': item.nik,
            'Level': item.level?.fullname,
            'Phone Number': item.phone_number,
            'Division': item.department ? item.department.code : '',
            'Superior': item.direct_spv[0].fullname,
            'Total Day': item.timesheet.day_count,
            'Total Work': item.timesheet.total_work,
            'Home Base': item.timesheet.total_home_base,
            'Site / Unit': item.timesheet.total_site,
            'Sick': item.timesheet.total_sick,
            'Leave': item.timesheet.total_leave,
            'Permit': item.timesheet.total_permit,
          })
        }

      });

      setExportTSList(data_transfer_export)
      setTimesheetList(data_transfer)

      dispatch({ type: 'setListTSPeriode', listTSPeriode: res.data })

    }).catch(err => {
      console.error(err)
      if (err.response?.status === 401) {
        dispatch({ type: 'set', session: null })
        navigate('/login')
      } else if (err.response?.status === 403) {
        navigate('/')
        Report.warning(
          "Oops.. anda tidak berhak masuk ke halaman",
          err.message,
          "Okay"
        );
      } else {
        Report.warning(
          "Oops.. something wrong",
          err.message,
          "Okay"
        );
      }
    })
  }

  const handleOpenDetail = (id, model) => {
    API.ViewTimesheet(HeaderFarms(session.accessToken), id).then((res => {
      detailAbsence(res.data, model)
      return
    })).catch((err) => {
      console.error(err)
      if (err.response.status === 401) {
        dispatch({ type: 'set', session: null })
        navigate('/login')
      } else {
        Report.warning(
          "Oops.. something wrong",
          "Sorry, this application is experiencing problems",
          "Okay"
        );
      }
    })
  };

  const detailAbsence = (data, model) => {
    let filter = []

    let dataTS = data ? (data.details_old.length > 0 ? data.details_old : data.details) : []

    switch (model) {
      case 'site':
        dataTS.forEach(item => {
          if (item.ts_loc_dtl && item.ts_loc_dtl != data.uid.company.code) {
            filter.push(item)
          }
        })
        setResultFilterDetail(filter)
        break;
      case 'sick':
        dataTS.forEach(item => {
          if (item.ts_reason_dtl == 'SICK') {
            filter.push(item)
          }
        })
        setResultFilterDetail(filter)
        break;
      case 'leave':
        dataTS.forEach(item => {
          if (item.ts_reason_dtl == 'LEAVE') {
            filter.push(item)
          }
        })
        setResultFilterDetail(filter)
        break;
      case 'permit':
        dataTS.forEach(item => {
          if (item.ts_reason_dtl == 'PERMIT') {
            filter.push(item)
          }
        })
        setResultFilterDetail(filter)
        break;
      default:

        filter = []
    }

    return (
      <>
        <table style={{ fontSize: 10 }}>
          <thead>
            <tr>
              <th>No</th>
              <th>Date</th>
              <th>Presence</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {
              resultFilterDetail && resultFilterDetail.map((item, index) => {
                return (
                  <tr>
                    <td>{index + 1}</td>
                    <td>{moment(new Date(item.ts_date_dtl)).format('dddd')} - {item.ts_date_dtl}</td>
                    <td>{item.ts_loc_dtl || '-'}</td>
                    <td>{item.ts_note_dtl || '-'}</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </>
    )
  }

  const columns = [
    // {
    //   field: 'nik',
    //   headerName: 'NIK',
    //   width: 100,
    //   editable: true,
    // },
    // {
    //   field: 'direct_spv',
    //   headerName: 'Superior',
    //   width: 160,
    // },
    // {
    //   field: 'level',
    //   headerName: 'Level',
    //   width: 110,
    // },
    // {
    //   field: 'phone_number',
    //   headerName: 'Phone Number',
    //   description: 'This column has a value getter and is not sortable.',
    //   sortable: false,
    //   width: 160,
    // },
    // {
    //   field: 'division',
    //   headerName: 'Division',
    //   width: 160,
    // },
    // { field: 'id', headerName: 'No', width: 50 },
    {
      field: 'fullname',
      headerName: 'Fullname',
      width: 180,

    },
    {
      field: 'ts_id', headerName: 'Action', width: 90,
      renderCell: (data) => {
        if (data.row.ts_id) {
          return <Button onClick={() => {
            navigate('/timesheet/view/' + data.row.ts_id)
          }}>View</Button>
        }
      }
    },
    {
      field: 'day_count',
      headerName: 'Total Day',
      width: 80,
    },
    {
      field: 'total_work',
      headerName: 'Total Presence',
      width: 100,
    },
    {
      field: 'total_home_base',
      headerName: 'Home Base',
      width: 82,
    },
    {
      field: 'total_site',
      headerName: 'Site / Unit',
      width: 70,
      renderCell: (data) => {
        return (
          <>
            <Popover
              content={detailAbsence}
              title="Site / Unit"
              trigger="click"
              open={open}
              placement="right"
              onClick={() => handleOpenDetail(data.row.ts_id, 'site')}
            >
              <Button type="link">{data.row.total_site}</Button>
            </Popover>
          </>
        )
      }
    },
    {
      field: 'total_sick',
      headerName: 'Sick',
      width: 70,
      renderCell: (data) => {
        return (
          <>
            <Popover
              content={detailAbsence}
              title="Sick"
              trigger="click"
              open={open}
              placement="right"
              onClick={() => handleOpenDetail(data.row.ts_id, 'sick')}
            >
              <Button type="link">{data.row.total_sick}</Button>
            </Popover>
          </>
        )
      }
    },
    {
      field: 'total_leave',
      headerName: 'Leave',
      width: 50,
      renderCell: (data) => {
        return (
          <>
            <Popover
              content={detailAbsence}
              title="Sick"
              trigger="click"
              open={open}
              placement="right"
              onClick={() => handleOpenDetail(data.row.ts_id, 'leave')}
            >
              <Button type="link">{data.row.total_leave}</Button>
            </Popover>
          </>
        )
      }
    },
    {
      field: 'total_permit',
      headerName: 'Permit',
      width: 70,
      renderCell: (data) => {
        return (
          <>
            <Popover
              content={detailAbsence}
              title="Permit"
              trigger="click"
              open={open}
              placement="right"
              onClick={() => handleOpenDetail(data.row.ts_id, 'permit')}
            >
              <Button type="link">{data.row.total_permit}</Button>
            </Popover>
          </>
        )
      }
    },
    {
      field: 'approval_process_id',
      headerName: 'Status',
      width: 150,
    },

  ];

  const onChange = (date, dateString) => {
    setPeriode(dateString)
    localStorage.setItem("periode_date", JSON.stringify(dateString))
  };

  useEffect(() => {
    if (!session) {
      navigate('/login')
    } else {
      getListTimeSheet()
    }

  }, [periode])

  return (
    <>

      <CCard>
        <CCardHeader>Timesheet</CCardHeader>
        <CCardBody style={{ height: 50 }}>
          <Form.Item label="Period">
            <DatePicker size={'middle'} onChange={onChange} picker="month" />
            <Button style={{ marginLeft: 10 }} onClick={() => onExportExcel()}>Export Excel</Button>
            {/* {
              periode && (
                <Button style={{ marginLeft: 10 }} onClick={() => window.open('http://localhost:3000/ts/print/' + '0', '_blank')}>Print Range</Button>
              )
            } */}
          </Form.Item>
        </CCardBody>
        <CCardBody style={{ height: '1000px', width: '100%' }}>
          <DataGrid
            rows={timesheetList}
            columns={columns}
            pageSize={50}
            rowsPerPageOptions={[50]}
            style={{ fontSize: 12 }}
            components={{ Toolbar: GridToolbarFilterButton }}
            density={'compact'}
          />
        </CCardBody>
      </CCard>
    </>
  )
}

export default ListTimesheet
