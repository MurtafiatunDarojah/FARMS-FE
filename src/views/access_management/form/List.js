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

const ListForm = () => {

    const [listForm, setListForm] = useState([])
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

        API.ListForms(HeaderFarms(session.accessToken)).then(res => {

            res.data.forEach((data, index) => {
                data.id = index + 1
                data.name = data.name
                data.level = data.code
            })

            setListForm(res.data)
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
                        <Button type='link' icon={<EditOutlined />} onClick={() => { navigate('/form/' + data.row._id) }}></Button>
                    </>
                )
            },
            width: 100
        },
        {
            field: 'name',
            headerName: 'Form Name',
            width: 200
        },
        {
            field: 'code',
            headerName: 'Code Form',
            width: 200
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
                <CCardHeader>List Form</CCardHeader>
                <CCardBody style={{ height: 50 }}>
                    <Button type='primary' icon={<UserAddOutlined />} onClick={() => navigate('/form/create')}>Add Form</Button>
                </CCardBody>
                <CCardBody style={{ height: '400px' }}>
                    <DataGrid
                        rows={listForm}
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

export default ListForm
