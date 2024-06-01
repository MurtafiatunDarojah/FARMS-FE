import { Descriptions, Form, Radio, Input, Collapse, Avatar, Comment, Button, Modal, AutoComplete } from "antd";
import { CCard, CCardHeader, CCardBody } from '@coreui/react'
import { Confirm, Loading, Notify, Report } from 'notiflix';
import { useNavigate, useParams } from 'react-router-dom';
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import "gridjs/dist/theme/mermaid.css";
import moment from 'moment';

import HeaderFarms from 'src/utils/header_farms';
import API from 'src/services';
import "./styles.css";

const ViewTimesheet = () => {

    let { id } = useParams();

    const session = useSelector((state) => state.session)
    const listTS = useSelector((state) => state.listTSPeriode)


    const [Timesheet, setTimesheet] = useState(null)
    const [dateListOld, setDateListOld] = useState([])
    const [dateList, setDateList] = useState([]);
    const [shortcut, setShortcut] = useState([]);
    const [itemId, setItemId] = useState(id);

    const [updated, setUpdated] = useState(false)

    const [publicHoliday, setPublicHoliday] = useState([]);
    const [totalWeekOnSite, setTotalWeekOnSite] = useState(0);
    const [totalHomeBase, setTotalHomeBase] = useState(0);
    const [currentUnit, setCurrentUnit] = useState(null);
    const [totalPermit, setTotalPermit] = useState(0);
    const [totalLeave, SetTotalLeave] = useState(0);
    const [totalWeek, setTotalWeek] = useState(0);
    const [totalSick, SetTotalSick] = useState(0);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [statusColor, setStatusColor] = useState({ background: null, color: null })

    const readOnly = false;
    const { Panel } = Collapse;

    let navigate = useNavigate();


    const getDetailTS = (id) => {

        Loading.pulse("Just a Moment");

        API.ViewTimesheet(HeaderFarms(session.accessToken), id).then((res => {

            setTimesheet(res.data)
            styleStatus(res.data)
            loopDateFromAPI(res.data)
            dateListOldRender(res.data)
            setCurrentUnit(res.data.uid.company.code)

            Loading.remove()
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
    }

    const handleFormChange = (index, event) => {

        // copy data from state
        let data = [...dateList];

        if (event.target.name === "ts_loc_dtl") {
            // remove value if select leave / sick
            data[index]["ts_reason_dtl"] = null;
        } else {
            if (event.target.name !== "ts_note_dtl") {
                // remove value if select not leave
                data[index]["ts_loc_dtl"] = null;
            }
        }

        // change item
        data[index][event.target.name] = event.target.value || null;

        // Save again and then count
        setDateList(data);

        // Compare if edited
        checkUpdatesTS(data);
        sumAll()
    };

    const updateTStoServer = () => {
        Loading.hourglass("Just a Moment");

        let DTO = []
        dateList.forEach(item => {
            DTO.push({
                form_submit_id: Timesheet.form_submit_id,
                ts_row_id_dtl: item.ts_row_id_dtl,
                ts_date_dtl: item.ts_date_dtl,
                ts_loc_dtl: item.ts_loc_dtl ? item.ts_loc_dtl.split('_')[1] : null,
                ts_reason_dtl: item.ts_reason_dtl ? item.ts_reason_dtl.split('_')[1] : null,
                ts_note_dtl: item.ts_note_dtl,
                created_by: Timesheet.uid._id,
                updated_by: session.id,
            })
        })

        let DATA = {
            form_id: Timesheet.form_submit_id,
            year: moment(Timesheet.date_from).format("YYYY"),
            date_from: moment(Timesheet.date_from).format("YYYY-MM-DD"),
            date_to: moment(Timesheet.date_to).format("YYYY-MM-DD"),
            day_count: dateList.length,
            total_work: totalWeek,
            total_site: totalWeekOnSite,
            total_sick: totalSick,
            total_leave: totalLeave,
            total_home_base: totalHomeBase,
            ttimesheetdetails: DTO
        }

        API.UpdateTS(HeaderFarms(session.accessToken), DATA)
            .then((res) => {
                Report.success(
                    `Updated Timesheet Success`,
                    `Timesheet berhasil di dirubah, pastikan yang anda rubah benar.`,
                    "Okay",
                    function () {

                    }
                );
                Loading.remove();
            })
            .catch(err => {
                console.err(err)
                Report.warning(
                    "Oops.. something wrong",
                    "Sorry, this application is experiencing problems",
                    "Okay"
                );
                Loading.remove();
            });
    }

    const dateListOldRender = (data) => {

        let DTO = [];

        let dataApi = data.details_old.length > 0 ? data.details_old : data.details

        dataApi.forEach((item, index) => {

            DTO.push({
                ts_row_id_dtl: item.ts_row_id_dtl,
                ts_date_dtl: item.ts_date_dtl,
                ts_loc_dtl: item.ts_loc_dtl ? index + '_' + item.ts_loc_dtl : null, //must null for counter
                ts_reason_dtl: item.ts_reason_dtl ? index + '_' + item.ts_reason_dtl : null,
                ts_note_dtl: item.ts_note_dtl, //must null for counter
            })

        })

        setDateListOld(DTO)
    }

    const checkUpdatesTS = (data) => {
        let update_item = 0
        data.forEach(item => {
            dateListOld.find(i => {
                if (item.ts_row_id_dtl === i.ts_row_id_dtl) {
                    if (item.ts_loc_dtl !== i.ts_loc_dtl ||
                        item.ts_note_dtl !== i.ts_note_dtl) {
                        update_item++
                    }
                }

            })
        })
        console.log(update_item)
        if (update_item > 0) {
            setUpdated(true)
            Notify.info('Your has change Timesheet');
        } else {
            setUpdated(false)
        }
    }

    var get_week = function (date) {
        var dt = new Date(date);

        if (dt.getDay() === 6 || dt.getDay() === 0) {
            return true;
        }

        return false;
    };

    const showModal = () => {
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };


    let sumAll = () => {
        // Count After save
        countingDayWeek();
        countingDaySite();
        countingDaySick();
        countingDayLeave();
        countingDayPermit()
        countingDayHomebase()
    }

    var get_week = function (date) {
        var dt = new Date(date);

        if (dt.getDay() === 6 || dt.getDay() === 0) {
            return true;
        }

        return false;
    };

    function countingDayWeek() {
        let count = 0;
        dateList.forEach((item) => {
            // if location select != null, count all
            if (item.ts_loc_dtl) {
                count++;
            }
        });
        setTotalWeek(count);
    }

    function countingDaySite() {
        let count = 0;
        dateList.forEach((item) => {
            if (item.ts_loc_dtl) {
                let split = item.ts_loc_dtl.split("_")[1];
                if (split !== Timesheet.uid.company.code) {
                    count++;
                }
            }
        });
        setTotalWeekOnSite(count);

    }

    function countingDayHomebase() {
        let count = 0;
        dateList.forEach((item) => {
            if (item.ts_loc_dtl) {
                let split = item.ts_loc_dtl.split("_")[1];
                if (split === currentUnit) {
                    count++;
                }
            }
        });
        setTotalHomeBase(count);
    }

    function countingDayPermit() {
        let count = 0;
        dateList.forEach((item) => {
            if (item.ts_reason_dtl) {
                let split = item.ts_reason_dtl.split("_")[1];
                if (split === "PERMIT") {
                    count++;
                }
            }
        });
        setTotalPermit(count);
    }

    function countingDayLeave() {
        let count = 0;
        dateList.forEach((item) => {
            if (item.ts_reason_dtl) {
                let split = item.ts_reason_dtl.split("_")[1];
                if (split === "LEAVE") {
                    count++;
                }
            }
        });
        SetTotalLeave(count);
    }

    const styleStatus = (res) => {
        let status = res.approval_process.status;

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


    function countingDaySick() {
        let count = 0;
        dateList.forEach((item) => {
            if (item.ts_reason_dtl) {
                let split = item.ts_reason_dtl.split("_")[1];
                if (split === "SICK") {
                    count++;
                }
            }
        });
        SetTotalSick(count);
    }

    const getAPIHoliday = () => {
        fetch("https://date.nager.at/api/v3/publicholidays/2023/ID")
            .then((response) => response.json())
            .then((data) => setPublicHoliday(data));
    };


    const filterByDate = (date) => {
        let loc = null;

        publicHoliday.push({
            date: "2023-07-19",
            localName: "Tahun Baru Islam 1445 Hijriah",
            name: "Tahun Baru Islam 1445 Hijriah",
            countryCode: "ID",
            fixed: true,
            global: true,
            counties: null,
            launchYear: null,
            types: [
                "Public"
            ]
        });

        publicHoliday.forEach((item) => {
            if (date === item.date) {
                loc = String(item.localName);
            }

            // get newyear, because only check date and month, not year
            if (date.substring(5, 10) === item.date.substring(5, 10)) {
                loc = String(item.localName);
            }

        });

        return loc
    };

    const ApprovedTS = (id) => {

        Confirm.show(
            'Important Confirmation',
            'Are you sure ? please make sure timesheet is correct.',
            'Yes',
            'No',
            () => {

                API.ApprovedTS(HeaderFarms(session.accessToken),
                    { approval_id_detail: id }).then(res => {
                        Report.success(
                            `Approved Success`,
                            `Timesheet berhasil di setujui`,
                            "Okay",
                            function () {
                                // navigate('/timesheet')
                            })

                    }).catch(err => {
                        console.error(err)
                        Report.warning(
                            "Oops.. something wrong",
                            err.message,
                            "Okay"
                        );
                    })

            },
        );
    }

    const RejectTS = (values) => {

        API.RejectTS(HeaderFarms(session.accessToken),
            { approval_id_detail: Timesheet.approval_process.detail[0]._id, msg: values.message }).then(res => {
                Report.success(
                    `Reject Success`,
                    `Timesheet berhasil di tolak`,
                    "Okay",
                    function () {
                        navigate('/timesheet')
                    })
            }).catch(err => {
                console.error(err)
                Report.warning(
                    "Oops.. something wrong",
                    err.message,
                    "Okay"
                );
            })

    }

    const loopDateFromAPI = (data) => {

        let DTO = [];

        let dataApi = data.details_old.length > 0 ? data.details_old : data.details

        for (const [index, item] of dataApi.entries()) {
            DTO.push({
                ts_row_id_dtl: item.ts_row_id_dtl,
                ts_date_dtl: item.ts_date_dtl,
                ts_loc_dtl: item.ts_loc_dtl ? index + '_' + item.ts_loc_dtl : null,
                ts_reason_dtl: item.ts_reason_dtl ? index + '_' + item.ts_reason_dtl : null,
                ts_note_dtl: item.ts_note_dtl,
            });
        }

        setDateList(DTO)
        setTotalWeek(data.total_work)
        setTotalWeekOnSite(data.total_site)
        SetTotalLeave(data.total_leave)
        SetTotalSick(data.total_sick)
        setTotalPermit(data.total_permit)

        setTotalHomeBase(data.total_home_base)
        Loading.remove();
    };

    const onSelect = (value, option) => {
        getDetailTS(value)
        setItemId(value)
        setShortcut('')
    };


    const handleClick = () => {
        navigate('/timesheet')
    }


    useEffect(() => {

        if (!session) {
            navigate('/login')
        } else {
            getDetailTS(id)
            getAPIHoliday();

        }

    }, [])

    return (
        <>
            <div className="row mb-3">
                <div className="col-md-1">
                    <Button onClick={handleClick}>Back</Button>
                </div>
                <div className="col-md-1">
                    <Button onClick={() => window.open('https://farms.brmapps.com/ts/print/' + itemId, '_blank')}>Print</Button>
                </div>
                <div className="col=md-1 mt-4">
                    {
                        listTS.length != 0 && (
                            <AutoComplete
                                style={{
                                    width: 300,
                                    position: "fixed",
                                    zIndex: 2000,
                                    top: 10,
                                    left: 278
                                }}
                                options={listTS.filter(item => item.timesheet._id != null).map(item => ({
                                    label: item.fullname,
                                    value: item.timesheet._id
                                }))}
                                placeholder="Shortcut View"
                                filterOption={(inputValue, option) =>
                                    option.label.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                                }
                                autoFocus
                                onSelect={onSelect}
                                onChange={(e) => {
                                    setShortcut(e)
                                }}
                                value={shortcut}
                            >
                                <Input.Search size="large" enterButton />
                            </AutoComplete>

                        )
                    }
                </div>

            </div>
            <CCard className='mb-3'>
                <CCardHeader>Detail Timesheet</CCardHeader>
                <CCardBody>
                    <div className="row">
                        <div className="col-md-12">
                            {
                                Timesheet && (
                                    <Descriptions size="small" bordered title="Information" className="mb-4">
                                        <Descriptions.Item label="Owned">
                                            {Timesheet.uid.fullname}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Form ID">
                                            {Timesheet.form_submit_id}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Approver">
                                            {Timesheet.approval_process.detail[0].approved_by.fullname}
                                        </Descriptions.Item>
                                        <Descriptions.Item style={{ background: statusColor.background, color: statusColor.color }} label="Status">
                                            {Timesheet.approval_process.status}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Date From">
                                            {moment(Timesheet.date_from).format(
                                                "YYYY MMMM DD"
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Date To">
                                            {moment(Timesheet.date_to).format(
                                                "YYYY MMMM DD"
                                            )}
                                        </Descriptions.Item>
                                        <Descriptions.Item label="Created at">
                                            {moment(Timesheet.created_at).format('LLL')}
                                        </Descriptions.Item>
                                    </Descriptions>
                                )
                            }
                        </div>
                        <div className="row">
                            <div className='col-md-12'>
                                <Descriptions bordered title="Attendance Recap" style={{ fontSize: 10 }}>
                                    <Descriptions.Item style={{ background: "#c5eded" }} label="Total Presence">
                                        <b>{totalWeek}</b>
                                    </Descriptions.Item>
                                    <Descriptions.Item style={{ background: "#c5eded" }} label="Home Base">
                                        <b>{totalHomeBase}</b>
                                    </Descriptions.Item>
                                    <Descriptions.Item style={{ background: "#c5eded" }} label="Site / Unit">
                                        <b>{totalWeekOnSite}</b>
                                    </Descriptions.Item>
                                    <Descriptions.Item style={{ background: "#f0b1b1" }} label="Leave">
                                        <b>{totalLeave}</b>
                                    </Descriptions.Item>
                                    <Descriptions.Item style={{ background: "#f0b1b1" }} label="Sick">
                                        <b>{totalSick}</b>
                                    </Descriptions.Item>
                                    <Descriptions.Item style={{ background: "#f0b1b1" }} label="Permit">
                                        <b>{totalPermit}</b>
                                    </Descriptions.Item>
                                </Descriptions>
                            </div>
                        </div>
                        <div className='row mt-3'>
                            <div className='col-md-12'>
                                {Timesheet && Timesheet.approval_process.approval_key && (
                                    <>
                                        <div className="col-md-12 mb-2 ">
                                            <Collapse defaultActiveKey={['1']}>
                                                <Panel header="Approved Barcode" key="0">
                                                    <div className="row">
                                                        <div className="col-md-12 text-center">
                                                            <QRCodeSVG size={170} style={{ border: 1, borderRadius: 2, borderStyle: "solid", padding: 10 }} value={`https://www.farms-staging.brmapps.com/wf/approved/${Timesheet.approval_process.approval_key}`} />
                                                        </div>
                                                    </div>
                                                </Panel>
                                            </Collapse>
                                        </div>
                                    </>

                                )}
                            </div>
                        </div>

                        <div className='row'>
                            <div className="col-md-12 mb-3">
                                {
                                    Timesheet && Timesheet.comments.length > 0 && (
                                        <Collapse defaultActiveKey={['1']}>
                                            <Panel header="Comments" key="1">
                                                {
                                                    Timesheet && Timesheet.comments.map(data => {
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
                            <div className="col-md-12">
                                <Form size="small" disabled={Timesheet && Timesheet.approval_process.status === 'Reject' && true} onFinish={null} >
                                    <div className="table-responsive">
                                        {dateList && (
                                            <table
                                                className="table table-bordered table-striped ts-table"
                                            >
                                                <thead className="table-primary" id="theadp">
                                                    <tr>
                                                        <th rowSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>Date</th>
                                                        <th colSpan={7} style={{ textAlign: "center", background: "#c5eded" }}>Presence</th>
                                                        <th rowSpan={1} colSpan={4} style={{ verticalAlign: "middle", textAlign: "center", background: "#f0b1b1" }}>Absence</th>
                                                        <th rowSpan={2} colSpan={2} style={{ verticalAlign: "middle", textAlign: "center" }}>Note</th>
                                                    </tr>
                                                    <tr>
                                                        <th style={{ verticalAlign: "middle", textAlign: "center", background: "#c5eded" }}>BRM</th>
                                                        <th style={{ verticalAlign: "middle", textAlign: "center", background: "#c5eded" }}>CPM</th>
                                                        <th style={{ verticalAlign: "middle", textAlign: "center", background: "#c5eded" }}>GMI</th>
                                                        <th style={{ verticalAlign: "middle", textAlign: "center", background: "#c5eded" }}>LMR</th>
                                                        <th style={{ verticalAlign: "middle", textAlign: "center", background: "#c5eded" }}>DPM</th>
                                                        <th style={{ verticalAlign: "middle", textAlign: "center", background: "#c5eded" }}>SHS</th>
                                                        <th style={{ verticalAlign: "middle", textAlign: "center", background: "#c5eded" }}>Other</th>
                                                        <th style={{ verticalAlign: "middle", textAlign: "center", background: "#f0b1b1" }}>Permit</th>
                                                        <th style={{ verticalAlign: "middle", textAlign: "center", background: "#f0b1b1" }}>Leave</th>
                                                        <th style={{ verticalAlign: "middle", textAlign: "center", background: "#f0b1b1" }}>Sick</th>
                                                        <th style={{ verticalAlign: "middle", textAlign: "center", background: "#f0b1b1" }}>Weekend</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        dateList && (
                                                            dateList.map((item, i) => {

                                                                let backgroundColor = {};

                                                                if (get_week(item.ts_date_dtl) || filterByDate(moment(item.ts_date_dtl).format('YYYY-MM-DD'))) {
                                                                    backgroundColor = { backgroundColor: '#34A853', color: '#FFFFFF', height: 41 };
                                                                } else if (moment(item.ts_date_dtl).isBetween('2023-04-19', '2023-04-25', 'day', '[]')) {
                                                                    backgroundColor = { backgroundColor: '#F0B1B1', height: 41 };
                                                                } else {
                                                                    backgroundColor = { height: 41 };
                                                                }

                                                                return (
                                                                    <tr style={{ verticalAlign: 'middle', textAlign: 'center', ...backgroundColor }}>
                                                                        <td style={{ fontSize: 10, minWidth: 80, fontWeight: "bold", verticalAlign: "middle", textAlign: "center" }}>{moment(item.ts_date_dtl).format("MMM - DD")}</td>
                                                                        <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                                                                            <Form.Item className="form-item-ts" id={i + 'form-item-ts'}
                                                                            >
                                                                                <Radio.Group
                                                                                    size="small"
                                                                                    onChange={(event) =>
                                                                                        handleFormChange(i, event)
                                                                                    }
                                                                                    name="ts_loc_dtl"
                                                                                    value={item.ts_loc_dtl}
                                                                                >
                                                                                    <Radio
                                                                                        style={
                                                                                            (item.ts_date_dtl)
                                                                                                ? { color: "#FFFFFF" }
                                                                                                : filterByDate(moment(item.ts_date_dtl).format("YYYY-MM-DD"))
                                                                                                    ? { color: "#FFFFFF" }
                                                                                                    : (moment(item.ts_date_dtl).isSame('2023-04-19', 'day') || moment(item.ts_date_dtl).isSame('2023-04-25', 'day'))
                                                                                                        ? { color: "#999999", cursor: "not-allowed" }
                                                                                                        : {}
                                                                                        }
                                                                                        value={i + "_BRM"}
                                                                                        disabled={moment(item.ts_date_dtl).isBetween('2023-04-19', '2023-04-25', 'day', '[]')}
                                                                                    >
                                                                                    </Radio>
                                                                                </Radio.Group>
                                                                            </Form.Item>
                                                                        </td>
                                                                        <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                                                                            <Form.Item className="form-item-ts" id={i + 'form-item-ts-radio'}>
                                                                                <Radio.Group
                                                                                    onChange={(event) =>
                                                                                        handleFormChange(i, event)
                                                                                    }
                                                                                    name="ts_loc_dtl"
                                                                                    value={item.ts_loc_dtl}>

                                                                                    <Radio
                                                                                        style={
                                                                                            get_week(item.ts_date_dtl)
                                                                                                ? { color: "#FFFFFF" }
                                                                                                : filterByDate(
                                                                                                    moment(
                                                                                                        item.ts_date_dtl
                                                                                                    ).format("YYYY-MM-DD")
                                                                                                )
                                                                                                    ? { color: "#FFFFFF" }
                                                                                                    : {}
                                                                                        }
                                                                                        value={i + "_CPM"}
                                                                                    >
                                                                                    </Radio>
                                                                                </Radio.Group>
                                                                            </Form.Item>
                                                                        </td>
                                                                        <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                                                                            <Form.Item className="form-item-ts">
                                                                                <Radio.Group
                                                                                    onChange={(event) =>
                                                                                        handleFormChange(i, event)
                                                                                    }
                                                                                    name="ts_loc_dtl"
                                                                                    value={item.ts_loc_dtl}>
                                                                                    <Radio
                                                                                        style={
                                                                                            get_week(item.ts_date_dtl)
                                                                                                ? { color: "#FFFFFF" }
                                                                                                : filterByDate(
                                                                                                    moment(
                                                                                                        item.ts_date_dtl
                                                                                                    ).format("YYYY-MM-DD")
                                                                                                )
                                                                                                    ? { color: "#FFFFFF" }
                                                                                                    : {}
                                                                                        }
                                                                                        value={i + "_GMI"}
                                                                                    >
                                                                                    </Radio>
                                                                                </Radio.Group>
                                                                            </Form.Item>
                                                                        </td>
                                                                        <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                                                                            <Form.Item className="form-item-ts">
                                                                                <Radio.Group
                                                                                    onChange={(event) =>
                                                                                        handleFormChange(i, event)
                                                                                    }
                                                                                    name="ts_loc_dtl"
                                                                                    value={item.ts_loc_dtl}>
                                                                                    <Radio
                                                                                        style={
                                                                                            get_week(item.ts_date_dtl)
                                                                                                ? { color: "#FFFFFF" }
                                                                                                : filterByDate(
                                                                                                    moment(
                                                                                                        item.ts_date_dtl
                                                                                                    ).format("YYYY-MM-DD")
                                                                                                )
                                                                                                    ? { color: "#FFFFFF" }
                                                                                                    : {}
                                                                                        }
                                                                                        value={i + "_LMR"}
                                                                                    >
                                                                                    </Radio>
                                                                                </Radio.Group>
                                                                            </Form.Item>
                                                                        </td>
                                                                        <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                                                                            <Form.Item className="form-item-ts">
                                                                                <Radio.Group
                                                                                    onChange={(event) =>
                                                                                        handleFormChange(i, event)
                                                                                    }
                                                                                    name="ts_loc_dtl"
                                                                                    value={item.ts_loc_dtl}>
                                                                                    <Radio
                                                                                        style={
                                                                                            get_week(item.ts_date_dtl)
                                                                                                ? { color: "#FFFFFF" }
                                                                                                : filterByDate(
                                                                                                    moment(
                                                                                                        item.ts_date_dtl
                                                                                                    ).format("YYYY-MM-DD")
                                                                                                )
                                                                                                    ? { color: "#FFFFFF" }
                                                                                                    : {}
                                                                                        }
                                                                                        value={i + "_DPM"}
                                                                                    >
                                                                                    </Radio>
                                                                                </Radio.Group>
                                                                            </Form.Item>
                                                                        </td>
                                                                        <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                                                                            <Form.Item className="form-item-ts">
                                                                                <Radio.Group
                                                                                    onChange={(event) =>
                                                                                        handleFormChange(i, event)
                                                                                    }
                                                                                    name="ts_loc_dtl"
                                                                                    value={item.ts_loc_dtl}
                                                                                >
                                                                                    <Radio
                                                                                        style={
                                                                                            get_week(item.ts_date_dtl)
                                                                                                ? { color: "#FFFFFF" }
                                                                                                : filterByDate(
                                                                                                    moment(
                                                                                                        item.ts_date_dtl
                                                                                                    ).format("YYYY-MM-DD")
                                                                                                )
                                                                                                    ? { color: "#FFFFFF" }
                                                                                                    : {}
                                                                                        }
                                                                                        value={i + "_SHS"}
                                                                                    >
                                                                                    </Radio>
                                                                                </Radio.Group>
                                                                            </Form.Item>
                                                                        </td>
                                                                        <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                                                                            <Form.Item className="form-item-ts">
                                                                                <Radio.Group
                                                                                    onChange={(event) =>
                                                                                        handleFormChange(i, event)
                                                                                    }
                                                                                    name="ts_loc_dtl"
                                                                                    value={item.ts_loc_dtl}>
                                                                                    <Radio
                                                                                        style={
                                                                                            get_week(item.ts_date_dtl)
                                                                                                ? { color: "#FFFFFF" }
                                                                                                : filterByDate(
                                                                                                    moment(
                                                                                                        item.ts_date_dtl
                                                                                                    ).format("YYYY-MM-DD")
                                                                                                )
                                                                                                    ? { color: "#FFFFFF" }
                                                                                                    : {}
                                                                                        }
                                                                                        value={i + "_OTHER"}
                                                                                    >
                                                                                    </Radio>
                                                                                </Radio.Group>
                                                                            </Form.Item>
                                                                        </td>
                                                                        <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                                                                            {!get_week(item.ts_date_dtl) && !filterByDate(
                                                                                moment(item.ts_date_dtl).format(
                                                                                    "YYYY-MM-DD"
                                                                                )) ? (
                                                                                <Form.Item className="form-item-ts">
                                                                                    <Radio.Group
                                                                                        onChange={(event) =>
                                                                                            handleFormChange(i, event)
                                                                                        }
                                                                                        name="ts_reason_dtl"
                                                                                        value={item.ts_reason_dtl}>
                                                                                        <Radio
                                                                                            style={
                                                                                                get_week(item.ts_date_dtl)
                                                                                                    ? { color: "#FFFFFF" }
                                                                                                    : {}
                                                                                            }
                                                                                            value={i + "_PERMIT"}
                                                                                        >
                                                                                        </Radio>
                                                                                    </Radio.Group>
                                                                                </Form.Item>
                                                                            ) : (
                                                                                <></>
                                                                            )
                                                                            }
                                                                        </td>
                                                                        <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                                                                            {!get_week(item.ts_date_dtl) && !filterByDate(
                                                                                moment(item.ts_date_dtl).format(
                                                                                    "YYYY-MM-DD"
                                                                                )) ? (
                                                                                <Form.Item className="form-item-ts">
                                                                                    <Radio.Group
                                                                                        onChange={(event) =>
                                                                                            handleFormChange(i, event)
                                                                                        }
                                                                                        name="ts_reason_dtl"
                                                                                        value={item.ts_reason_dtl}>
                                                                                        <Radio
                                                                                            style={
                                                                                                get_week(item.ts_date_dtl)
                                                                                                    ? { color: "#FFFFFF" }
                                                                                                    : {}
                                                                                            }
                                                                                            value={i + "_LEAVE"}
                                                                                        >
                                                                                        </Radio>
                                                                                    </Radio.Group>
                                                                                </Form.Item>
                                                                            ) : (
                                                                                <></>
                                                                            )
                                                                            }
                                                                        </td>
                                                                        <td style={{ verticalAlign: "middle", textAlign: "center" }}>
                                                                            {!get_week(item.ts_date_dtl) && !filterByDate(
                                                                                moment(item.ts_date_dtl).format(
                                                                                    "YYYY-MM-DD"
                                                                                )) ? (
                                                                                <Form.Item className="form-item-ts">
                                                                                    <Radio.Group
                                                                                        onChange={(event) =>
                                                                                            handleFormChange(i, event)
                                                                                        }
                                                                                        name="ts_reason_dtl"
                                                                                        value={item.ts_reason_dtl}>
                                                                                        <Radio
                                                                                            style={
                                                                                                get_week(item.ts_date_dtl)
                                                                                                    ? { color: "#FFFFFF" }
                                                                                                    : {}
                                                                                            }
                                                                                            value={i + "_SICK"}
                                                                                        >
                                                                                        </Radio>
                                                                                    </Radio.Group>
                                                                                </Form.Item>
                                                                            ) : (
                                                                                <></>
                                                                            )
                                                                            }
                                                                        </td>
                                                                        <td style={{ verticalAlign: "middle", textAlign: "center" }}>

                                                                            {/* remove double weekend & public holiday */}
                                                                            {filterByDate(
                                                                                moment(item.ts_date_dtl).format(
                                                                                    "YYYY-MM-DD"
                                                                                )) && !get_week(item.ts_date_dtl) ? (
                                                                                <Form.Item className="form-item-ts">
                                                                                    <Radio.Group
                                                                                        onChange={(event) =>
                                                                                            handleFormChange(i, event)
                                                                                        }
                                                                                        name="ts_reason_dtl"
                                                                                        value={item.ts_reason_dtl}
                                                                                    >
                                                                                        <Radio
                                                                                            style={
                                                                                                get_week(item.ts_date_dtl)
                                                                                                    ? { color: "#FFFFFF" }
                                                                                                    : {}
                                                                                            }
                                                                                            value={i + "_HOLIDAY"}

                                                                                        >
                                                                                        </Radio>
                                                                                    </Radio.Group>
                                                                                </Form.Item>
                                                                            ) : (
                                                                                <></>
                                                                            )}
                                                                            {

                                                                                moment(item.ts_date_dtl).isSame("2023-03-22") || moment(item.ts_date_dtl).isSame("2023-03-23") ? (
                                                                                    <Form.Item className="form-item-ts">
                                                                                        <Radio.Group
                                                                                            onChange={(event) => handleFormChange(i, event)}
                                                                                            name="ts_reason_dtl"
                                                                                            value={item.ts_reason_dtl}
                                                                                        >
                                                                                            <Radio
                                                                                                style={{ color: "#FFFFFF" }}
                                                                                                value={i + "_HOLIDAY"}
                                                                                            />
                                                                                        </Radio.Group>
                                                                                    </Form.Item>
                                                                                ) : (
                                                                                    get_week(item.ts_date_dtl) && (
                                                                                        <Form.Item className="form-item-ts">
                                                                                            <Radio.Group
                                                                                                onChange={(event) => handleFormChange(i, event)}
                                                                                                name="ts_reason_dtl"
                                                                                                value={item.ts_reason_dtl}
                                                                                            >
                                                                                                <Radio
                                                                                                    style={{ color: "#FFFFFF" }}
                                                                                                    value={i + "_HOLIDAY"}
                                                                                                />
                                                                                            </Radio.Group>
                                                                                        </Form.Item>
                                                                                    )
                                                                                )
                                                                            }


                                                                        </td>
                                                                        <td style={{ width: 200, minWidth: 150, verticalAlign: "middle", textAlign: "center" }}>
                                                                            <Form.Item className="form-item-ts">
                                                                                <input
                                                                                    className="ant-input ant-input-sm"
                                                                                    type={"text"}
                                                                                    key={i + "-ts_note_dtl"}
                                                                                    onBlur={(event) => {
                                                                                        handleFormChange(i, event)
                                                                                    }}
                                                                                    placeholder={

                                                                                        (moment(item.ts_date_dtl).isBetween('2023-04-19', '2023-04-25', 'day', '[]') &&
                                                                                            (moment(item.ts_date_dtl).isBefore('2023-04-22') || moment(item.ts_date_dtl).isAfter('2023-04-23')))
                                                                                            ? "Cuti Bersama"
                                                                                            : filterByDate(moment(item.ts_date_dtl).format("YYYY-MM-DD"))

                                                                                    }
                                                                                    defaultValue={item.ts_note_dtl}
                                                                                    name="ts_note_dtl"
                                                                                    style={{
                                                                                        color: 'grey',
                                                                                        fontStyle: 'italic'
                                                                                    }}
                                                                                />
                                                                            </Form.Item>
                                                                        </td>
                                                                    </tr>
                                                                )
                                                            })
                                                        )
                                                    }
                                                </tbody>
                                            </table>
                                        )}
                                    </div>
                                </Form>
                                <Modal
                                    title="Write the reason"
                                    footer={null}
                                    visible={isModalVisible}
                                    onOk={null}
                                    onCancel={handleCancel}
                                >
                                    <Form
                                        name="basic"
                                        wrapperCol={{ span: 24 }}
                                        initialValues={{ remember: true }}
                                        onFinish={RejectTS}
                                        autoComplete="off"
                                        layout="vertical"
                                    >
                                        <Form.Item
                                            label=""
                                            name="message"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: "Please input your Message!",
                                                },
                                            ]}
                                        >
                                            <Input.TextArea
                                                showCount
                                                style={{ height: "150px", width: "100%" }}
                                                minLength={50}
                                            />
                                        </Form.Item>
                                        <Form.Item
                                            className="mt-3"
                                            wrapperCol={{
                                                xs: {
                                                    offset: 8, span: 18
                                                },
                                                sm: {
                                                    offset: 7, span: 18
                                                },
                                                lg: { offset: 8, span: 18 }
                                            }}

                                        >
                                            <Button type="primary" htmlType="submit">
                                                Submit
                                            </Button>
                                        </Form.Item>
                                    </Form>
                                </Modal>
                            </div>
                        </div>
                    </div>
                    {
                        Timesheet && Timesheet.approval_process.status === 'Waiting Approval' ? (
                            <div className="row mt-4">
                                <div className="col-md-12">
                                    <Form.Item className="text-center">
                                        <Button type="primary" onClick={() => ApprovedTS(Timesheet.approval_process.detail[0]._id)} className="m-3" size="middle" htmlType="submit">
                                            Approved
                                        </Button>
                                        <Button type="danger" size="middle" className="m-3" htmlType="submit" onClick={showModal}>
                                            Reject
                                        </Button>
                                    </Form.Item>
                                </div>
                            </div>
                        ) : (
                            (
                                <div className="row mt-4">
                                    <div className="col-md-12">
                                        <Form.Item className="text-center">
                                            <Button type="primary" size="middle" className="m-3" htmlType="submit" onClick={() => updateTStoServer()}>
                                                Update
                                            </Button>
                                        </Form.Item>
                                    </div>
                                </div>
                            )

                        )
                    }
                </CCardBody>
            </CCard>
        </>
    )
}

export default ViewTimesheet
