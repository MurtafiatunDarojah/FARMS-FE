import { RollbackOutlined, PrinterOutlined } from '@ant-design/icons';
import { CCard, CCardBody, CCardHeader } from '@coreui/react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useEffect, useRef } from 'react';
import { Affix, Alert, Avatar, Button, Col, Collapse, Comment, Descriptions, Form, Input, InputNumber, message, Modal, Row, Table, Timeline, Upload, DatePicker, TimePicker } from 'antd';

import { CloudUploadOutlined, InboxOutlined, FilePdfOutlined, ShareAltOutlined } from '@ant-design/icons';
import HeaderFarms from 'src/utils/header_farms';
import { Confirm, Notify, Report } from 'notiflix';
import { QRCodeSVG } from 'qrcode.react';
import API from 'src/services';
import numeral from 'numeral';
import moment from 'moment';
import "./styles.css";

const ViewTA = () => {

    let navigate = useNavigate()

    const session = useSelector((state) => state.session)
    const formRefDepature = useRef(null);
    const formRefReturn = useRef(null);
    const formRef = useRef(null);

    const { id } = useParams();
    const { Panel } = Collapse;
    const { Dragger } = Upload;
    const { TextArea } = Input;

    const [statusColor, setStatusColor] = useState({ background: null, color: null })
    const [headerModal, setHeaderModal] = useState(null);

    const [TA, setTA] = useState(null);

    const [open, setOpen] = useState(false);
    const [openReturn, setOpenReturn] = useState(false);
    const [openDepture, setOpenDepture] = useState(false);

    const [form] = Form.useForm();
    const [form_return] = Form.useForm();
    const [form_departure] = Form.useForm();

    const showModal = (rowData) => {
        setOpen(true);

        form.setFieldsValue({
            _id: rowData._id,
            ticket_price: rowData.ticket_price,
            flight_id: rowData.flight_id,
            time: moment(rowData.time, 'HH:mm'),
            from_date: moment(rowData.from_date, 'DD-MMM-YYYY'),
            updated_by: rowData.updated_by
        });

        setHeaderModal(`Departure ${rowData.user} : ${rowData.from} -> ${rowData.to}`)

    };

    const hideModal = () => {
        setOpen(false);
    };

    const showModalReturn = (rowData, type) => {
        setOpenReturn(true);

        form_return.setFieldsValue({
            user_id: rowData.user_id,
            id_record: rowData.id_record,
            id: rowData._id,
            ticket_price: null,
            flight_id: null,
            time: null,
            from_date: null,
        });

        setHeaderModal(`Return Ticket ${rowData.user}`)

    };

    const hideModalReturn = () => {
        setOpenReturn(false);
    };

    const showModalDepture = (rowData) => {

        console.log(rowData)
        form_departure.setFieldsValue({
            id: rowData._id,
            departure_date_start: moment(rowData.departure_date_start_f),
            departure_date_end: moment(rowData.departure_date_end_f),
            updated_remarks: rowData.updated_remarks
        });

        setHeaderModal(`${rowData.fullname}`)
        setOpenDepture(true)
    }

    const hideModalDepture = () => {
        setOpenDepture(false);
    };


    const getDetailTA = () => {
        API.viewTA(HeaderFarms(session.accessToken), id).then(res => {
            setTA(res)
            styleStatus(res.data)
        }).catch(err => {
            console.error(err)
            Report.info(
                "Information",
                "Sorry,travel authority not founding",
                "Okay"
            );
        })
    }

    const closedTravelAuthority = () => {
        Confirm.show(
            'Important Confirmation',
            'Are you sure ?',
            'Yes',
            'No',
            () => {
                API.TravelAuthorityClosed(HeaderFarms(session.accessToken), {
                    approval_id: TA.data.approval_process_id._id,
                }).then(_ => {
                    Report.success(
                        `Closed Success`,
                        `Travel Authority berhasil di tutup`,
                        "Okay",
                        function () {
                            navigate('/travel-authority')
                        })
                }).catch((err) => {
                    console.log(err)
                    message.warning('Terjadi Kesalahan saat close service request')
                });
            },
        );
    }

    const styleStatus = (res) => {
        let status = res.approval_process_id.status;

        if (status === "Waiting Approval") {
            setStatusColor({
                background: "#FF9900",
                color: "#FFFFFF"
            })
        } else if (status === "Approved") {
            setStatusColor({
                background: "#1890FF",
                color: "#FFFFFF"
            })
        } else {
            setStatusColor({
                background: "#F5222D",
                color: "#FFFFFF"
            })
        }
    }

    function removeDuplicatesByProps(array, props) {
        if (!array) {
            return [];
        }

        return array.filter((item, index, self) =>
            index === self.findIndex((el) => (
                props.every((prop) => el[prop] === item[prop])
            ))
        );
    }

    function getUserList() {
        const userList = TA && TA.data.t_ta_user_dtl.map((user) => {
            let { expense_type, reason_for_travel, departure_date_end, departure_date_start, fieldbreak_date_end, fieldbreak_date_start } = user;
            const { fullname, employee_status } = user.user_id;

            const level = user.user_id.level && user.user_id.level.fullname

            const { code } = user.user_id.company;
            const department = user.user_id?.department?.fullname;

            departure_date_start = moment(departure_date_start || fieldbreak_date_start).format('DD-MMM-YY');
            departure_date_end = moment(departure_date_end || fieldbreak_date_end).format('DD-MMM-YY');

            return { department, code, fullname, level, employee_status, expense_type, reason_for_travel, departure_date_end, departure_date_start };
        });

        return userList;
    }

    function getDetUserList() {
        const userList = TA && TA.data.t_ta_user_dtl.flatMap((user) =>
            formatDetUserList(user.user_id)
        );
        const uniqueDetUsers = removeDuplicatesByProps(userList, ['date_birth', 'no_ktp']);

        return uniqueDetUsers;
    }

    function formatDetUserList(formatDetUser) {
        const date_birth = formatDetUser.date_birth;
        const no_ktp = formatDetUser.no_ktp;
        const place_of_birth = formatDetUser.place_of_birth;
        const phone_number = formatDetUser.phone_number;
        return { date_birth, no_ktp, place_of_birth, phone_number };
    }

    function formatFlight(flight) {
        const from_date = moment(flight.from_date).format('DD-MMM-YY');
        const from = flight.from;
        const to = flight.to;
        const time = flight.time;
        const airline = flight.airline;
        const _id = flight._id;
        const id_record = flight.t_ta_user_dtl_id;
        const e_ticket = flight.e_ticket;
        const flight_id = flight.flight_id;
        const ticket_price = flight.ticket_price;
        const author = flight.author_ticket && flight.author_ticket.fullname;
        const seat_class = flight.seat_class
        const updatedAt = flight.updatedAt
        const updated_by = flight.updated_by
        const user = flight.user_id.fullname
        const user_id = flight.user_id._id

        return {
            from_date,
            from,
            to,
            time,
            airline,
            _id,
            id_record,
            e_ticket,
            flight_id,
            ticket_price,
            author,
            seat_class,
            updatedAt,
            updated_by,
            user,
            user_id
        };
    }

    function formatAccommodation(accommodations) {
        const dateIn = moment(accommodations.accomodation_date_in).format('DD-MMM-YY');
        const dateOut = moment(accommodations.accomodation_date_out).format('DD-MMM-YY');
        const accommodation = accommodations.accomodation;
        const _id = accommodations._id;
        return { dateIn, dateOut, accommodation, _id };
    }

    function formatCostEst(costEst) {
        const { item, total, _id } = costEst;
        const formated = numeral(total).format('0,0');
        return { item, total, formated, _id };
    }

    function getFlightList() {
        const flights = TA && TA.data.t_ta_user_dtl.flatMap((user) =>
            user.t_ta_rsv_dst_dtl.map(formatFlight)
        );

        const uniqueFlights = removeDuplicatesByProps(flights, ['_id', ' e_ticket', 'author',]);
        return uniqueFlights;
    }

    function getAccommodationDates() {
        const accommodationDates = TA && TA.data.t_ta_user_dtl.flatMap((user) =>
            user.t_ta_rsv_hotel_dtl.map(formatAccommodation)
        );

        const uniqueAccommodationDates = removeDuplicatesByProps(accommodationDates, ['dateIn', 'dateOut', 'accommodation', '_id']);

        return uniqueAccommodationDates;
    }

    function getCostEstlist() {
        const costEstList = TA && TA.data.t_ta_user_dtl.flatMap((userDtl) =>
            userDtl.t_ta_cost_est_dtl.map(formatCostEst)
        );

        const uniqueCostEstList = removeDuplicatesByProps(costEstList, ['item', 'total', 'formated', '_id']);

        return uniqueCostEstList;
    }

    function getAccommodationMessDates() {

        const accommodationMessDates = TA && TA.data.t_ta_user_dtl.flatMap((user) =>
            user.t_ta_rsv_mess_dtl.map(accomodation => {
                const traveller = user.user_id.fullname
                const messName = accomodation.mess_name

                return { traveller, messName };
            })
        );

        const uniqueAccommodationMess = removeDuplicatesByProps(accommodationMessDates, ['traveller', 'messName'])

        return uniqueAccommodationMess;

    }

    function getObjectiveList() {
        const objectiveList = [];

        if (TA && TA.data.t_ta_user_dtl) {
            const userDtlList = TA.data.t_ta_user_dtl;

            for (const userDtl of userDtlList) {
                if (userDtl.objective) {
                    const fullName = userDtl.user_id.fullname;
                    const objective = userDtl.objective;
                    objectiveList.push({ fullName, objective });
                }
            }
        }

        return objectiveList;
    }


    const AddDepartureDate = (values) => {
        Confirm.show(
            'Konfirmasi Penting',
            'Pastikan tanggal berubah dengan benar.',
            'Ya',
            'Tidak',
            () => {
                API.AddDeparture(HeaderFarms(session.accessToken), values)
                    .then((res) => {
                        Notify.success('Update depature success');
                        setTimeout(() => {
                            formRefDepature.current.resetFields()
                            setOpenDepture(false)
                        }, 1000)
                    })
                    .catch((err) => {
                        console.log(err)
                        Notify.failure(err.response.data.message);
                    });
            }
        );
    }

    const completedTicket = (values) => {
        Confirm.show(
            'Konfirmasi Penting',
            'Pastikan Anda mengunggah e-ticket yang benar karena tindakan ini tidak dapat dibatalkan.',
            'Ya',
            'Tidak',
            () => {
                let bodyFormData = new FormData();

                if (values.upload_eticket && values.upload_eticket.file) {
                    bodyFormData.append('upload_eticket', values.upload_eticket.file);
                }
                bodyFormData.append('ticket_price', values.ticket_price);
                bodyFormData.append('from_date', values.from_date);
                bodyFormData.append('flight_id', values.flight_id);
                bodyFormData.append('time', moment(values.time).format('HH:mm'));
                bodyFormData.append('id', values._id);

                API.CompleteTA(HeaderFarms(session.accessToken), bodyFormData)
                    .then((res) => {
                        Notify.success('TA Selesai');
                        setTimeout(() => {
                            formRef.current.resetFields()
                            setOpen(false)
                        }, 1000)
                    })
                    .catch((err) => {
                        console.log(err)
                        if (err.response.status === 400 || err.response.status === 500) {
                            err.response.data.error.forEach((item) => {
                                Notify.failure(item.name);
                            });
                        } else {
                            Notify.failure('Terjadi kesalahan saat menyelesaikan TA.');
                        }
                    });
            }
        );
    };

    const completedTicketReturn = (values) => {
        Confirm.show(
            'Konfirmasi Penting',
            'Pastikan Anda mengunggah e-ticket yang benar karena tindakan ini tidak dapat dibatalkan.',
            'Ya',
            'Tidak',
            () => {

                let bodyFormData = new FormData();

                if (values.upload_eticket_return && values.upload_eticket_return.file) {
                    bodyFormData.append('upload_eticket', values.upload_eticket_return.file);
                }

                bodyFormData.append('ticket_price', values.ticket_price);
                bodyFormData.append('from_date', values.from_date);
                bodyFormData.append('flight_id', values.flight_id);
                bodyFormData.append('time', moment(values.time).format('HH:mm'));
                bodyFormData.append('user_id', values.user_id);
                bodyFormData.append('id', values.id);

                API.CompleteTAReturn(HeaderFarms(session.accessToken), bodyFormData)
                    .then((res) => {
                        Notify.success('TA Selesai');
                        setTimeout(() => {
                            formRefReturn.current.resetFields()
                            setOpenReturn(false)
                        }, 1000)
                    })
                    .catch((err) => {
                        console.log(err)
                        if (err.response.status === 400 || err.response.status === 500) {
                            err.response.data.error.forEach((item) => {
                                Notify.failure(item.name);
                            });
                        } else {
                            Notify.failure('Terjadi kesalahan saat menyelesaikan TA.');
                        }
                    });
            }
        );
    };


    const approvedByDeputy = () => {
        Confirm.show(
            'Important Confirmation',
            'Are you sure approved by you?',
            'Yes',
            'No',
            () => {
                API.approvedByDeputy(HeaderFarms(session.accessToken), { id_ta: TA.data.approval_process_id._id })
                    .then(res => {
                        Report.success(
                            `Approved Success`,
                            `Travel Authority berhasil di setujui`,
                            "Okay",
                            function () {
                                navigate('/travel-authority')
                            })
                    }).catch((err) => {
                        console.log(err)
                        message.warning('Terjadi Kesalahan saat approved TA')
                    });
            })
    }

    function onChange(info) {
        if (info.file.status !== 'uploading') {
            console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
            message.success(`${info.file.name} file uploaded successfully`);
        } else if (info.file.status === 'error') {
            message.error(`${info.file.name} file upload failed.`);
        }
    }

    function currencyFormatter(value) {
        return numeral(value).format('0,0');
    }

    function currencyParser(value) {
        return numeral(value).value();
    }

    const columnUserList = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Name',
            dataIndex: 'fullname',
            key: 'fullname',
            render: fullname => fullname, // Extract the full name before the ' - ' delimiter
        },
        {
            title: 'Jabatan',
            dataIndex: 'level',
            key: 'level',
        },
        {
            title: 'department',
            dataIndex: 'department',
            key: 'department',
        },
        {
            title: 'Status',
            dataIndex: 'employee_status',
            key: 'employee_status',
        },
        {
            title: 'Expense Type',
            dataIndex: 'expense_type',
            key: 'expense_type',
            render: expenseType => expenseType,
        },
        {
            title: 'Reason',
            dataIndex: 'reason_for_travel',
            key: 'reason_for_travel',
        },
        {
            title: 'Start',
            dataIndex: 'departure_date_start',
            key: 'departure_date_start',
        },
        {
            title: 'End',
            dataIndex: 'departure_date_end',
            key: 'departure_date_end',
        },
        {
            title: 'Action',
            dataIndex: 'id',
            key: 'id',
            align: 'center',
            render: (text, record) => {
                return (
                    <Button icon={<CloudUploadOutlined />} type="primary" size="small" onClick={() => showModalDepture(record)}></Button>
                )
            }
        },
    ];

    const columnDetUserList = [
        {
            title: 'Number ID',
            dataIndex: 'no_ktp',
            key: 'no_ktp',
        },
        {
            title: 'Date Birth',
            dataIndex: 'date_birth',
            key: 'date_birth',
            render: date_birth => date_birth && moment(date_birth).format('DD-MMM-YY'),
        },
        {
            title: 'Place of Birth',
            dataIndex: 'place_of_birth',
            key: 'place_of_birth',
        },
        {
            title: 'Number Phone',
            dataIndex: 'phone_number',
            key: 'phone_number',
        },
    ];

    const AccomodationMessListColumns = [
        {
            title: 'Mess Name',
            dataIndex: 'messName',
            key: 'messName',
        },
        {
            title: 'Traveller',
            dataIndex: 'traveller',
            key: 'traveller',
        },
    ];

    const flightListColumns = [
        {
            title: 'Author',
            dataIndex: 'author',
            key: 'author',
        },
        {
            title: 'User',
            dataIndex: 'user',
            key: 'user',
        },
        {
            title: 'E - Ticket',
            dataIndex: 'e_ticket',
            key: 'e_ticket',
            render: (text, record) => {
                if (text) {
                    return (<Button type="link" size='small' href={`https://travel-authority.s3.ap-southeast-3.amazonaws.com/${text}`} target="_blank" rel="noopener noreferrer">
                        <FilePdfOutlined /> View
                    </Button>)
                }
            }
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            align: 'center',
            render: (text, record) => {
                const alertType = record.e_ticket ? 'info' : 'warning';

                return (
                    <Alert
                        message={record.e_ticket ? 'Complete' : 'Not Complete'}
                        type={alertType}
                        showIcon
                        style={{
                            fontSize: 12,
                        }}
                    />
                );
            },
        },
        {
            title: 'Departure',
            dataIndex: '_id',
            key: '_id',
            align: 'center',
            render: (text, record) => {
                return (
                    <Button icon={<CloudUploadOutlined />} type="primary" size="small" onClick={() => showModal(record)}></Button>
                )
            },
        },
        {
            title: 'Return',
            dataIndex: '_id',
            key: '_id',
            align: 'center',
            render: (text, record) => {
                return (
                    <Button icon={<CloudUploadOutlined />} type="primary" size="small" onClick={() => showModalReturn(record)}></Button>
                )
            }
        },
    ];

    const AccomodationListColumns = [
        {
            title: 'Hotel Name',
            dataIndex: 'accommodation',
            key: 'accommodation',
        },
        {
            title: 'Date In',
            dataIndex: 'dateIn',
            key: 'dateIn',
        },
        {
            title: 'Date Out',
            dataIndex: 'dateOut',
            key: 'dateOut',
        },
    ];

    const CostEstColumns = [
        {
            title: 'Desc',
            dataIndex: 'item',
            key: 'item',
        },
        {
            title: 'Total',
            dataIndex: 'formated',
            key: 'formated',
        },
    ];

    useEffect(() => {
        if (!session) {
            navigate('/login')
        } else {
            if (!id) {
                return navigate('/travel-authority')
            }

            getDetailTA()
        }
    }, [open, openReturn, openDepture])

    return (
        <>
            {/* Departure Ticket */}
            <Modal
                title={headerModal}
                visible={open}
                onOk={hideModal}
                onCancel={hideModal}
                footer={null}
                centered
                style={{
                    top: 55,
                }}
            >
                <Form
                    form={form}
                    ref={formRef}
                    onFinish={(data) => completedTicket(data)}
                    onFinishFailed={null}
                    layout="vertical"
                    encType='multipart/form-data'
                    method='post'
                >
                    <Form.Item
                        name="upload_eticket"
                        rules={[
                            { required: false, message: 'Please enter the E-ticket' },
                        ]}

                    >
                        <Dragger onChange={onChange} beforeUpload={() => {
                            return false;
                        }} multiple={false} maxCount={1}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        </Dragger>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Ticket Price"
                                name="ticket_price"
                                rules={[
                                    { required: true, message: 'Please enter the ticket price' },
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    step={1}
                                    disabled={null}
                                    formatter={(value) => `${currencyFormatter(value)}`}
                                    parser={(value) => currencyParser(value)}
                                    style={{ width: '100%' }}
                                    autoFocus
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Flight ID"
                                name="flight_id"
                                rules={[
                                    { required: true, message: 'Please enter the flight ID' },
                                ]}
                                getValueFromEvent={(event) => event.target.value.toUpperCase()}
                            >
                                <Input type="text" size="small" style={{ textTransform: 'uppercase' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="From Date"
                                name="from_date"
                                rules={[
                                    { required: true, message: 'Please enter the from date' },
                                ]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Time"
                                name="time"
                                rules={[
                                    { required: true, message: 'Please enter the time' },
                                ]}
                            >
                                <TimePicker
                                    style={{ width: '100%' }}
                                    format="HH:mm"
                                    onChange={(time, timeString) => {
                                        form.setFieldsValue({
                                            time: moment(timeString, 'HH:mm')
                                        });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Form.Item
                            label="_id"
                            name="_id"
                            hidden
                        >
                            <Input type="text" size="small" />
                        </Form.Item>
                    </Row>
                    <Form.Item>
                        <Row justify="center">
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Row>
                    </Form.Item>
                </Form>

            </Modal>

            {/* Return Ticket */}
            <Modal
                title={headerModal}
                visible={openReturn}
                onOk={hideModalReturn}
                onCancel={hideModalReturn}
                footer={null}
                centered
                style={{
                    top: 55,
                }}
            >
                <Form
                    form={form_return}
                    ref={formRefReturn}
                    onFinish={(data) => completedTicketReturn(data)}
                    onFinishFailed={null}
                    layout="vertical"
                    encType='multipart/form-data'
                    method='post'
                >
                    <Form.Item
                        name="upload_eticket_return"
                        rules={[
                            { required: true, message: 'Please enter the E-ticket' },
                        ]}

                    >
                        <Dragger onChange={onChange} beforeUpload={() => {
                            return false;
                        }} multiple={false} maxCount={1}>
                            <p className="ant-upload-drag-icon">
                                <InboxOutlined />
                            </p>
                            <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        </Dragger>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Ticket Price"
                                name="ticket_price"
                                rules={[
                                    { required: true, message: 'Please enter the ticket price' },
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    step={1}
                                    disabled={null}
                                    formatter={(value) => `${currencyFormatter(value)}`}
                                    parser={(value) => currencyParser(value)}
                                    style={{ width: '100%' }}
                                    autoFocus
                                />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Flight ID"
                                name="flight_id"
                                rules={[
                                    { required: true, message: 'Please enter the flight ID' },
                                ]}
                                getValueFromEvent={(event) => event.target.value.toUpperCase()}
                            >
                                <Input type="text" size="small" style={{ textTransform: 'uppercase' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="From Date"
                                name="from_date"
                                rules={[
                                    { required: true, message: 'Please enter the from date' },
                                ]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Time"
                                name="time"
                                rules={[
                                    { required: true, message: 'Please enter the time' },
                                ]}
                            >
                                <TimePicker
                                    style={{ width: '100%' }}
                                    format="HH:mm"
                                    onChange={(time, timeString) => {
                                        form.setFieldsValue({
                                            time: moment(timeString, 'HH:mm')
                                        });
                                    }}
                                />
                            </Form.Item>
                        </Col>
                        <Form.Item
                            label="id_record"
                            name="id_record"
                            hidden
                        >
                            <Input type="text" size="small" />
                        </Form.Item>

                        <Form.Item
                            label="id"
                            name="id"
                            hidden
                        >
                            <Input type="text" size="small" />
                        </Form.Item>

                        <Form.Item
                            label="user_id"
                            name="user_id"
                            hidden
                        >
                            <Input type="text" size="small" />
                        </Form.Item>

                        <Form.Item
                            label="user"
                            name="user"
                            hidden
                        >
                            <Input type="text" size="small" />
                        </Form.Item>
                    </Row>
                    <Form.Item>
                        <Row justify="center">
                            <Button type="primary" htmlType="submit">
                                Submit
                            </Button>
                        </Row>
                    </Form.Item>
                </Form>

            </Modal>

            <Modal
                title={headerModal}
                visible={openDepture}
                onOk={hideModalDepture}
                onCancel={hideModalDepture}
                footer={null}
                centered
                style={{
                    top: 55,
                }}
            >
                <Form
                    form={form_departure}
                    ref={formRefDepature}
                    onFinish={(data) => AddDepartureDate(data)}
                    onFinishFailed={null}
                    layout="vertical"
                    method='post'
                >
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                label="Date Start"
                                name="departure_date_start"
                                rules={[
                                    { required: true, message: 'Please enter the from date' },
                                ]}
                            >
                                <DatePicker disabled style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                label="Date end"
                                name="departure_date_end"
                                rules={[
                                    { required: true, message: 'Please enter the start date' },
                                ]}
                            >
                                <DatePicker style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Form.Item
                            label="id"
                            name="id"
                            hidden
                        >
                            <Input type="text" size="small" />
                        </Form.Item>
                    </Row>
                    <Row gutter={10}>
                        <Col span={24}>
                            <Form.Item
                                label="Remarks"
                                name="updated_remarks"
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input remarks',
                                    },
                                ]}
                            >
                                <TextArea rows={4} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item>
                        <Row justify="center">
                            <Button type="primary" htmlType="submit">
                                Edit
                            </Button>
                        </Row>
                    </Form.Item>
                </Form>

            </Modal>
            <CCard className='mb-4'>
                <CCardBody>
                    <div className="container p-1" style={{ alignSelf: "center" }}>
                        <div className="row">
                            <div className="col-md-1">
                                <Button type='primary' icon={<RollbackOutlined />} onClick={() => navigate('/travel-authority')}>Back</Button>
                            </div>
                            <div className='col-md-1'>
                                <Button type='primary' icon={<PrinterOutlined />} onClick={() => window.open('https://farms.brmapps.com/ta/print/' + id, '_blank')}>Print</Button>
                            </div>
                            <div className='col-md-1'>
                                <Button type='primary' icon={<ShareAltOutlined />} onClick={() => {
                                    navigator.clipboard.writeText('https://farms.brmapps.com/ta/print/' + id)
                                        .then(() => {
                                            Notify.success('Copied !');
                                        })
                                        .catch((err) => {
                                            console.error('Could not copy text: ', err);
                                        });
                                }}>Share Link TA</Button>
                            </div>
                            <div className="col-md-12 mb-2 mt-3">
                                <Collapse bordered={true} defaultActiveKey={['0']}>
                                    <Panel header="Detail" key="1">
                                        {TA ? (
                                            <>
                                                <div className="row mt-1">
                                                    <div className="col-md-12">
                                                        {
                                                            TA && (
                                                                <Descriptions size="small" bordered title="Information" className="mb-1">
                                                                    <Descriptions.Item label="Form ID">
                                                                        {TA.data.id_record}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item className="col-3" label="Travel Type">
                                                                        {TA.data.type_travel}
                                                                    </Descriptions.Item>
                                                                </Descriptions>
                                                            )
                                                        }
                                                    </div>
                                                    <div className="col-md-12">
                                                        {
                                                            TA && (
                                                                <Descriptions size="small" bordered className="mb-4">
                                                                    <Descriptions.Item style={{ background: statusColor.background, color: statusColor.color }} label="Status">
                                                                        {TA.data.approval_process_id.status}
                                                                    </Descriptions.Item>
                                                                    <Descriptions.Item className="col-3" label="Created at">
                                                                        {moment(TA.data.created_at).format('LLL')}
                                                                    </Descriptions.Item>
                                                                </Descriptions>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                                <div className='row'>
                                                    <div className="col-md-12 mb-3">
                                                        {
                                                            TA.data && TA.data.comments.length > 0 && (
                                                                <Collapse bordered="false" defaultActiveKey={['1']}>
                                                                    <Panel header="Comments" key="1">
                                                                        {
                                                                            TA.data && TA.data.comments.map(data => {
                                                                                return (
                                                                                    <Comment
                                                                                        author={<a>{data.uid.fullname}</a>}
                                                                                        avatar={<Avatar src="https://joeschmoe.io/api/v1/joe" alt="Han Solo" />}
                                                                                        content={
                                                                                            <p>
                                                                                                {data.text_plain}
                                                                                            </p>
                                                                                        }
                                                                                    />
                                                                                )
                                                                            })
                                                                        }
                                                                    </Panel>
                                                                </Collapse>
                                                            )
                                                        }
                                                    </div>
                                                </div>
                                                <div className='row'>
                                                    <div className='col-md-8'>
                                                        <label style={{ fontSize: 15, fontWeight: "bold" }}>Approval Status</label>
                                                        <Timeline style={{ marginTop: 30, marginBottom: -30 }}>
                                                            {
                                                                TA.data.approval_process_id.detail.map(item => {
                                                                    return (
                                                                        <Timeline.Item >{item.approved_by.fullname}
                                                                            <Alert
                                                                                message={item.status ? 'Approved' : 'Waiting Approval'}
                                                                                className='mt-1 w-50 p-1'
                                                                                type={item.status ? 'success' : 'warning'}
                                                                                showIcon
                                                                            />
                                                                        </Timeline.Item>
                                                                    )
                                                                })
                                                            }
                                                        </Timeline>
                                                    </div>
                                                    {
                                                        TA.data.approval_process_id.approval_key && (
                                                            <div className='col-md-3' style={{ display: "flex", alignItems: "end" }}>
                                                                <QRCodeSVG size={110} value={`https://farms.brmapps.com/wf/approved/${TA.data.approval_process_id.approval_key}`} />
                                                            </div>
                                                        )
                                                    }
                                                </div>
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                    </Panel>
                                </Collapse>
                            </div>
                        </div>

                        {getUserList() && getUserList().length > 0 && (
                            <div className="row mt-1">
                                <div className="col-md-12">
                                    <h6 style={{ background: "#d8d8d8", padding: "10px", borderRadius: 2 }}>Traveller</h6>
                                    <Table
                                        dataSource={getUserList()}
                                        className="custom-table"
                                        pagination={{
                                            hideOnSinglePage: true,
                                            showLessItems: true
                                        }}
                                        columns={columnUserList}
                                    />
                                </div>
                            </div>
                        )}

                        {getDetUserList() && getDetUserList().length > 0 && (
                            <div className="row">
                                <div className="col-md-12">
                                    <h6 style={{ background: "#d8d8d8", padding: "10px", borderRadius: 2 }}>Detail Traveller</h6>
                                    <Table
                                        dataSource={getDetUserList()}
                                        className="custom-table"
                                        pagination={{
                                            hideOnSinglePage: true,
                                            showLessItems: true
                                        }}
                                        columns={columnDetUserList}
                                    />
                                </div>
                            </div>
                        )}

                        {getAccommodationMessDates() && getAccommodationMessDates().length > 0 && (
                            <div className="row mt-3">
                                <div className="col-md-12">
                                    <h6 style={{ background: "#d8d8d8", padding: "10px", borderRadius: 2 }}>Accomodation Mess</h6>
                                    <Table
                                        dataSource={getAccommodationMessDates()}
                                        className="custom-table"
                                        pagination={{
                                            hideOnSinglePage: true,
                                            showLessItems: true
                                        }}
                                        columns={AccomodationMessListColumns}
                                    />
                                </div>
                            </div>
                        )}

                        {getAccommodationDates() && getAccommodationDates().length > 0 && (
                            <div className="row mt-4">
                                <div className="col-md-12">
                                    <h6 style={{ background: "#d8d8d8", padding: "10px", borderRadius: 2 }}>Accomodation</h6>
                                    <Table
                                        dataSource={getAccommodationDates()}
                                        className="custom-table"
                                        pagination={{
                                            hideOnSinglePage: true,
                                            showLessItems: true
                                        }}
                                        columns={AccomodationListColumns}
                                    />
                                </div>
                            </div>
                        )}

                        {getCostEstlist() && getCostEstlist().length > 0 && (
                            <div className="row mt-4">
                                <div className="col-md-12">
                                    <h6 style={{ background: "#d8d8d8", padding: "10px", borderRadius: 2 }}>Travel Cost Estimation</h6>
                                    <Table
                                        dataSource={[...getCostEstlist(), { item: 'Total Cost', formated: numeral(getCostEstlist().reduce((accumulator, currentItem) => accumulator + currentItem.total, 0)).format('0,0') }]}
                                        className="custom-table custom-table-cost"
                                        pagination={{
                                            hideOnSinglePage: true,
                                            showLessItems: true
                                        }}
                                        columns={CostEstColumns}
                                    />

                                </div>
                            </div>
                        )}


                        {getFlightList() && getFlightList().length > 0 && (
                            <div className="row mt-3">
                                <div className="col-md-12">
                                    <h6 style={{ background: "#d8d8d8", padding: "10px", borderRadius: 2 }}>Reservation</h6>
                                    <Table
                                        dataSource={getFlightList()}
                                        className="custom-table"
                                        pagination={{
                                            hideOnSinglePage: true,
                                            showLessItems: true
                                        }}
                                        columns={flightListColumns}
                                    />
                                </div>
                            </div>
                        )}

                        {
                            TA && (
                                <div className="col-md-12 mt-4">
                                    <h6 style={{ background: "#d8d8d8", padding: "10px", borderRadius: 2 }}>User Objective</h6>
                                    {getObjectiveList().map(item => {
                                        return (
                                            <Comment
                                                author={item.fullName}
                                                content={item.objective}
                                            />
                                        )
                                    })}
                                </div>
                            )
                        }
                        {

                            TA && TA.data.approval_process_id.status === 'Approved' && (
                                <div className="row mt-4">
                                    <div className="col-md-12">
                                        <Affix offsetBottom={10}>
                                            <Form.Item className="text-center">
                                                <Button type="primary" size="large" htmlType="submit" onClick={closedTravelAuthority}>
                                                    Closed
                                                </Button>
                                            </Form.Item>
                                        </Affix>
                                    </div>
                                </div>
                            )
                        }

                        {
                            session && TA && TA.data.approval_process_id.status === 'Waiting Approval' && TA.data.approval_process_id.detail.find(a => a.deputy_approver === session.nik && a.status === false) && (
                                <div className="row mt-4">
                                    <div className="col-md-12">
                                        <Affix offsetBottom={10}>
                                            <Form.Item className="text-center">
                                                <Button type="primary" size="large" htmlType="submit" onClick={() => approvedByDeputy()}>
                                                    Approved
                                                </Button>
                                            </Form.Item>
                                        </Affix>
                                    </div>
                                </div>
                            )

                        }
                    </div>
                </CCardBody>
            </CCard>
        </>
    );
};

export default ViewTA;
