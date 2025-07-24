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
} from '@mui/material'
import EditNoteIcon from '@mui/icons-material/EditNote'
import DataTable from 'react-data-table-component'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { fetchDashboardStat } from '../../components/dashboardStatsSlice'
import { DropdownField } from '../../components/InputFields/DropdownField'
import { classOptions } from '../../../data/data'
import { fetchStudentsFromComponent } from '../../components/studentsSlice.js'



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

  console.log(getUniqueSchools)

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

  console.log(preselected)

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

export const VerifyStudent = () => {
  //   const [preselected, setPreselected] = React.useState({
  //   schoolId: '',
  //   cohort: '',
  //   presentClass: '',
  // })
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { cohort, school, presentClass } = location.state || {}

  if (!location.state) navigate('/verifier-dashboard/preselect')
  const studentsState = useSelector((state) => state.students)
  const {
    currentPage,

    filteredStudents,
    loading: studentsLoading,
  } = studentsState

  const [studentsData, setStudentsData] = React.useState(filteredStudents)

  React.useEffect(() => {
    dispatch(
      fetchStudentsFromComponent({
        filteredParams: { cohort, presentClass, schoolId: school.schoolId },
        sortParam,
        page: currentPage,
        limit: 1000,
      })
    )
  }, [])

  React.useEffect(() => {
    setStudentsData(filteredStudents)
  }, [filteredStudents])

  const sortParam = {
    sortBy: '',
    sortOrder: '',
  }

  const handleVerification = (row) => {
    console.log(`handling verification for student with id ${row._id}`)
  }


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
          display: 'none',
        },
      },
    }

  const columns = [
    {
      name: 'S/N',
      selector: (row, index) => index + 1, // Calculate serial number (starting from 1)
      sortable: true,
    },

    // {
    //   name: 'View',
    //   cell: (row) => (
    //     <Typography
    //       onClick={() => handleViewItem(row)}
    //       sx={{
    //         padding: '5px 10px',
    //         backgroundColor: '#196b57',
    //         color: '#fff',
    //         border: 'none',
    //         cursor: 'pointer',
    //         fontSize: '12px',
    //       }}
    //     >
    //       View
    //     </Typography>
    //   ),
    // },

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

    {
      name: 'Promote',
      cell: (row) => (
        <button
          onClick={() => handleVerification(row)}
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
  ]

  return (
    <Box
      className={'preselect-container'}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        marginLeft: {
          sx: "250px", 
          lg: 0
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
            {school.schoolName}
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
          mt: 4,
          overflowX: "scroll"
        }}
      >
        <DataTable
          title="View Registered Students Information"
          columns={columns}
          data={studentsData}
          selectableRows // Enable checkboxes
          // onSelectedRowsChange={handleSelectedStudentsChange} // Handle selected rows
          progressPending={studentsLoading} // Show loading spinner
          progressComponent = {<CircularProgress/>}
          pagination
          paginationServer
          highlightOnHover
          // paginationPerPage={rowsPerPage} // Override default rows per page
          paginationRowsPerPageOptions={[100, 200, 500, 1000]} // Custom options
          // paginationTotalRows={totalRows} // Total rows from API
          paginationDefaultPage={currentPage} // Use current page from Redux
          // onChangePage={(page) => {
          //   dispatch(setCurrentPage(page)) // Update Redux state for current page
          //   dispatch(
          //     fetchStudentsFromComponent({
          //       filteredParams,
          //       sortParam,
          //       page,
          //       limit: rowsPerPage,
          //     })
          //   ) // Fetch data for the selected page
          // }}
          // onChangeRowsPerPage={(newLimit) => {
          //   // Update rowsPerPage in Redux state and fetch new data

          //   dispatch(setRowsPerPage(newLimit)) // Update rowsPerPage in Redux
          //   dispatch(
          //     fetchStudents({
          //       filteredParams,
          //       sortParam,
          //       page: 1,
          //       limit: newLimit,
          //     })
          //   ) // Fetch new data with updated limit
          // }}
          customStyles={customStyles} // Applying the custom styles
        />
      </Box>
    </Box>
  )
}
