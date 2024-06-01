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

const ListEquipment = (props) => {

    const [listEquipment, setEquipment] = useState([])
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
        API.ListEquipment(HeaderFarms(session.accessToken)).then(res => {
            res.data.forEach((data, index) => {
                data.id = index + 1
            })

            setEquipment(res.data)
        }).catch(err => {

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
            field: '_id',
            headerName: 'Action',
            width: 50,
            renderCell: (data) => {
                return (
                    <>
                        <Button type='link' icon={<EditOutlined />} onClick={() => { navigate('/equipment/' + data.row._id) }}></Button>
                    </>
                )
            }
        },
        {
            field: 'identity_number',
            headerName: 'Nomor Lambung',
            width: 180
        },
        {
            field: 'equipment_name',
            headerName: 'Nama Alat',
            width: 180
        },
        {
            field: 'category',
            headerName: 'Kategory',
            width: 180
        },
        {
            field: 'equipment_owner',
            headerName: 'Owner',
            width: 180
        },
    ];

    useEffect(() => {
        if (!session) {
            navigate('/login')
        } else {
            getListUser()
            setChangePage(parseInt(localStorage.getItem("page_master") || 0))
        }
    }, [])

    return (
        <>
            <CCard>
                <CCardHeader>List Equipments</CCardHeader>
                <CCardBody style={{ height: 50 }}>
                    <Button type='primary' icon={<UserAddOutlined />} onClick={() => navigate('/equipment')}>Add Equipment</Button>
                </CCardBody>
                <CCardBody>
                    <DataGrid
                        rows={listEquipment}
                        columns={columns}
                        style={{ fontSize: 12 }}
                        density={"compact"}
                        autoHeight={true}
                        pageSize={10}
                        sortModel={sortModel}
                        onSortModelChange={(model) => setSortModel(model)}
                        page={changePage}
                        components={{ Toolbar: GridToolbarFilterButton }}
                        onPageChange={(a) => {
                            setChangePage(a)
                            // save page
                            dispatch({ type: 'page_master', page_master_billing: a })
                        }}
                    />
                </CCardBody>
            </CCard>

        </>
    )
}

export default ListEquipment
