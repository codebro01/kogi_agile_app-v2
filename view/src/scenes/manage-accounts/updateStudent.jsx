import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useLocation, useFetcher } from 'react-router-dom';
import { TextField, Button, Grid, Container, Autocomplete, Typography, Box, MenuItem, FormControl, InputLabel, Select } from '@mui/material';
// import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import { getNigeriaStates } from 'geo-ng';
import { SchoolsContext } from "../../components/dataContext.jsx";
import { SpinnerLoader } from '../../components/spinnerLoader.jsx';
import lgasAndWards from '../../Lga&wards.json';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchools } from '../../components/schoolsSlice.js';


axios.defaults.withCredentials = true;

export const UpdateStudent = () => {

    // const { loading, schoolsData } = useContext(SchoolsContext);
    const location = useLocation()
    const student = location.state;

    const schoolsState = useSelector(state => state.schools)
    const { data: schoolsData, loading, error: fetchSchoolError } = schoolsState

    const [occupations, setOccupation] = useState([
        'Farmer', 'Teacher', "Trader", 'Mechanic', 'Tailor', 'Bricklayer', 'Carpenter', 'Doctor', 'Lawyer', 'Butcher', 'Electrician', 'Clergyman', 'Barber', 'Hair Dresser', 'Others'
    ])

    const dispatch = useDispatch();



    useEffect(() => {
        dispatch(fetchSchools());
    }, [dispatch])

    const navigate = useNavigate();


    const inputDate = student.dob; // Input in dd-mm-yy format
    const [day, month, year] = inputDate.split("-");

    // Add '20' to the year if it's a two-digit year
    const fullYear = year.length === 2 ? `20${year}` : year;

    // Format the date as yyyy-mm-dd (ISO format)
    const formattedDate = `${fullYear}-${month}-${day}`;

    // Convert to Date object

    // Convert to timestamp (milliseconds since January 1, 1970)



    const [formData, setFormData] = useState({
        schoolId: student.schoolId._id,
        ward: student.ward,
        surname: student.surname,
        firstname: student.firstname,
        middlename: student.middlename,
        studentNin: student.studentNin,
        dob: `${formattedDate}`,
        nationality: student.nationality,
        stateOfOrigin: student.stateOfOrigin,
        lga: student.lga,
        gender: student.gender,
        communityName: student.communityName,
        residentialAddress: student.residentialAddress,
        presentClass: student.presentClass,
        yearAdmitted: student.yearAdmitted,
        classAtEnrollment: student.classAtEnrollment,
        yearOfEnrollment: student.yearOfEnrollment,
        lgaOfEnrollment: student.lgaOfEnrollment,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentNin: student.parentNin,
        parentContact: student.parentContact,
        parentOccupation: student.parentOccupation,
        bankName: student.bankName,
        accountNumber: student.accountNumber,
        image: null,
    });
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(false)
    const [validationError, setValidationError] = useState('');
    const [errors, setErrors] = useState({});
    const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`
    const [states, setStates] = useState([]);
    const [lgas, setLgas] = useState([]);
    const [schoolOptions, setSchoolOptions] = useState([]); // Start with an empty array
    const [hasMore, setHasMore] = useState(true); // To check if more data is available
    const [loadingSchools, setLoadingSchools] = useState(false); // Loading state for schools
    const [page, setPage] = useState(1);
    const [selectedSchool, setSelectedSchool] = useState(
        schoolOptions.find((school) => school.schoolName === student.schoolId.schoolName) || null
    );
    const [isLoading, setIsLoading] = useState(false);
    const [selectedLga, setSelectedLga] = useState("");  // State for LGA selection

    useEffect(() => {
        if (schoolsData && schoolsData.length > 0) {
            setSchoolOptions(schoolsData); // Set schoolsData if available
        }
    }, [schoolsData]);



    const handleChange = useCallback((e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: files ? files[0] : value,
        }, [formData]);

    }, [formData]);



    const getLGAs = (stateName) => {
        const state = getNigeriaStates().find((s) => s.name === stateName);
        return state ? state.lgas : [];
    };

    useEffect(() => {
        if (formData.nationality === 'Nigeria') {
            const statesObjects = getNigeriaStates();
            const newStates = statesObjects.map((state) => state.name);
            setStates(newStates);
        } else {
            setStates([]);
            setLgas([]);
        }
    }, [formData.nationality]);

    useEffect(() => {
        if (formData.stateOfOrigin && formData.nationality === 'Nigeria') {
            const lgas = getLGAs(formData.stateOfOrigin);
            setLgas(lgas);
        } else {
            setLgas([]);
        }
    }, [formData.stateOfOrigin, formData.nationality]);

    const handleSelectChange = (e, { name }) => {
        setSelectedLga(e.target.value);

        setFormData((prevData) => ({
            ...prevData,
            [name]: e.target.value, // Update the correct field based on `name`
        }));
    }

    const handleStateChange = useCallback((selectedState) => {
        setFormData({
            ...formData,
            stateOfOrigin: selectedState,
            lga: '' // Reset LGA when state changes
        });
    }, [formData]);
    const handleWardChange = useCallback((selectedWard) => {
        setFormData({
            ...formData,
            ward: selectedWard,
            // Reset LGA when state changes
        });
    }, [formData])

    useEffect(() => {
        // Update selectedSchool if student.schoolId.schoolName or schoolOptions changes
        const matchedSchool = schoolOptions.find(
            (school) => school.schoolName === student.schoolId.schoolName
        );
        if (matchedSchool) {
            setSelectedSchool(matchedSchool);
        }
    }, [student.schoolId.schoolName, schoolOptions]);

    const selectedLgaWards = lgasAndWards.find(lga => lga.name === selectedLga)?.wards || [];




    const handleSubmit = (e) => {
        setIsLoading(true)
        e.preventDefault();

        (async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.patch(`${API_URL}/student/${student._id}`, formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                });
                setIsLoading(false)
                setSuccess(true);
                setTimeout(() => {
                    navigate('/enumerator-dashboard/view-all-students-data')
                }, 5000)
            } catch (err) {
                setIsLoading(false)
                if (err.response.status === 401) return navigate('/sign-in')
                setError(true)
                if (err.response.data === 'Route does not Exist') {
                    setValidationError('Update Successful');
                    setTimeout(() => {
                        navigate('/enumerator-dashboard/view-all-students-data')
                    }, 10000)
                    return;
                }
                setValidationError(err.response?.data?.message || 'An error occurred');
                setTimeout(() => setValidationError(''), 10000);
            }
            finally {
                setIsLoading(false)
            }
        })();
    }


    const loadMoreSchools = async () => {
        if (loadingSchools || !hasMore) return;

        setLoadingSchools(true);

        // Fetch the next batch of schools here (this is just a mock-up)
        const nextSchools = await fetchMoreSchools(page);

        if (nextSchools.length > 0) {
            setSchoolOptions((prev) => [...prev, ...nextSchools]); // Append new schools to the list
            setPage((prev) => prev + 1); // Increment the page
        } else {
            setHasMore(false); // No more schools to load
        }

        setLoadingSchools(false);
    }

    // Mock function to simulate fetching more schools from a backend
    const fetchMoreSchools = async (page) => {
        // Simulate network request to fetch schools for the current page
        return new Promise((resolve) => {
            setTimeout(() => {
                const startIndex = (page - 1) * 20;
                resolve(schoolsData.slice(startIndex, startIndex + 20)); // Return a slice of the schools array
            }, 1000);
        });
    };


    useEffect(() => {
        if (student.schoolId.schoolName) {
            const foundSchool = schoolOptions.find(
                (school) => school.schoolName === student.schoolId.schoolName
            );
            setSelectedSchool(foundSchool);
        }
    }, [student.schoolId.schoolName, schoolOptions]);








    if (loading) return (
        <Box
            sx={{
                display: "flex", // Corrected from 'dispflex'
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                height: "80vh",
                width: "90vw",
                position: "relative",
            }}
        >
            <SpinnerLoader />
        </Box>
    );

    if (fetchSchoolError) {
        return (
            <Box
                sx={{
                    display: "flex", // Corrected from 'dispflex'
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "80vh",
                    width: "90vw",
                    position: "relative",
                }}
            >
                <Typography>An Error occurred fetching schools, please reload the page!!!</Typography>
            </Box>
        )
    }

    setTimeout(() => {
        setError('')
        setSuccess('')
    }, 20000)


    const allWards = lgasAndWards.flatMap(ward => ward.wards).sort((a, b) => a.localeCompare(b));;

    return (
        <>
            <Container maxWidth="sm" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', paddingTop: '16px', paddingBottom: '16px', marginTop: '32px', marginBottom: '50px' }}>
                <Box sx={{ p: 4, borderRadius: 2, boxShadow: 3, backgroundColor: 'white', width: '100%' }}>
                    <Typography variant="h4" gutterBottom align="center" textTransform="uppercase" fontWeight="bolder" marginBottom="20px">
                        Update Student Information
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            {[{ label: 'Surname', name: 'surname' },
                            { label: 'Firstname', name: 'firstname' },
                            { label: 'Middlename', name: 'middlename' }].map(({ label, name }) => (
                                <Grid item xs={12} key={name}>
                                    <TextField
                                        label={label}
                                        name={name}
                                        variant="outlined"
                                        fullWidth
                                        value={formData[name]}
                                        onChange={handleChange}

                                    />
                                </Grid>
                            ))}

                            <Grid item xs={12}>
                                <TextField
                                    label={'Student Nin'}
                                    name={'studentNin'}
                                    variant="outlined"
                                    fullWidth
                                    value={formData.studentNin}
                                    onChange={handleChange}
                                    inputProps={{
                                        maxLength: 11, // Stops further input after 11 characters
                                        pattern: "\\d{11}", // Requires exactly 11 digits
                                        title: "Student Nin be exactly 11 digits", // Shows this message on invalid input
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Date of Birth"
                                    name="dob"
                                    type="date"
                                    variant="outlined"
                                    fullWidth
                                    value={formData.dob}
                                    onChange={handleChange}
                                    error={errors.dob}
                                    helperText={errors.dob && 'Date of Birth is required'}
                                    InputLabelProps={{ shrink: true }}
                                />
                            </Grid>

                            <Grid item xs={12}>

                                {schoolOptions.length > 0 ? (
                                    <Autocomplete
                                        id="school-select"
                                        value={selectedSchool} // Controlled value
                                        onChange={(event, newValue) => {
                                            if (newValue) {
                                                setSelectedSchool(newValue);
                                                setFormData({ ...formData, ['schoolId']: newValue._id }); // Set schoolId in formData
                                            }
                                        }}
                                        options={schoolOptions}
                                        getOptionLabel={(option) => option?.schoolName || ""}
                                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                                        getOptionKey={(option) => option?._id} // Use a unique key for each option

                                        onScroll={(event) => {
                                            const bottom =
                                                event.target.scrollHeight === event.target.scrollTop + event.target.clientHeight;
                                            if (bottom && hasMore) {
                                                loadMoreSchools();
                                            }
                                        }}
                                        renderInput={(params) => <TextField {...params} label={selectedSchool ? selectedSchool.schoolName : 'Select a school'} fullWidth />}
                                        loading={loadingSchools}
                                        noOptionsText="No schools found"
                                    />

                                ) : (
                                    <Typography variant="body1" color="textSecondary">
                                        No schools available
                                    </Typography>
                                )}




                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Gender"
                                    name="gender"
                                    select
                                    variant="outlined"
                                    fullWidth
                                    value={formData.gender}
                                    onChange={handleChange}
                                    error={errors.gender}
                                    helperText={errors.gender && 'Gender is required'}
                                >
                                    <MenuItem value="Female">Female</MenuItem>
                                </TextField>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Nationality"
                                    name="nationality"
                                    select
                                    variant="outlined"
                                    fullWidth
                                    value={formData.nationality}
                                    onChange={(e) => handleSelectChange(e, { name: 'nationality' })}
                                >
                                    <MenuItem value="Nigeria">Nigeria</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                    {/* Add more nationalities as needed */}
                                </TextField>
                            </Grid>

                            {/* State of Origin Select (visible only if nationality is Nigeria) */}
                            {formData.nationality === 'Nigeria' && (
                                <Grid item xs={12}>
                                    <TextField
                                        label="State of Origin"
                                        name="stateOfOrigin"
                                        select
                                        variant="outlined"
                                        fullWidth
                                        value={formData.stateOfOrigin || ''}
                                        onChange={(e) => handleStateChange(e.target.value)}
                                        error={formData.stateOfOrigin === ''} // For example, you can pass `true` or `false` here
                                        helperText={formData.stateOfOrigin === '' ? 'State of Origin is required' : ''}
                                    >
                                        {states.map((state) => (
                                            <MenuItem key={state} value={state}>
                                                {state}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            )}

                            {/* LGA Select (visible only if a state is selected and nationality is Nigeria) */}
                            {formData.stateOfOrigin && formData.nationality === 'Nigeria' && (
                                <Grid item xs={12}>
                                    <TextField
                                        label="LGA"
                                        name="lga"
                                        select
                                        variant="outlined"
                                        fullWidth
                                        value={formData.lga || ''}
                                        onChange={(e) => handleSelectChange(e, { name: 'lga' })}
                                    >
                                        {lgas.map((lga, index) => (
                                            <MenuItem key={index} value={lga}>
                                                {lga}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Grid>
                            )}



                            <Grid item xs={12}>
                                <TextField
                                    label="LGA of Enrollment"
                                    name="lgaOfEnrollment"
                                    select
                                    variant="outlined"
                                    fullWidth
                                    value={formData.lgaOfEnrollment || ''}
                                    onChange={(e) => handleSelectChange(e, { name: 'lgaOfEnrollment' })}
                                    error={errors['LGA']}
                                    required

                                >
                                    {lgasAndWards.map((lga) => (
                                        <MenuItem key={lga.name} value={lga.name}>
                                            {lga.name}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Wards"
                                    name="ward"
                                    select
                                    variant="outlined"
                                    fullWidth
                                    value={formData.ward} // Binding formData.ward, which should be ward ID or object
                                    onChange={(e) => handleWardChange(e.target.value)} // Update formData with selected value
                                >
                                    {allWards.map((ward, index) => (
                                        <MenuItem key={index} value={ward}> {/* Assuming `ward` is an object with `id` */}
                                            {ward} {/* Display ward name to the user */}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>

                            {formData.nationality === 'Others' && (
                                <Grid item xs={12}>
                                    <TextField
                                        label="Nationality (Specify)"
                                        name="customNationality"
                                        variant="outlined"
                                        fullWidth
                                        value={formData.customNationality}
                                        onChange={handleChange}
                                    />
                                </Grid>
                            )}

                            <Grid item xs={12} > {/* Adjusts the grid item size based on screen size */}
                                {/* <Autocomplete
                  value={wardValue}
                  onChange={(event, newValue) => {
                    setWardValue(newValue); // Set the selected object
                    setFormData({ ...formData, ward: newValue?.id || '' }); // Store the ID in formData
                  }}
                  options={wards}
                  getOptionLabel={(option) => option.name} // Display the label
                  isOptionEqualToValue={(option, value) => option.id === value?.id} // Match by ID
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Ward"
                      InputProps={{
                        ...params.InputProps,
                        readOnly: true, // Prevent typing
                      }}
                    />
                  )}
                  disableClearable
                /> */}

                            </Grid>

                            {[{ label: 'Community Name', name: 'communityName' },
                            { label: 'Residential Address', name: 'residentialAddress' }].map(({ label, name }) => (
                                <Grid item xs={12} key={name}>
                                    <TextField
                                        label={label}
                                        name={name}
                                        variant="outlined"
                                        fullWidth
                                        value={formData[name]}
                                        onChange={handleChange}
                                        error={errors[name]}
                                        helperText={errors[name] && `${label} is required`}
                                    />
                                </Grid>
                            ))}


                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Present Class</InputLabel>
                                    <Select
                                        name="presentClass"
                                        value={formData.presentClass}
                                        onChange={handleChange}
                                        label="Present Class"
                                        error={errors.presentClass}
                                    >
                                        <MenuItem value="Primary 6">Primary 6</MenuItem>
                                        <MenuItem value="JSS 1">JSS 1</MenuItem>
                                        <MenuItem value="JSS 3">JSS 3</MenuItem>
                                        <MenuItem value="SSS 1">SSS 1</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>


                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Year of enrollment</InputLabel>
                                    <Select
                                        name="yearOfEnrollment"
                                        value={formData.yearOfEnrollment || ''}
                                        onChange={handleChange}
                                        label="Year of Erollment"
                                        error={errors['Year of Enrollment']}
                                        helperText={errors['Year of Enrollment'] && `${'Year of enrollment of'} is required`}
                                    >
                                        <MenuItem value="2024">2024</MenuItem>
                                        <MenuItem value="2025">2025</MenuItem>
                                        <MenuItem value="2026">2026</MenuItem>
                                        <MenuItem value="2027">2027</MenuItem>
                                        <MenuItem value="2028">2028</MenuItem>
                                        <MenuItem value="2029">2029</MenuItem>

                                    </Select>
                                </FormControl>
                            </Grid>


                            {[{ label: 'parent Name', name: 'parentName' },
                            { label: 'parent Nin', name: 'parentNin' },

                            ].map(({ label, name }) => (
                                <Grid item xs={12} key={name}>
                                    <TextField
                                        label={label}
                                        name={name}
                                        variant="outlined"
                                        fullWidth
                                        value={formData[name]}
                                        onChange={handleChange}
                                        error={errors[name]}
                                        helperText={errors[name] && `${label} is required`}
                                    />
                                </Grid>
                            ))}

                            <Grid item xs={12} key={name}>
                                <TextField
                                    label={"parent Mobile  No."}
                                    name={'parentPhone'}
                                    variant="outlined"
                                    fullWidth
                                    value={formData.parentPhone}
                                    onChange={handleChange}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Parent/Caregiver Occupation</InputLabel>
                                    <Select
                                        name="parentOccupation"
                                        value={formData.parentOccupation}
                                        onChange={handleChange}
                                        label="Occupation"
                                        error={errors['parent Occupation']}
                                        helperText={errors['parent Occupation'] && `${'parent Occupation'} is required`}                  >

                                        {occupations.map((occupation, index) => {
                                            return <MenuItem key={index} value={occupation}>{occupation}</MenuItem>

                                        })}

                                        <MenuItem value="2020">2020</MenuItem>


                                    </Select>
                                </FormControl>
                            </Grid>


                            {formData.parentOccupation === 'Others' && (
                                <Grid item xs={12}>
                                    <TextField
                                        label="Occupation (Specify)"
                                        name="nationality"
                                        variant="outlined"
                                        fullWidth
                                        value={formData.customNationality}
                                        onChange={handleChange}

                                    />
                                </Grid>
                            )}


                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Bank Name</InputLabel>
                                    <Select
                                        name="bankName"
                                        value={formData.bankName}
                                        onChange={handleChange}
                                        label="Bank Name"
                                        error={!!errors.bankName}
                                    >

                                        <MenuItem value="">Select Bank</MenuItem>
                                        <MenuItem value="Fidelity Bank">FCMB</MenuItem>
                                        <MenuItem value="Polaris Bank">Polaris Bank</MenuItem>
                                        <MenuItem value="Zenith Bank">Zenith Bank</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    label="Account Number"
                                    name="accountNumber"
                                    variant="outlined"
                                    fullWidth
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    error={errors.accountNumber}
                                    helperText={errors.accountNumber && 'Account Number is required'}
                                    inputProps={{
                                        maxLength: 10, // Stops further input after 11 characters
                                        pattern: "\\d{10}", // Requires exactly 11 digits
                                        title: "Account Number must be exactly 10 digits", // Shows this message on invalid input
                                    }}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    component="label"
                                    fullWidth
                                    error={errors.image}
                                    helperText={errors.image && 'image is required'}
                                    style={{
                                        backgroundColor: '#196b57',
                                        color: '#fff',
                                    }}
                                >
                                    Change Passport
                                    <input
                                        type="file"
                                        name="image"
                                        hidden
                                        accept="image/*"
                                        onChange={handleChange}
                                    />
                                </Button>
                            </Grid>

                            <Grid item xs={12} marginTop="20px">
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    style={{
                                        backgroundColor: '#196b57',
                                        color: '#fff', // Optional: To make the text readable on the green background
                                    }}
                                >
                                    Modify
                                </Button>
                            </Grid>

                        </Grid>
                        <Grid xs={12} sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            marginTop: "6px"
                        }}>
                            {isLoading ? <SpinnerLoader /> : (<Typography
                                variant="body2"
                                style={{
                                    marginTop: '8px',
                                    fontWeight: 'bold',
                                    textAlign: 'center', // Center align the text
                                }}
                            >
                                {success && <Typography variant='h5' color="green">Student Updated Successfully</Typography>}
                                {error && <Typography variant='h5' color="red">{validationError}</Typography>}
                            </Typography>)}
                        </Grid>
                    </form>
                </Box>
            </Container>
        </>
    )
}
