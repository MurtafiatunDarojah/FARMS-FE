import React, { useEffect, useState } from 'react'
import { CCard, CCardHeader, CCardBody } from '@coreui/react'
import HeaderFarms from 'src/utils/header_farms'
import API from 'src/services'

import { Button } from 'antd';

import { EditOutlined, UserAddOutlined } from '@ant-design/icons';
import "gridjs/dist/theme/mermaid.css";
import { _ } from 'gridjs-react';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DataGrid, GridToolbarFilterButton } from '@mui/x-data-grid';
import { Report } from 'notiflix';



const ListUsers = (props) => {

    const [listUser, setListUser] = useState([])
    const session = useSelector((state) => state.session)
    const [sortModel, setSortModel] = useState([
        {
            field: "name",
            sort: "asc"
        },
    ]);

    const [changePage, setChangePage] = useState(0)

    const dispatch = useDispatch()
    let navigate = useNavigate()

    const getListUser = () => {
        API.ListUsers(HeaderFarms(session.accessToken)).then(res => {

            res.data.forEach((data, index) => {
                data.id = index + 1
                data.direct_spv = data.direct_spv[0]?.fullname
                data.level = data.level?.fullname
                data.roles = data.roles[0]?.name
                data.company = data.company?.code
                data.department = data.department?.fullname
            })
            setListUser(res.data)
        }).catch(err => {
            console.error(err)
            if (err.response.status === 401) {
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
            field: '_id',
            headerName: 'Action',
            width: 200,
            renderCell: (data) => {
                return (
                    <>
                        <Button type='link' icon={<EditOutlined />} onClick={() => { navigate('/users/' + data.row._id) }}></Button>
                    </>
                )
            },
            width: 50
        },
        {
            field: 'nik',
            headerName: 'Employee ID',
            width: 100
        },
        {
            field: 'fullname',
            headerName: 'Fullname',
            width: 180
        },
        {
            field: 'direct_spv',
            headerName: 'Approval Line',
            width: 100
        },
        {
            field: 'roles',
            headerName: 'Roles',
            width: 70
        },
        {
            field: 'level',
            headerName: 'Level',
        },
        {
            field: 'company',
            headerName: 'Unit',
            width: 100
        },
        {
            field: 'department',
            headerName: 'Department',
            width: 200
        },
        {
            field: 'position',
            headerName: 'Position',
            width: 200
        },
        {
            field: 'email',
            headerName: 'Email',
            width: 200
        },
        {
            field: 'phone_number',
            headerName: 'Phone Number',
            width: 110
        },
        {
            field: 'active',
            headerName: 'Active',
            renderCell: (data) => {
                if (data.value) {
                    return 'Yes'
                } else {
                    return 'No'
                }
            }
        },
    ];

    useEffect(() => {
        if (!session) {
            navigate('/login')
        } else {
            getListUser()
            setChangePage(parseInt(localStorage.getItem("page_master_billing") || 0))
        }
    }, [])

    return (
        <>
            <CCard>
                <CCardHeader>List User</CCardHeader>
                <CCardBody style={{ height: 50 }}>
                    <Button type='primary' icon={<UserAddOutlined />} onClick={() => navigate('/users/create')}>Add User</Button>
                </CCardBody>
                <CCardBody style={{ height: '400px' }}>
                    <DataGrid
                        rows={listUser}
                        columns={columns}
                        style={{ fontSize: 12 }}
                        density={"compact"}
                        sortModel={sortModel}
                        onSortModelChange={(model) => setSortModel(model)}
                        page={changePage}
                        components={{ Toolbar: GridToolbarFilterButton }}
                        onPageChange={(a) => {
                            setChangePage(a)
                            // save page
                            dispatch({ type: 'page_master_billing', page_master_billing: a })
                        }}
                    />
                </CCardBody>
            </CCard>

        </>
    )
}

export default ListUsers
