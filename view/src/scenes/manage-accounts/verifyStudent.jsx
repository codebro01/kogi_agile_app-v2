import React from 'react'
import {
  Box,
  Typography,
  Grid,
  CircularProgress,
  InputLabel,
  Autocomplete,
  TextField,
  Button,
  Paper,
  Checkbox,
} from '@mui/material'
import EditNoteIcon from '@mui/icons-material/EditNote'
import VerifiedIcon from '@mui/icons-material/Verified'
import CancelIcon from '@mui/icons-material/Cancel'

import DataTable from 'react-data-table-component'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchDashboardStat } from '../../components/dashboardStatsSlice'
import { DropdownField } from '../../components/InputFields/DropdownField'
import { classOptions } from '../../../data/data'
import {
  fetchStudentsFromComponent,
  setRowsPerPage,
  setCurrentPage,
} from '../../components/studentsSlice.js'
import axios from 'axios'
import { TextField as MyTextField } from '../../components/InputFields/TextField.jsx'
import { UploadField } from '../../components/InputFields/upload.jsx'

// ! Begins preselect component
export const Preselect = () => {
  const dashboardStatState = useSelector((state) => state.dashboardStat)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {
    data: dashboardData,
    loading: dashboardStatLoading,
    error: dashboardStatError,
  } = dashboardStatState

  React.useEffect(() => {
    dispatch(fetchDashboardStat())
  }, [dispatch])

  const [preselected, setPreselected] = React.useState({
    school: {
      schoolId: '',
      schoolName: '',
      LGA: '',
      schoolCode: '',
    },
    cohort: '',
    presentClass: '',
  })

  const handleInputChange = React.useCallback((e) => {
    const { name, value } = e.target
    setPreselected((prev) => ({ ...prev, [name]: value }))
  }, [])

  const getUniqueSchools =
    dashboardData?.results?.[0]?.distinctSchoolsDetails || []

  const uniqueSchools = React.useMemo(() => {
    const sorted = [...getUniqueSchools].sort((a, b) =>
      a.schoolName?.toLowerCase()?.localeCompare(b.schoolName?.toLowerCase())
    )
    return [...sorted]
  }, [getUniqueSchools])

  const handleSubmit = () => {
    navigate('/verifier-dashboard/verify-student', {
      state: preselected,
    })
  }

  // console.log(preselected)

  return (
    <Box
      onSubmit={handleSubmit}
      component={'form'}
      className={'preselect-container'}
      sx={{
        padding: '2rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <Typography variant={'h4'} textTransform={'uppercase'}>
        Select School, Class and Cohort to Proceed
      </Typography>
      <Grid
        container
        gap={2}
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
          mt: '5%',
        }}
      >
        {/* school selector  */}
        <Grid item xs={12} sm={6} md={3}>
          <InputLabel id="lga-label" sx={{ marginBottom: 1 }}>
            Select School
          </InputLabel>
          {uniqueSchools.length > 0 ? (
            <Autocomplete
              sx={{
                width: '100%',
                '& .MuiAutocomplete-input': {
                  height: '5px', // Adjust input field height
                  borderRadius: '4px',
                  padding: '10px',
                },
              }}
              id="school-select"
              value={
                uniqueSchools.find(
                  (option) => option.schoolId === preselected?.school?.schoolId
                ) || null
              }
              onChange={(event, newValue) => {
                setPreselected((prevFilters) => ({
                  ...prevFilters,
                  school: newValue || null,
                }))
              }}
              required={true}
              options={uniqueSchools}
              getOptionLabel={(option) => option?.schoolName || ''}
              isOptionEqualToValue={(option, value) =>
                option?.schoolId === value?.schoolId
              }
              renderInput={(params) => (
                <TextField
                  required={true}
                  {...params}
                  // label="School"
                  // sx={{
                  //   '& .MuiOutlinedInput-root': {
                  //     '& fieldset': {
                  //       borderColor: 'green',
                  //     },
                  //     '&:hover fieldset': {
                  //       borderColor: 'darkgreen',
                  //     },
                  //     '&.Mui-focused fieldset': {
                  //       borderColor: 'green',
                  //       borderWidth: 2,
                  //     },
                  //   },
                  // }}
                />
              )}
              // loading={loadingSchools}
              // noOptionsText="No schools found"
              // getOptionKey={(option, index) =>
              //   option?._id || `${option.schoolName}-${index}`
              // } // Unique key
            />
          ) : (
            <Typography
              variant="body1"
              color="textSecondary"
              sx={{ textAlign: 'center', marginTop: 2 }}
            >
              <CircularProgress size={20} />
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DropdownField
            options={classOptions}
            handleInputChange={handleInputChange}
            name="presentClass"
            value={preselected.presentClass}
            inputLabel="Select Class"
            required={true}
            height={'38px'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DropdownField
            options={['1', '2']}
            handleInputChange={handleInputChange}
            name="cohort"
            value={preselected.cohort}
            inputLabel="Select Cohort"
            required={true}
            height={'38px'}
          />
        </Grid>
      </Grid>
      <Button
        type={'submit'}
        variant="contained"
        endIcon={<KeyboardArrowRightIcon />}
        sx={{
          mt: '5%',
        }}
      >
        Proceed
      </Button>
    </Box>
  )
}

// ! end preselect component

export const VerifyStudent = () => {
  //   const [preselected, setPreselected] = React.useState({
  //   schoolId: '',
  //   cohort: '',
  //   presentClass: '',
  // })

  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`

  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { cohort, school, presentClass } = location.state || {}

  if (!location.state) navigate('/verifier-dashboard/preselect')
  const studentsState = useSelector((state) => state.students)
  const {
    currentPage,
    totalRows,
    rowsPerPage,
    filteredStudents,
    loading: studentsLoading,
  } = studentsState

  const [verifyFormActive, setVerifyFormActive] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [responseMessage, setResponseMessage] = React.useState('')
  const [studentsData, setStudentsData] = React.useState(filteredStudents)
  const [formData, setFormData] = React.useState({
    image: null,
    studentId: '',
    reasonNotVerified: '',
    cardNo: '',
    verified: false,
    imgUrl: '',
  })

  // const videoRef = React.useRef(null)
  // const canvasRef = React.useRef(null)

  // React.useEffect(() => {
  //   const getCamera = async () => {
  //     try {
  //       const stream = await navigator.mediaDevices.getUserMedia({
  //         video: true,
  //       })
  //       if (videoRef.current) {
  //         videoRef.current.srcObject = stream
  //       }
  //     } catch (err) {
  //       console.error('Camera error:', err)
  //     }
  //   }

  //   getCamera()
  // }, [])

  // const capturePhoto = () => {
  //   const video = videoRef.current

  //   // Create a canvas only when needed
  //   const canvas = document.createElement('canvas')
  //   canvas.width = video.videoWidth
  //   canvas.height = video.videoHeight

  //   const ctx = canvas.getContext('2d')
  //   ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

  //   const dataUrl = canvas.toDataURL('image/png')
  //   setImageData(dataUrl)
  // }

  React.useEffect(() => {
    dispatch(
      fetchStudentsFromComponent({
        filteredParams: { cohort, presentClass, schoolId: school.schoolId },
        sortParam,
        page: currentPage,
        limit: rowsPerPage,
      })
    )
  }, [dispatch, currentPage, rowsPerPage])

  React.useEffect(() => {
    setStudentsData(filteredStudents)
  }, [filteredStudents])

  const sortParam = {
    sortBy: '',
    sortOrder: '',
  }

  const handleVerification = async (e) => {
    setLoading(true)
    e.preventDefault()
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('image', formData.image) // this is the File object
      formDataToSend.append('cardNo', formData.cardNo)
      formDataToSend.append('studentId', formData.studentId)
      formDataToSend.append('verified', formData.verified)
      formDataToSend.append('reasonNotVerified', formData.reasonNotVerified)
      const token = localStorage.getItem('token')
      // console.log(token)
      const res = await axios.patch(
        `${API_URL}/verifier/verify-students`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: true,
        }
      )

      setStudentsData((prev) =>
        prev.map((student) =>
          student._id === formData.studentId
            ? { ...student, verificationStatus: formData.verified }
            : student
        )
      )

      setFormData((prev) => ({
        ...prev,
        image: null,
        reasonNotVerified: '',
        cardNo: '',
        verified: false,
        imgUrl: '',
      }))
      setLoading(false)
      setResponseMessage(res.data.message)
      setVerifyFormActive(false)

      setTimeout(() => setResponseMessage(''), 5000)
      console.log(res)
    } catch (err) {
      console.log(err)
      setLoading(false)
      setResponseMessage(
        err?.response?.data?.message ||
        err?.res?.message ||
          err?.message ||
          err?.res?.message ||
          'an error occured, please try again'
      )
      setTimeout(() => setResponseMessage(''), 5000)
    }
  }

  const handleInputChange = React.useCallback((e) => {
    const { value, name, type, files } = e.target
    if (type === 'file') {
      setFormData((prev) => ({ ...prev, [name]: files[0] || null }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }, [])

  const handleSelectStudent = React.useCallback((e) => {
    console.log(e._id)
    setFormData({
      studentId: e._id,
      cardNo: formData.cardNo,
      reasonNotVerified: formData.reasonNotVerified,
      image: formData.image,
      imgUrl: e.passport,
      verified: formData.verified,
    })
    setVerifyFormActive(true)
  }, [])

  const customStyles = {
    rows: {
      style: {
        marginBottom: '20px', // Adds spacing between rows
      },
    },
    // columns:{
    //   style:{
    //     margin: 0,
    //     padding: 0,
    //     gap:0,
    //   }
    // },

    header: {
      style: {
        justifyContent: 'center', // Centers the title
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '20px',
        color: '#4A4A4A', // Optional styling for the title color
        padding: '10px',
        display: 'none',
      },
    },
  }

  const columns = [
    {
      name: 'S/N',
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
    },
    {
      name: 'Status',
      cell: (row) => {
        if (row.verificationStatus)
          return (
            <Typography
              sx={{
                color: '#f5f5f5',
                fontWeight: 600,
                padding: '2px',
                background: '#196b57',
                width: '80px',
                textAlign: 'center',
              }}
            >
              Verified
            </Typography>
          )
        else {
          return (
            <Typography
              sx={{
                color: '#f5f5f5',
                fontWeight: 600,
                padding: '2px',
                background: '#f44336',
                width: '80px',
                textAlign: 'center',
              }}
            >
              Unverified
            </Typography>
          )
        }
      },
      // Calculate serial number (starting from 1)
    },

    {
      name: 'Verify',
      cell: (row) => (
        <button
          onClick={() => handleSelectStudent(row)}
          style={{
            padding: '5px 10px',
            backgroundColor: 'transparent', // Optional: color for the delete button
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <EditNoteIcon style={{ marginRight: '8px', color: '#196b57' }} />
        </button>
      ),
    },

    {
      name: 'Image',
      cell: (row) => (
        <img
          src={row?.passport} // Placeholder for missing images
          alt="Student"
          style={{ width: '50px', height: '50px' }}
        />
      ),
      sortable: false,
    },

    {
      name: 'Surname',
      selector: (row) => row?.surname,
      sortable: true,
    },
    {
      name: 'Firstname',
      selector: (row) => row?.firstname,
      sortable: true,
    },
    {
      name: 'Middlename',
      selector: (row) => row?.middlename,
      sortable: true,
    },
    {
      name: 'School',
      selector: (row) => row?.schoolId?.schoolName,
      sortable: true,
    },
    {
      name: 'Present Class',
      selector: (row) => row?.presentClass,
      sortable: true,
    },
    {
      name: 'dob',
      selector: (row) => row?.dob,
      sortable: true,
    },
  ]

  // console.log(studentsData)

  return (
    <Box
      className={'preselect-container'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginLeft: {
          sx: '250px',
          lg: 0,
        },
        justifyContent: {
          xs: 'flex-start',
          sm: 'center',
        },
        alignItems: 'center',
        p: {
          xs: 1.5,
          md: 4,
        },
      }}
    >
      <Box
        className={'header'}
        elevation={5}
        sx={{
          borderBottom: '1px solid #196b57',
          width: '100%',
          height: '100%',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          justifyContent: 'center',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
        }}
      >
        <Typography
          variant={'h3'}
          textTransform="uppercase"
          fontWeight={800}
          color="#196b57"
          sx={{
            fontSize: {
              xs: '1.3rem',
              md: '2.2rem',
            },
          }}
        >
          Verify Students
        </Typography>
        <Box
          component={'paper'}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            justifyContent: {
              xs: 'flex-start',
              sm: 'center',
            },
            alignItems: {
              xs: 'flex-start',
              sm: 'center',
            },
            width: '100%',
          }}
        >
          <Typography
            variant={'h4'}
            textTransform="uppercase"
            fontWeight={800}
            sx={{
              fontSize: {
                xs: '1.1rem',
                md: '1.8rem',
              },
            }}
          >
            {school?.schoolName}
          </Typography>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              justifyContent: {
                xs: 'flex-start',
                sm: 'space-around',
              },
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '20px',
            }}
          >
            <Typography
              variant={'h5'}
              textTransform="uppercase"
              fontWeight={600}
            >
              Present Class: {presentClass}
            </Typography>
            <Typography
              variant={'h5'}
              textTransform="uppercase"
              fontWeight={600}
            >
              Cohort: {cohort}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          width: '100%',
          mt: 4,
          // overflowX: "scroll",
          // height: "100%"
        }}
      >
        <DataTable
          title="View Registered Students Information"
          columns={columns}
          data={studentsData}
          // selectableRows // Enable checkboxes
          // onSelectedRowsChange={handleSelectedStudentsChange} // Handle selected rows
          progressPending={studentsLoading} // Show loading spinner
          progressComponent={<CircularProgress />}
          pagination
          paginationServer
          highlightOnHover
          paginationPerPage={rowsPerPage} // Override default rows per page
          paginationRowsPerPageOptions={[100, 200, 500, 1000]} // Custom options
          paginationTotalRows={totalRows} // Total rows from API
          paginationDefaultPage={currentPage} // Use current page from Redux
          onChangePage={(page) => {
            dispatch(setCurrentPage(page)) // Update Redux state for current page
            dispatch(
              fetchStudentsFromComponent({
                filteredParams: {
                  cohort,
                  presentClass,
                  schoolId: school.schoolId,
                },
                sortParam,
                page,
                limit: rowsPerPage,
              })
            ) // Fetch data for the selected page
          }}
          // onChangeRowsPerPage={(newLimit) => {
          //   // Update rowsPerPage in Redux state and fetch new data

          //   dispatch(setRowsPerPage(newLimit)) // Update rowsPerPage in Redux
          //   dispatch(
          //     fetchStudents({
          //       filteredParams: {
          //         cohort,
          //         presentClass,
          //         schoolId: school.schoolId,
          //       },
          //       sortParam,
          //       page: 1,
          //       limit: newLimit,
          //     })
          //   ) // Fetch new data with updated limit
          // }}
          customStyles={customStyles} // Applying the custom styles
        />
      </Box>

      {verifyFormActive && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'fixed',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.5)',
          }}
        >
          <Box
            component={'form'}
            onSubmit={handleVerification}
            sx={{
              position: 'relative',
              width: {
                xs: '300px',
                md: '400px',
              },
              background: '#fff',
              display: 'flex',
              flexDirection: 'column',
            
              padding: '40px 20px',
              gap: '20px',
              minHeight: '400px',
            }}
          >
            <Box
              onClick={() => setVerifyFormActive(false)}
              sx={{
                cursor: 'pointer', 
                position: 'absolute',
                top: '30px',
                right: '30px',
              }}
            >
              <CancelIcon />
            </Box>
            <Typography
              variant={'h5'}
              sx={{
                fontWeight: '600',
                textAlign: 'center',
                fontSize: {
                  xs: '1.2rem',
                  md: '1.8rem',
                },
              }}
            >
              Verify Student
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
              }}
            >
              <Box
                component="img"
                src={formData.imgUrl}
                alt="Preview"
                sx={{
                  width: '100px',
                  height: '100px',
                  maxWidth: 400,
                  objectFit: 'cover',
                  boxShadow: 2,
                }}
              />
              {/* <Box>{'Verified'}</Box> */}
            </Box>
            {/* <MyTextField
                  handleInputChange={handleInputChange}
                  value = {formData.studentId}
                  name = {'studentId'}
                  required = {true}
                  label ={'Student Id'}
              /> */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}
            >
              <Typography sx= {{
                fontWeight: 700
              }}>Verify:</Typography>

              <Checkbox
                checked={formData.verified}
                onChange={() =>
                  setFormData((prev) => ({
                    ...prev,
                    verified: !formData.verified,
                  }))
                }
              />
            </Box>
            <MyTextField
              handleInputChange={handleInputChange}
              value={formData.cardNo}
              name={'cardNo'}
              required={true}
              label={'Enter card NO'}
              inputProps={{
                maxLength: 16, // Stops further input after 11 characters
                pattern: '\\d{16}', // Requires exactly 11 digits
                title: 'Card NO must be exactly 16 digits', // Shows this message on invalid input
              }}
              onInput={(e) => {
                // This ensures that only digits make it through
                e.target.value = e.target.value.replace(/\D/g, '')
              }}
            />

            {!formData.verified && (
              <Box>
                <MyTextField
                  handleInputChange={handleInputChange}
                  value={formData.reasonNotVerified}
                  name={'reasonNotVerified'}
                  required={false}
                  label={'Reason student cannot be verified'}
                />
                <Typography
                  sx={{
                    fontSize: '11px',
                    color: 'red',
                    mt: 1,
                  }}
                >
                  Note: Enter the reason student is not verified!!!!!
                </Typography>
              </Box>
            )}
            <UploadField
              handleInputChange={handleInputChange}
              accept={'image/*'}
              name={'image'}
            />

            <Button
              sx={{
                padding: '15px 0px',
                display: 'flex',
                gap: '15px',
                alignItems: 'center',
              }}
              type="submit"
              variant="contained"
              startIcon={<VerifiedIcon />}
              disabled={loading}
            >
              Verify
              {loading && <CircularProgress size={18} />}
            </Button>
          </Box>
        </Box>
      )}

      <Box
        sx={{
          fontWeight: 600,
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#196b57',
          zIndex: 99999999,
        }}
      >
        <Typography
          sx={{
            display: responseMessage ? 'block' : 'none',
            fontWeight: 600,
            fontSize: '10px',
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#196b57',
            color: '#f5f5f5',
            p: 2,
          }}
        >
          {responseMessage}
        </Typography>
      </Box>
    </Box>
  )
}
