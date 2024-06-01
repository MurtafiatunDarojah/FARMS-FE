import React, { useEffect, useState } from 'react'
import { CCard, CCardHeader, CCardBody } from '@coreui/react'
import HeaderFarms from 'src/utils/header_farms'
import API from 'src/services'

import { Alert, Button, Form, Popover, Select, Timeline, Tooltip } from 'antd';

import "gridjs/dist/theme/mermaid.css";

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FileSearchOutlined } from '@ant-design/icons';
import { DataGrid, GridToolbarFilterButton } from '@mui/x-data-grid';
import { Report } from 'notiflix';
import moment from 'moment';

let XLSX = require("xlsx");

const ListServiceRequest = () => {

    const [listServiceRequest, setServiceRequest] = useState([])
    const [filterCurrent, setFilterCurrent] = useState('Approved')

    const [sumWaiting, setSumWaiting] = useState(0)
    const [sumApproved, setSumApproved] = useState(0)

    const session = useSelector((state) => state.session)

    const dispatch = useDispatch()
    let navigate = useNavigate()

    const filterListHandler = (e) => {
        setFilterCurrent(e)
    }

    function compareStatus(a, b) {
        return a.status.localeCompare(b.status);
    }

    const getListSR = () => {

        API.ServiceRequestLink(HeaderFarms(session.accessToken)).then(res => {

            let DTO = []
            let sumApprovedIn = 0
            let sumWaitingIn = 0

            res.data.forEach(i => {


                if (filterCurrent === 'All') {
                    i.status = i.approval_process_id.status
                    i.user = i.fullname
                    i.created_by = i.uid ? i.uid.fullname : 'Not found'
                    i.code = i.uid ? i.uid.company.code : '-'
                    DTO.push(i)
                } else {

                    if (filterCurrent === i.approval_process_id.status) {
                        i.status = i.approval_process_id.status
                        i.user = i.fullname
                        i.created_by = i.uid ? i.uid.fullname : 'Not found'
                        i.code = i.uid ? i.uid.company.code : '-'
                        DTO.push(i)
                    }
                }


                if (i.approval_process_id.status === 'Approved') {
                    sumApprovedIn++
                }

                if (i.approval_process_id.status === 'Waiting Approval') {
                    sumWaitingIn++
                }

            });

            setSumWaiting(sumWaitingIn)
            setSumApproved(sumApprovedIn)


            DTO.sort(compareStatus);
            setServiceRequest(DTO)

        }).catch(err => {
            console.log(err)
            if (err.response.status == 401) {
                dispatch({ type: 'set', session: null })
                navigate('/login')
            } else if (err.response.status == 403) {
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

    const columns = [
        {
            field: 'form_record',
            headerName: 'Record ID',
            width: 120
        },
        {
            field: 'type_request',
            headerName: 'Type Request',
            width: 170
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (data) => {
                let content = (
                    <Timeline style={{ marginTop: 30 }}>
                        {
                            data && data.row.approval_process_id.detail.map(item => {
                                return (
                                    <Timeline.Item >{item.approved_by.fullname}
                                        <Alert
                                            message={item.status ? 'Approved' : 'Waiting Approval'}
                                            className='mt-1 p-1'
                                            type={item.status ? 'success' : 'warning'}
                                            showIcon
                                        />
                                    </Timeline.Item>
                                )
                            })
                        }
                    </Timeline>
                )

                return (<Popover content={content} title="Process" trigger="click">
                    <Button type="link">{data.value}</Button>
                </Popover>)
            }
        },
        {
            field: 'user',
            headerName: 'Requestor',
            width: 170,
            renderCell: (data) => {
                return <Tooltip placement="top" title={data.value}>{data.value}</Tooltip>
            }
        },
        {
            field: 'code',
            headerName: 'Unit',
            width: 50,
            renderCell: (data) => {
                return <Tooltip placement="top" title={data.value}>{data.value}</Tooltip>
            }
        },
        {
            field: 'created_by',
            headerName: 'Created by',
            width: 120,
            renderCell: (data) => {
                return <Tooltip placement="top" title={data.value}>{data.value}</Tooltip>
            }
        },
        {
            field: 'created_at',
            headerName: 'Created at',
            width: 100,
            renderCell: (data) => {
                return moment(data.value).format('YYYY-MM-DD')
            }

        },
        {
            field: 'id',
            headerName: 'Action',
            width: 200,
            renderCell: (data) => {
                return (
                    <>
                        <Button size='small' type='primary' icon={<FileSearchOutlined />} onClick={() => { navigate('/service-request/' + data.row.form_record) }}>View</Button>
                    </>
                )
            }
        },
    ];

    const onExportExcel = async () => {
        try {
            const requiredColumns = [
                'nik',
                'form_record',
                'fullname',
                'position',
                'department',
                'phone_number',
                'type_request',
                'equipment_details',
                'account_request',
                'justification',
                'description',
                'login_name',
                'network_folder',
                'permission_network_folder',
                'communication_access',
                'created_at'
            ];

            const filteredData = listServiceRequest.map(item => {
                const filteredItem = {};
                requiredColumns.forEach(column => {
                    filteredItem[column] = item[column] !== undefined && item[column] !== null ? item[column].toString() : '';
                });
                return filteredItem;
            });

            let wb = XLSX.utils.book_new();
            let ws = XLSX.utils.json_to_sheet(filteredData);

            const columnWidths = {};
            requiredColumns.forEach(column => {
                columnWidths[column] = Math.max(...filteredData.map(item => item[column].length)) + 2;
            });

            const wscols = requiredColumns.map(column => ({ wch: columnWidths[column] }));
            ws['!cols'] = wscols;

            XLSX.utils.book_append_sheet(wb, ws, "Service_Request");

            XLSX.writeFile(wb, "Service_Request_Export.xlsx");
        } catch (error) {
            alert("Error during export: " + error.toString());
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (!session) {
            navigate('/login')
        } else {
            getListSR()
        }
    }, [filterCurrent])

    return (
        <>
            <CCard>
                <CCardHeader>List Service Request</CCardHeader>
                <CCardBody style={{ marginBottom: -35, display: "flex" }}>
                    <Form.Item>
                        <Select
                            defaultValue={filterCurrent}
                            style={{
                                width: 130,
                            }}
                            onChange={filterListHandler}
                        >
                            <Option value="All">All</Option>
                            <Option value="Waiting Approval">Waiting ({sumWaiting})</Option>
                            <Option value="Approved">Approved ({sumApproved})</Option>
                            <Option value="Reject">Reject</Option>
                            <Option value="Closed">Closed</Option>
                            <Option value="Cancel">Cancel</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button style={{ marginLeft: 10 }}
                            onClick={() => onExportExcel()}
                        >Export Excel</Button>
                    </Form.Item>
                </CCardBody>
                <CCardBody style={{ height: '400px' }}>
                    <DataGrid
                        components={{ Toolbar: GridToolbarFilterButton }}
                        rows={listServiceRequest}
                        columns={columns}
                        pageSize={100}
                        rowsPerPageOptions={[100]}
                        style={{ fontSize: 12 }}
                        density={"compact"}
                        initialState={{
                            sorting: {
                                sortModel: [{ field: 'status', sort: 'asc' }],
                            },
                        }}
                    />
                </CCardBody>
            </CCard>
        </>
    )
}

export default ListServiceRequest
