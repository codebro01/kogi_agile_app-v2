import React, { useEffect, useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as yup from 'yup'
import { TextField, MenuItem, CircularProgress,  Button, Box, Typography, Autocomplete, InputLabel, Grid } from '@mui/material'
import lgaAndWards from '../../Lga&wards.json'
import axios from 'axios'
import { useSelector, useDispatch } from 'react-redux'
import { fetchSchools } from '../../components/schoolsSlice.js'
import { SpinnerLoader } from '../../components/spinnerLoader.jsx'

export const UpdateSchool = () => {
  const dispatch = useDispatch()
  const schoolsState = useSelector((state) => state.schools)

  const {
    data: schoolsData,
    loading: schoolsLoading,
    error: schoolsError,
  } = schoolsState
  const schools = schoolsData
  const [schoolOptions, setSchoolOptions] = useState([]) // Start with an empty array
    const [hasMore, setHasMore] = useState(true) // To check if more data
     const [loadingSchools, setLoadingSchools] = useState(false) // Loading state for schools
      const [page, setPage] = useState(1) // Kee 
      const [selectedSchool, setSelectedSchool] = useState(null);
      const [submitting, setSubmitting] = useState(false);
      const [submitMessage, setSubmitMessage] = useState('');
      const [filters, setFilters] = useState({
        schoolId: "", 
      })

  useEffect(() => {
    dispatch(fetchSchools({ schoolType: '', lgaOfEnrollment: '' }))
  }, [dispatch])

    useEffect(() => {
      if (schools && schools.length > 0) {
        setSchoolOptions(schools) // Set schools if available
      }
    }, [schools]) // Re-run whenever schools change
    const loadMoreSchools = async () => {
      if (loadingSchools || !hasMore) return
  
      setLoadingSchools(true)
  
      // Fetch the next batch of schools here (this is just a mock-up)
      const nextSchools = await fetchMoreSchools(page)
  
      if (nextSchools.length > 0) {
        setSchoolOptions((prev) => [...prev, ...nextSchools]) // Append new schools to the list
        setPage((prev) => prev + 1) // Increment the page
      } else {
        setHasMore(false) // No more schools to load
      }
  
      setLoadingSchools(false)
    }


    const fetchMoreSchools = async (page) => {
      // Simulate network request to fetch schools for the current page
      return new Promise((resolve) => {
        setTimeout(() => {
          const startIndex = (page - 1) * 20
          resolve(schools.slice(startIndex, startIndex + 20)) // Return a slice of the schools array
        }, 1000)
      })
    }


  const validationSchema = yup.object().shape({
    schoolName: yup.string().required('School Name is required'),
    schoolCategory: yup.string().required('School Category is required'),
    schoolCode: yup
      .string()
      .matches(/^\d{8}$/, 'School Code must be exactly 8 digits')
      .required('School Code is required'),
    LGA: yup.string().required('LGA is required'),
    schoolType: yup.string(),
  })

  const handleSubmit = async (values, resetForm) => {
    setSubmitting(true)
    const token = localStorage.getItem('token')
    const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`
    // console.log({filters, ...values})
    try {
      const response = await axios.patch(
        `${API_URL}/schools/update-school`,
        { ...values, ...filters },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      )
      setSubmitting(false)
      setSubmitMessage(response.data.message);
      setTimeout(() => setSubmitMessage(''), 7000)

      resetForm()
    } catch (err) {
        setSubmitting(false)
        setSubmitMessage(err?.response?.message || err.data.response.message || err.message || 'Unknown Error, Please try again' )
        setTimeout(() => setSubmitMessage(''), 7000)

      console.log(err)
    }
  }

//   console.log(selectedSchool)
  return (
    <Box
      sx={{
        padding: 1,
      }}
    >
      <Formik
        initialValues={{
          schoolName: selectedSchool ? selectedSchool?.schoolName : '',
          schoolCategory: selectedSchool ? selectedSchool?.schoolCategory : '',
          schoolCode: selectedSchool ? selectedSchool?.schoolCode : '',
          LGA: selectedSchool ? selectedSchool?.LGA : '',
          schoolType: selectedSchool ? selectedSchool?.schoolType : '',
        }}
        enableReinitialize={true}
        validationSchema={validationSchema}
        onSubmit={(values, { resetForm }) => handleSubmit(values, resetForm)}
      >
        {({ values, handleChange, handleBlur }) => (
          <Form>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxWidth: 400,
                margin: '0 auto',
                padding: 4,
                border: '1px solid #ccc',
                borderRadius: 2,
                backgroundColor: '#f9f9f9',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Typography variant="h4" component="h1" textAlign="center" mb={2}>
                Update School
              </Typography>

              {/* School Name */}
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel id="lga-label" sx={{ marginBottom: 1 }}>
                  Select School
                </InputLabel>
                {schoolOptions.length > 0 ? (
                  <Autocomplete
                    sx={{
                      width: '100%',
                      '& .MuiAutocomplete-input': {
                        height: '20px', // Adjust input field height
                        borderRadius: '4px',
                        padding: '10px',
                      },
                    }}
                    id="school-select"
                    value={
                      schoolOptions.find(
                        (option) => option._id === filters.schoolId
                      ) || null
                    }
                    onChange={(event, newValue) => {
                      setFilters((prevFilters) => ({
                        ...prevFilters,
                        schoolId: newValue?._id || null,
                      }))
                      setSelectedSchool(() => {
                        const newlySelectedSchool = schools.find(
                          (school) => school._id === newValue?._id
                        )

                        return newlySelectedSchool
                      })
                    }}
                    options={schoolOptions}
                    getOptionLabel={(option) => option?.schoolName || ''}
                    isOptionEqualToValue={(option, value) =>
                      option?._id === value?._id
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="School"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              borderColor: 'green',
                            },
                            '&:hover fieldset': {
                              borderColor: 'darkgreen',
                            },
                            '&.Mui-focused fieldset': {
                              borderColor: 'green',
                              borderWidth: 2,
                            },
                          },
                        }}
                      />
                    )}
                    loading={loadingSchools}
                    noOptionsText="No schools found"
                    getOptionKey={(option, index) =>
                      option?._id || `${option.schoolName}-${index}`
                    } // Unique key
                  />
                ) : (
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    sx={{ textAlign: 'center', marginTop: 2 }}
                  >
                    No schools available
                  </Typography>
                )}
              </Grid>

              <Field name="schoolName">
                {({ field, form }) => (
                  <TextField
                    {...field}
                    label="Selected School"
                    variant="outlined"
                    fullWidth
                    error={!!values.schoolName && !field.value}
                    helperText={<ErrorMessage name="schoolName" />}
                    onChange={(event) => {
                      const uppercaseValue = event.target.value.toUpperCase()
                      form.setFieldValue('schoolName', uppercaseValue) // Update form state
                    }}
                    onBlur={handleBlur}
                  />
                )}
              </Field>

              {/* School Category */}
              <Field name="schoolCategory">
                {({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="School Category"
                    variant="outlined"
                    fullWidth
                    error={!!values.schoolCategory && !field.value}
                    helperText={<ErrorMessage name="schoolCategory" />}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <em value="">Select School Category</em>

                    <MenuItem value="PRIMARY">PRIMARY</MenuItem>
                    <MenuItem value="UBE/JSS">UBE/JSS</MenuItem>
                    <MenuItem value="JSS/SSS">JSS/SSS</MenuItem>
                    <MenuItem value="TECHNICAL">TECHNICAL</MenuItem>
                  </TextField>
                )}
              </Field>

              {/* School Code */}
              <Field name="schoolCode">
                {({ field }) => (
                  <TextField
                    {...field}
                    label="School Code"
                    type="number"
                    variant="outlined"
                    fullWidth
                    error={!!values.schoolCode && !field.value}
                    helperText={<ErrorMessage name="schoolCode" />}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                )}
              </Field>

              {/* LGA */}
              <Field name="LGA">
                {({ field }) => (
                  <TextField
                    {...field}
                    select
                    label="LGA"
                    variant="outlined"
                    fullWidth
                    error={!!field.value && !field.value}
                    helperText={<ErrorMessage name="LGA" />}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    {lgaAndWards.map((lga, index) => (
                      <MenuItem key={index} value={lga.name}>
                        {lga.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              </Field>

              {/* School Type */}
              <Field name="schoolType">
                {({ field }) => (
                  <TextField
                    {...field}
                    label="School Type (Optional)"
                    variant="outlined"
                    fullWidth
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                )}
              </Field>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting ? true : false}
                sx={{
                  mt: 2,
                  background: '#196b57',
                  '&:hover': {
                    background: '#145a47', // Optional: Change background color on hover
                    color: '#ffffff', // Change text color on hover
                  },
                }}
              >
                {submitting ? (
                  <CircularProgress size="30px" />
                ) : (
                  'Update School'
                )}
              </Button>
              <Typography
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color: '#196b57',
                }}
              >
                {submitMessage}
              </Typography>
            </Box>
          </Form>
        )}
      </Formik>
    </Box>
  )
}
