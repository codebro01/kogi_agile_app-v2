import React, { useState, useContext, useEffect, useCallback, memo } from 'react';
import {
    Container, useTheme, Typography, Table, Button, TableBody, TableCell,
    Select, MenuItem, TableContainer, TableHead, TableRow, Paper, Box, TextField, IconButton, Grid, InputLabel, Autocomplete,
} from '@mui/material';
import axios from 'axios';
import { resolvePath, useNavigate } from 'react-router-dom';
import EditIcon from "@mui/icons-material/Edit";
import { tokens } from '../theme.js';
import { PersonLoader } from './personLoader.jsx';
import { useAuth } from '../scenes/auth/authContext.jsx';
import { getNigeriaStates } from 'geo-ng';
import lgasAndWards from '../Lga&wards.json'
import DataTable from 'react-data-table-component';
import DeleteIcon from '@mui/icons-material/Delete';
import { useSelector, useDispatch } from 'react-redux';
import { deleteStudent, fetchStudents, fetchStudentsFromComponent, filterStudents, resetStudentsData, setRowsPerPage, setPage, setCurrentPage, setSearchQuery, setStudents } from './studentsSlice.js';
import { fetchSchools } from './schoolsSlice.js';
import { SpinnerLoader } from './spinnerLoader.jsx';
import { exportToCSV } from './exportToCSV.jsx';







// Import context




export const ViewPaymentsRecords = () => {
    const { userPermissions } = useAuth();
    const theme = useTheme();
    const colors = tokens(theme.palette.mode)
    // const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(100); // Number of students per page
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const schoolsState = useSelector((state) => state.schools);
    const studentsState = useSelector((state) => state.students);
    const { data: schoolsData, loading: schoolsLoading, error: schoolsError } = schoolsState;
    const { currentPage, rowsPerPage, data, filteredStudents: studentsData, loading: studentsLoading, error: studentsError, searchQuery } = studentsState;
    // useEffect(() => {

    //     dispatch(fetchSchools());
    // }, [dispatch]);

    // useEffect(() => {
    //     dispatch(fetchStudents({ page: currentPage, limit: rowsPerPage }));
    // }, [dispatch, currentPage, rowsPerPage]);

    // const [filterLoading, setFilterLoading] = useState(false);
    const schools = schoolsData;
    const [schoolOptions, setSchoolOptions] = useState([]); // Start with an empty array
    const [hasMore, setHasMore] = useState(true); // To check if more data is available
    const [loadingSchools, setLoadingSchools] = useState(false); // Loading state for schools
    const [filterError, setFilterError] = useState(null);
    const [statesData, setStatesData] = useState([]);
    const [lgasData, setLgasData] = useState([]);
    const [enumeratorsData, setEnumeratorsData] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(false)
    const [enumeratorsLoading, setEnumeratorsLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filteredData, setFilteredData] = useState([]); // State for filtered data
    const [paymentsData, setPaymentData] = useState([]); // State for filtered data
    const [totalRows, setTotalRows] = useState([]); // State for filtered data
    const [apiResp, setApiResp] = useState([]); // State for filtered data
    const [fetchAttendanceLoading, setFetchAttendanceLoading] = useState(false);
    const [totalAmountPaid, setTotalAmountPaid] = useState(0);
    const [totalStudentsPaidByFilter, setTotalStudentsPaidByFilter] = useState(0);

    







    const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`
    const token = localStorage.getItem('token') || '';
    const [filters, setFilters] = useState({
        ward: '',
        presentClass: '',
        LGA: '',
        schoolName: '',
        year: "",
        month: "",
        paymentStatus: "",
        paymentType: "",
        totalAttendanceScore: "",
        bankName: "",
        amount: "",
        limit: '',
        page: '',
        dateFrom: '', 
        dateTo: '',
    });








    const params = {
        ward: filters.ward,
        presentClass: filters.presentClass,
        LGA: filters.LGA,
        schoolName: filters.schoolName,
        bankName: filters.bankName,
        paymentStatus: filters.paymentStatus,
        paymentType: filters.paymentType,
        amount: filters.amount,
        year: filters.year,
        month: filters.month,
        totalAttendanceScore: filters.totalAttendanceScore,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,

    }
    const filteredParams = Object.entries(params)
        .filter(([_, value]) => value != null && value !== '') // Filter out empty values
        .reduce((acc, [key, value]) => {
            acc[key] = value;  // Directly add each key-value pair to the accumulator
            return acc;
        }, {})


    const sortParam = {
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
    };


    const registrationYearOptions = [{ year: '2024' }, { year: '2025' }, { year: '2026' }, { year: '2027' }, { year: '2028' }, { year: '2029' },]
    const monthOptions = [
        { name: 'January', value: 1 },
        { name: 'February', value: 2 },
        { name: 'March', value: 3 },
        { name: 'April', value: 4 },
        { name: 'May', value: 5 },
        { name: 'June', value: 6 },
        { name: 'July', value: 7 },
        { name: 'August', value: 8 },
        { name: 'September', value: 9 },
        { name: 'October', value: 10 },
        { name: 'November', value: 11 },
        { name: 'December', value: 12 },
    ];


    const fetchAttendance = async () => {
        try {
            const token = localStorage.getItem('token');
            setEnumeratorsLoading(true);
            setFetchAttendanceLoading(true)
            const response = await axios.get(`${API_URL}/payments/view-payments`, {
                headers: {
                    Authorization: `Bearer ${token}`,

                },
                params: { ...filteredParams },
                withCredentials: true,
            });
            const { getAllPaymentsRecords, totalPayments, amountSum } = response.data;
            setPaymentData(getAllPaymentsRecords);
            setTotalAmountPaid(amountSum[0]?.totalAmount)
            setTotalStudentsPaidByFilter(totalPayments)
            setTotalRows(response.data.totalPayments)
            setFetchAttendanceLoading(false)            
            setTimeout(() => setApiResp(''), 6000)

        }
        catch (err) {
            console.log(err)
            setFetchAttendanceLoading(false);
            setApiResp(err.response?.message || err.response?.data?.message)
            setTimeout(()=> setApiResp(''), 6000)
        }

    }

    function formatWithCommas(number = 0) {
        return number.toLocaleString();
    }
   

  
    // ! Nationality state and local government data set up



    const clearFilters = () => {
        setFilters({
            ward: '',
            presentClass: '',
            sortBy: '',
            lga: '',
            schoolId: '',
        });
        // setStudentsData(studentsData);
    };

    // useEffect(() => {
    //     dispatch(resetStudentsData())
    // }, [clearFilters])

    const classOptions = [
        { class: "Primary 6", id: 1 },
        { class: "JSS 1", id: 2 },
        { class: "JSS 3", id: 3 },
        { class: "SSS 1", id: 4 },
    ];

    const paymentTypeOption = [
        { name: "Registration", value: "Registration" },
        { name: "Transition", value: "Transition" },
        { name: "Registration + Transition", value: "Registration and Transition" },
        { name: "Second Term", value: "Second Term" },
        { name: "Third Term", value: "Third Term" },
    ]


    // useEffect(() => {
    //     (async () => {
    //         try {
    //             setFetchLoading(true);
    //             const response = await axios.get(`${API_URL}/student/admin-view-all-students`, {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //                 // params: { ...filteredParams, ...sortParam },
    //                 withCredentials: true,
    //             })


    //         } catch (error) {
    //             setFilterError(error?.response?.statusText)
    //         }
    //     })()
    // }, [])


    // const fetchStudentsFromComponent = async () => {


    //     try {
    //         setFetchLoading(true);
    //         const response = await axios.get(`${API_URL}/student/admin-view-all-students`, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`,
    //             },
    //             params: { ...filteredParams, ...sortParam },
    //             withCredentials: true,

    //         })
    //         console.log(response);
    //         dispatch(setStudents(response.data.students))

    //     } catch (error) {
    //         setFilterError(error?.response?.statusText)
    //     }
    // }




    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => {
            const updatedFilters = {
                ...prevFilters,
                [name]: value,
            };
            return updatedFilters;
        });
    }, []);


    const handleSubmit = (e) => {
        e.preventDefault();
        fetchAttendance()

    };

    // const handleEdit = (student) => {
    //     navigate(`/admin-dashboard/update-student/${student._id}`, { state: student })
    // };

    // console.log(filters);



    // const handleDelete = (row) => {
    //     // Replace this with your actual delete logic, such as making an API request to delete the record
    //     const confirmDelete = window.confirm(`Are you sure you want to delete ${row.firstname} ${row.surname}?`);

    //     if (confirmDelete) {
    //         try {
    //             (async () => {
    //                 try {
    //                     dispatch(deleteStudent(row.randomId)).unwrap();
    //                 }
    //                 catch (err) {
    //                     console.log(err)
    //                 }

    //             })()

    //             // Optionally, you can refresh or re-fetch the data here
    //         } catch (error) {
    //             console.error("Error deleting student:", error);
    //         }
    //     }
    // };

    const customStyles = {
        rows: {
            style: {
                marginBottom: '20px', // Adds spacing between rows
            },
        },

        header: {
            style: {
                justifyContent: 'center', // Centers the title
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '20px',
                color: '#4A4A4A', // Optional styling for the title color
                padding: '10px',
                display: "none"
            },
        },
    };


    const columns = [
        {
            name: 'S/N',
            selector: (row, index) => index + 1, // Calculate serial number (starting from 1)
            sortable: true,
        },
        // {
        //     name: 'Image',
        //     cell: (row) => (
        //         <img
        //             src={row.passport} // Placeholder for missing images
        //             alt="Student"
        //             style={{ width: '50px', height: '50px' }}
        //         />
        //     ),
        //     sortable: false,
        // },
        {
            name: 'View',
            cell: (row) => (
                <Typography
                    onClick={() => handleViewItem(row)}
                    sx={{
                        padding: '5px 10px',
                        backgroundColor: '#196b57',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 700,
                    }}
                >
                    View
                </Typography>
            ),
        },

        {
            name: 'Surname',
            selector: row => row.surname,
            sortable: true,
        },
        {
            name: 'Firstname',
            selector: row => row.firstname,
            sortable: true,
        },
        {
            name: 'Middlename',
            selector: row => row.middlename,
            sortable: true,
        },
        {
            name: 'Present Class',
            selector: row => row.class,
            sortable: true,
        },
        {
            name: 'Payment Status',
            selector: row => row.paymentStatus,
            sortable: true,
        },
        {
            name: 'Amount',
            selector: row => row.amount,
            sortable: true,
        },
        {
            name: 'Month',
            selector: row => row.month,
            sortable: true,
        },
        {
            name: 'Year',
            selector: row => row.year,
            sortable: true,
        },
        {
            name: 'School Name',
            selector: row => row.schoolName,
            sortable: true,
        },
        {
            name: 'LGA of Enrollment',
            selector: row => row.LGA,
            sortable: true,
        },
        {
            name: 'Ward',
            selector: row => row.ward,
            sortable: true,
        },
        {
            name: 'Month Attendance Score',
            selector: row => row.totalAttendanceScore,
            sortable: true,
        },


      

        // (userPermissions.includes('handle_registrars')) && {
        //     name: 'Delete',
        //     cell: (row) => (
        //         <button
        //             onClick={() => handleDelete(row)}
        //             style={{
        //                 padding: '5px 10px',
        //                 backgroundColor: 'transparent', // Optional: color for the delete button
        //                 color: '#fff',
        //                 border: 'none',
        //                 borderRadius: '5px',
        //                 cursor: 'pointer',
        //                 display: 'flex',
        //                 alignItems: 'center',
        //             }}
        //         >
        //             <DeleteIcon style={{ marginRight: '8px', color: "red" }} />
        //         </button>
        //     ),
        // },

    ];

    const handleViewItem = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleSearch = (event) => {
        const query = event.target.value;
        dispatch(setSearchQuery(query));
    };

    const uniqueSchools = Array.from(
        new Set(
            studentsData.map(student => JSON.stringify({
                schoolName: student.schoolId?.schoolName,
                schoolId: student.schoolId?._id,
            }))
        )
    ).map(item => JSON.parse(item));

    const getCurrentYear = () => new Date().getFullYear();
    const currentYear = getCurrentYear();




    // console.log(studentsData)

    return (
        <>
            {userPermissions.includes('handle_registrars') || userPermissions.includes('handle_payments') ? (
                <Container maxWidth="lg" sx={{ marginTop: 4, marginBottom: "50px" }}>
                    <Typography
                        variant="h3"
                        component="h1"
                        gutterBottom
                        textAlign="center"
                        sx={{ fontWeight: 'bold' }}
                    >
                        View & Export Payments Records
                    </Typography>

                    {/* Filter Form */}
                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        display="flex"
                        flexDirection="column"
                        gap={2}
                        p={3}
                        sx={{
                            backgroundColor: "#f9f9f9",
                            borderRadius: 2,
                            boxShadow: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                            Filter Payments
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                            {/* Existing Fields */}

                            <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="lga-label" sx={{ marginBottom: 1 }}>Select a School</InputLabel>
                                <Select
                                    name="schoolName"
                                    value={filters.schoolName}
                                    onChange={handleInputChange}
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                    labelId="school-label"
                                >
                                    <MenuItem value="">
                                        <em>All Schools</em>
                                    </MenuItem>
                                    {uniqueSchools.map((school) => (
                                        <MenuItem key={school.schoolName} value={school.schoolName}>
                                            {school.schoolName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>


                            <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="lga-label" sx={{ marginBottom: 1 }}>All LGA</InputLabel>
                                <Select
                                    name="LGA"
                                    value={filters.LGA}
                                    onChange={handleInputChange}
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                    labelId="lga-label"
                                >
                                    <MenuItem value="">
                                        <em>All LGA</em>
                                    </MenuItem>
                                    {lgasAndWards.map((lga) => (
                                        <MenuItem key={lga.name} value={lga.name}>
                                            {lga.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="ward-label" sx={{ marginBottom: 1 }}>Select Ward</InputLabel>
                                <Select
                                    name="ward"
                                    value={filters.ward}
                                    onChange={handleInputChange}
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                    labelId="ward-label"
                                >
                                    <MenuItem value="">
                                        <em>All Wards</em>
                                    </MenuItem>
                                    {lgasAndWards
                                        ?.flatMap((lga) => lga.wards) // Flatten all wards into a single array
                                        .sort((a, b) => a.localeCompare(b)) // Sort the array alphabetically
                                        .map((ward, index) => (
                                            <MenuItem key={index} value={ward}>
                                                {ward}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </Grid>


                            <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="class-label" sx={{ marginBottom: 1 }}>Present Class</InputLabel>
                                <Select
                                    name="presentClass"
                                    value={filters.presentClass}
                                    onChange={handleInputChange}
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                    labelId="class-label"
                                >
                                    <MenuItem value="">
                                        <em>All Class</em>
                                    </MenuItem>
                                    {classOptions?.map((option) => (
                                        <MenuItem key={option.id} value={option.class}>
                                            {option.class}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>

                            <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="year-label" sx={{ marginBottom: 1 }}>Select month</InputLabel>
                                <Select
                                    name="month"
                                    value={filters.month || ''}
                                    onChange={handleInputChange}
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                    labelId="month-label"
                                >
                                    <MenuItem value="">
                                        <em>All Months</em>
                                    </MenuItem>
                                    {monthOptions?.map((month, index) => (
                                        <MenuItem key={index} value={month.value}>
                                            {month.name}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid>


                            {/* New Fields */}

                            {/* <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="enumerator-label" sx={{ marginBottom: 1 }}>All Enumerator</InputLabel>
                                <Select
                                    name="enumerator"
                                    value={filters.enumerator || ''}
                                    onChange={handleInputChange}
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                    labelId="enumerator-label"
                                >
                                    <MenuItem value="">
                                        <em>All Enumerators</em>
                                    </MenuItem>
                                    {enumeratorsData?.map((enumerator) => (
                                        <MenuItem key={enumerator._id} value={enumerator._id}>
                                            {enumerator.fullName}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid> */}



                            <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="year-label" sx={{ marginBottom: 1 }}>Year</InputLabel>
                                <Select
                                    name="year"
                                    value={filters.year}
                                    onChange={handleInputChange}
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                    labelId="year-label"
                                >
                                    <MenuItem value={currentYear}>
                                        {getCurrentYear()}
                                    </MenuItem>
                                </Select>
                            </Grid>


                            <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="paymentStatus-label" sx={{ marginBottom: 1 }}>All Banks</InputLabel>
                                <Select
                                    name="bankName"
                                    value={filters.bankName}
                                    onChange={handleInputChange}
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                    labelId="paymentStatus-label"
                                >
                                    <MenuItem value="">Select Bank</MenuItem>
                                    <MenuItem value="FCMB">FCMB</MenuItem>
                                    <MenuItem value="Polaris Bank">Polaris Bank</MenuItem>
                                    <MenuItem value="Zenith Bank">Zenith Bank</MenuItem>

                                </Select>
                            </Grid>


                            {/* <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="paymentStatus-label" sx={{ marginBottom: 1 }}>Payment Status</InputLabel>
                                <Select
                                    name="paymentStatus"
                                    value={filters.paymentStatus}
                                    onChange={handleInputChange}
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                    labelId="paymentStatus-label"
                                >
                                    <MenuItem value=''>
                                        Select Payment Status
                                    </MenuItem>
                                    <MenuItem value='1'>
                                        Paid
                                    </MenuItem>
                                    <MenuItem value='0'>
                                        Not Paid
                                    </MenuItem>

                                </Select>
                            </Grid> */}


                            <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="paymentType-label" sx={{ marginBottom: 1 }}>Payment Type</InputLabel>
                                <Select
                                    name="paymentType"
                                    value={filters.paymentType}
                                    onChange={handleInputChange}
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                    labelId="paymentType-label"
                                >
                                    <MenuItem value=''>
                                        All Payment Type
                                    </MenuItem>
                                    {paymentTypeOption.map((paymentType, index) =>( 
                                    <MenuItem value= {paymentType.value} key = {index+1}>
                                        {paymentType.name}
                                    </MenuItem>
                                    ))}

                                </Select>
                            </Grid>


                            <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="payment-label" sx={{ marginBottom: 1 }}>Type Amount</InputLabel>
                                <TextField
                                    name={"amount"}
                                    variant="outlined"
                                    fullWidth
                                    value={filters.amount}
                                    onChange={handleInputChange}
                                    inputProps={{
                                        pattern: "\\d*", // Allows any number of digits
                                        title: "Only digits are allowed", // Shows this message on invalid input
                                    }}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
                                    }}
                                    InputProps={{
                                        sx: {
                                            height: "38px", // Controls the height of the inner input field
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: "38px", // Adjusts the overall height of the input box
                                        },
                                    }}
                                />
                            </Grid>


                            <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="payment-label" sx={{ marginBottom: 1 }}>Type Attendance Score</InputLabel>
                                <TextField
                                    name={"totalAttendanceScore"}
                                    variant="outlined"
                                    fullWidth
                                    value={filters.totalAttendanceScore}
                                    onChange={handleInputChange}
                                    inputProps={{
                                        pattern: "\\d*", // Allows any number of digits
                                        title: "Only digits are allowed", // Shows this message on invalid input
                                    }}
                                    onInput={(e) => {
                                        e.target.value = e.target.value.replace(/\D/g, ""); // Remove non-digit characters
                                    }}
                                    InputProps={{
                                        sx: {
                                            height: "38px", // Controls the height of the inner input field
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: "38px", // Adjusts the overall height of the input box
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md = {4}>
                                <InputLabel id="date-label" sx={{ marginBottom: 1 }}>Start Date</InputLabel>

                                <TextField
                                    label="Date From"
                                    name="dateFrom"
                                    type="date"
                                    variant="outlined"
                                    fullWidth
                                    value={filters.dateFrom}
                                    onChange={handleInputChange}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        sx: {
                                            height: "38px", // Controls the height of the inner input field
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: "38px", // Adjusts the overall height of the input box
                                        },
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6} md = {4}>
                                <InputLabel id="date-label" sx={{ marginBottom: 1 }}>End Date</InputLabel>

                                <TextField
                                    label="Date To"
                                    name="dateTo"
                                    type="date"
                                    variant="outlined"
                                    fullWidth
                                    value={filters.dateTo}
                                    onChange={handleInputChange}
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        sx: {
                                            height: "38px", // Controls the height of the inner input field
                                        },
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            height: "38px", // Adjusts the overall height of the input box
                                        },
                                    }}
                                />
                            </Grid>




                        </Grid>


                        <Box display="flex" justifyContent="space-between" gap={2} mt={2}>
                            <Button
                                variant="outlined"
                                color="secondary"
                                size="large"
                                sx={{ textTransform: "none", width: '48%' }}
                                onClick={clearFilters}
                            >
                                Reset Filters
                            </Button>
                            {!fetchAttendanceLoading ? (<Button
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{
                                    textTransform: "none",
                                    width: '48%',
                                    color: "#fff",
                                    background: colors.main['darkGreen'],
                                    '&:hover': {
                                        backgroundColor: '#145943', // Slightly darker shade on hover
                                    },
                                }}
                            >
                                Filter Payment Records
                            </Button>) : <SpinnerLoader/>}

                            
                            { paymentsData.length > 0 && (
                                <Button
                                    onClick={() => exportToCSV(paymentsData, 'Students Payment Record')}
                                    variant="contained"
                                    size="large"
                                    sx={{
                                        textTransform: "none",
                                        width: '48%',
                                        color: "#fff",
                                        background: colors.main['darkGreen'],
                                        '&:hover': {
                                            backgroundColor: '#145943', // Slightly darker shade on hover
                                        },
                                    }}
                                >
                                    Export Records
                                </Button>
                            )}
                            
                        </Box>

                        {filterError && (
                            <Typography>
                                {filterError}
                            </Typography>
                        )}
                    </Box>

                    <Grid item xs={12} sm={6} md={4} sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        marginTop: "50px",
                        flexDirection: "column",
                        gap: "10px",
                        boxShadow: "0 4px 8px rgba(25, 107, 87, 0.3)",
                        backgroundColor: "white",
                        padding: "20px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        transition: "box-shadow 0.3s ease, transform 0.3s ease",
                        "&:hover": {
                            boxShadow: "0 6px 12px rgba(25, 107, 87, 0.4)",
                            transform: "translateY(-5px)"
                        }
                    }}>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                        }}>
                            <Typography variant='h4' sx={{ fontWeight: 700, color: "#196b57" }}>
                                Total Amount Disbursed based on Filter:
                            </Typography>
                            <Typography variant='h4' sx={{ fontWeight: 700, color: "#196b57" }}>
                                {`\u20A6 ${formatWithCommas(totalAmountPaid)}`}
                            </Typography>
                        </Box>

                        <Box sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "row",
                            gap: "10px"
                        }}>
                            <Typography variant='h4' sx={{ fontWeight: 700, color: "#196b57" }}>
                                Total Students:
                            </Typography>
                            <Typography variant='h4' sx={{ fontWeight: 700, color: "#196b57" }}>
                                {totalStudentsPaidByFilter}
                            </Typography>
                        </Box>
                    </Grid>


                    <Typography variant='h4' sx={{
                        marginTop: "100px",
                        marginBottom: "30px",
                        textAlign: "center",
                        fontWeight: 800
                    }}>
                        View  Payments Record
                    </Typography>
                    <div>
                        {/* Search Input */}
                        {/* <div style={{ marginBottom: '20px', position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearch}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    fontSize: '16px',
                                    color: '#333',
                                    backgroundColor: '#f9f9f9',
                                    border: '1px solid #ddd',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                    outline: 'none',
                                    transition: 'box-shadow 0.2s ease-in-out',
                                }}
                                onFocus={(e) => (e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)')}
                                onBlur={(e) => (e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)')}
                            />

                        </div> */}
                    </div>



                    <DataTable
                        title="View Registered Students Information"
                        columns={columns}
                        data={paymentsData}
                        progressPending={studentsLoading} // Show loading spinner
                        pagination
                        paginationServer
                        highlightOnHover
                        paginationDefaultPage = {100}
                        paginationPerPage={rowsPerPage} // Override default rows per page
                        
                        paginationRowsPerPageOptions={[10, 100, 200, 500]} // Custom options

                        paginationTotalRows={totalRows} // Total rows from API
                        // paginationDefaultPage={currentPage} // Use current page from Redux
                        onChangePage={(page) => {
                             setFilters((prev) => (
                                { ...prev, ['page']: page }
                            ))

                            fetchAttendance();
                        }}
                        
                        onChangeRowsPerPage={(newLimit) => {
                            // Update rowsPerPage in Redux state and fetch new data
                            setFilters((prev) => (
                                {...prev, ['limit']: newLimit}
                            ))
                            
                            fetchAttendance();

                        }}
                        customStyles={customStyles} // Applying the custom styles


                    />


                    {isModalOpen && (
                        <div
                            style={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "100vw",
                                height: "100vh",
                                backgroundColor: "rgba(0, 0, 0, 0.52)", // Semi-transparent black overlay
                                zIndex: 9999,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            <div
                                style={{
                                    position: "relative",
                                    backgroundColor: "#fff",
                                    padding: "20px",
                                    borderRadius: "10px",
                                    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                                    width: "80%",
                                    maxWidth: "500px",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "flex-start",
                                    justifyContent: "flex-start",
                                }}
                            >
                                <h3>Student Payment Details</h3>
                                <p><strong>Student ID:</strong> {selectedItem.studentRandomId}</p>
                                <p><strong>Name:</strong> {`${selectedItem.surname} ${selectedItem.firstname} ${selectedItem.middlename || ''}`}</p>
                                <p><strong>School name:</strong> {selectedItem.schoolName}</p>
                                <p><strong>Payment Status:</strong> {selectedItem.paymentStatus}</p>
                                <p><strong>Amount:</strong> {selectedItem.amount}</p>
                                <p><strong>Bank Name:</strong> {selectedItem.bankName}</p>
                                <p><strong>Ward:</strong> {selectedItem.ward}</p>
                                <p><strong>Class:</strong> {selectedItem.class}</p>
                                <p><strong>Cummulated Attendance Score:</strong> {selectedItem.totalAttendanceScore}</p>
                                <p><strong>Month:</strong> {selectedItem.month}</p>
                                <p><strong>Year:</strong> {selectedItem.year}</p>

                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    style={{
                                        padding: "5px 10px",
                                        backgroundColor: "#dc3545",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "5px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                   



                </Container>
            ) : (
                <h1>Not authorized to access this route</h1>
            )}
        </>
    );
};
