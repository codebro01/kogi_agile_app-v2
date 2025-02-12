import { useContext, useEffect, useCallback } from "react";
import axios from 'axios';
import { StudentsContext } from "../../components/dataContext";
import { Grid, Box, MenuItem, Select, InputLabel, Typography } from "@mui/material";
import { useState } from "react";
import { ExportSubmitButton } from "../../components/exportButton";
import { SpinnerLoader } from "../../components/spinnerLoader";

export const ImportPaymentSheet = () => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`
    const [totalUploads, setTotalUploads] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        month: '',
        week: '',
        attendanceSheet: null,
        year: '',
        paymentType: "",
    });




    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');

            const response = await axios.post(`${API_URL}/student/upload-payment-sheet`, formData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data',  // Set the correct content type for file upload
                },
                withCredentials: true,
            });
            setMessage(response.data.message);
            setIsSubmitting(false);
            setSuccess(true);
            setTotalUploads(response.data.totalInserted);
            setTimeout(() => setMessage(''), 7000)
        } catch (error) {
            setError(true)
            setIsSubmitting(false);
            console.log(error);
            setMessage(error?.response?.data?.message);
            setTimeout(() => setMessage(''), 7000)

        }
    }


    const weekOptions = [{ name: "week 1", value: 1 }, { name: "week 2", value: 2 }, { name: "week 3", value: 3 }, { name: "week 4", value: 4 }, { name: "week 5", value: 5 }]

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

    const paymentTypeOption = [
        { name: "Registration", value: "Registration" },
        { name: "Transition", value: "Transition" },
        { name: "Registration + Transition", value: "Registration and Transition" },
        { name: "Second Term", value: "Second Term" },
        { name: "Third Term", value: "Third Term" },
    ]
    const getCurrentYear = () => new Date().getFullYear();


    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === "file") {
            // Handle file input
            setFormData({
                ...formData,
                [name]: files[0] || null,  // Store the first selected file or null if no file
            });
        } else {
            // Handle other inputs
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    // const handleFileChange = (event) => {
    //     const file = event.target.files[0];

    // };  

    // console.log(formData)

    // console.log(message)






    return (
        <Box
            component={'form'}
            onSubmit={handleSubmit}
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
                flexDirection: "column",
                gap: "40px"

            }}
        >
            <Typography
                sx={{
                    fontSize: 20,
                    fontWeight: "bold",
                    marginBottom: "20px"
                }}
            >Import Payment Sheet</Typography>

            {/* Select payment type */}
             <Grid item xs={12} sm={6} md = {4}
                sx={{
                    width: {
                        xs: '90%',
                        sm: "70%",
                        md: "40%"
                    },
                }}
             
             >
             
                    <Select
                        name="paymentType"
                        value={formData.paymentType}
                        onChange={(e) => handleInputChange(e, { name: 'paymentType' })}
                        displayEmpty
                        fullWidth
                        size="medium"
                        required
                        labelId="payment-type-label"
                        // sx={{
                        //     borderRadius: 2,
                        //     '& .MuiOutlinedInput-root': {
                        //         '& fieldset': { borderColor: '#4caf50', height: "40px" },
                        //         '&:hover fieldset': { borderColor: '#2e7d32' },
                        //         '&.Mui-focused fieldset': { borderColor: '#1b5e20', borderWidth: 2 },
                        //     },
                        // }}
                    sx={{
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                            height: '45px', // Adjust height of the Select component
                            '& fieldset': { borderColor: '#4caf50' },
                            '&:hover fieldset': { borderColor: '#2e7d32' },
                            '&.Mui-focused fieldset': { borderColor: '#1b5e20', borderWidth: 2 },
                        },
                        '& .MuiInputBase-input': {
                            height: '100%', // Ensures input text aligns correctly
                            padding: '12px', // Adjusts padding inside the select
                        },
                    }}
                    >
                        <MenuItem value="">
                            <em>Select Payment Type</em>
                        </MenuItem>
                        {paymentTypeOption.map((paymentType, index) => (
                            <MenuItem key={index} value={paymentType.value}>
                                {paymentType.name}
                            </MenuItem>
                        ))}
                    </Select>
                </Grid> 

            <Grid item xs={12} sm={6} md={4}
                sx={{
                    width: {
                        xs: '90%',
                        sm: "70%",
                        md: "40%"
                    },
                }}
            >
                <InputLabel id="month-label">Select Month</InputLabel>
                <Select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    displayEmpty
                    fullWidth
                    size="small"
                    required
                    labelId="month-label"
                >
                    <MenuItem value="">
                        <em>Select Month</em>
                    </MenuItem>
                    {monthOptions.map((week, index) => (
                        <MenuItem key={index} value={week.value}>
                            {week.name}
                        </MenuItem>
                    ))}
                </Select>
            </Grid>


            <Grid item xs={12} sm={6} md={4}
                sx={{
                    width: {
                        xs: '90%',
                        sm: "70%",
                        md: "40%"
                    },
                }}
            >
                <InputLabel id="year-label">Select Year</InputLabel>
                <Select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    displayEmpty
                    fullWidth
                    required
                    size="small"
                    labelId="attendanceSheet-label"
                >
                    <MenuItem value={getCurrentYear()} >
                        {getCurrentYear()}
                    </MenuItem>
                </Select>
            </Grid>


            <Grid
                item
                xs={12}
                sm={6}
                md={4}
                sx={{
                    width: {
                        xs: '90%',
                        sm: "70%",
                        md: "40%"
                    },
                }}
            >
                <InputLabel htmlFor="file-upload">Select File</InputLabel>
                <input
                    type="file"
                    id="file"
                    name="file"
                    accept=".xlsx, .xls" // Restricts to Excel files
                    required
                    onChange={handleInputChange} // Function to handle the selected file
                    style={{ display: 'block', marginTop: '8px', width: '100%' }}
                />
            </Grid>

            <Grid style={{ textAlign: 'center', marginTop: '20px' }}>

                {!isSubmitting ? (<ExportSubmitButton label="Upload Attendance Sheet" />) : <SpinnerLoader />}


            </Grid>

            {error &&
                <Typography
                    sx={{
                        color: "red",
                    }}
                >
                    <>

                        {message}
                    </>
                </Typography>
            }
            {success &&
                <Typography
                    sx={{
                        color: "red",
                    }}
                >
                    <>

                        {message}
                    </>
                </Typography>
            }
        </Box>
    )
}
