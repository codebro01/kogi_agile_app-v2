import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  memo,
  useRef,
} from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

import chunk from 'lodash.chunk'
import { tokens } from '../../theme'
// import { PersonLoader } from '../../components/personLoader'
import { getNigeriaStates } from 'geo-ng'
import lgasAndWards from '../../Lga&wards.json'
// import { SchoolsContext } from '../../components/dataContext.jsx'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import { useSelector, useDispatch } from 'react-redux'
import { useReactToPrint } from 'react-to-print'


import {
  //   deleteStudent,
  //   fetchStudents,
  fetchStudentsFromComponent,
  setStudents,
  //   filterStudents,
  //   resetStudentsData,
  //   setRowsPerPage,
  //   setPage,
  //   setCurrentPage,
  //   setSearchQuery,
  //   setStudents,
} from '../../components/studentsSlice.js'
import { fetchSchools } from '../../components/schoolsSlice.js'
import { SpinnerLoader } from '../../components/spinnerLoader.jsx'

import UpgradeIcon from '@mui/icons-material/Upgrade'
import { useAuth } from '../auth/authContext'

import '../../attendanceSheet.css'
import { Months, Years } from '../../../data/data'
import {
  Container,
  useTheme,
  Typography,
  Table,
  Button,
  TableBody,
  TableCell,
  Select,
  MenuItem,
  TableContainer,
  IconButton,
  TableHead,
  TableRow,
  Paper,
  Box,
  TextField,
  Grid,
  InputLabel,
  Autocomplete,
  Fade,
  Checkbox
} from '@mui/material'
import { DataArrayOutlined, Dataset } from '@mui/icons-material'

export const UpdateAttendanceSheet = () => {
  const { userPermissions } = useAuth()
  // const [currentPage, setCurrentPage] = useState(1);
  //   const [perPage, setPerPage] = useState(100) // Number of students per page
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const schoolsState = useSelector((state) => state.schools)
  const studentsState = useSelector((state) => state.students)
  const {
    data: schoolsData,
    loading: schoolsLoading,
    error: schoolsError,
  } = schoolsState

  const contentRef = useRef(null)
  const reactToPrintFn = useReactToPrint({ contentRef })
  const {
    currentPage,
    filteredStudents,
    loading: studentsLoading,
    error: studentsError,
  } = studentsState
  const [filters, setFilters] = useState({
    file: '',
    ward: '',
    presentClass: '',
    sortBy: '',
    sortOrder: '',
    lga: '',
    schoolId: '',
    time: new Date().getTime(),
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    nationality: '',
    stateOfOrigin: '',
    enumerator: '',
    dateFrom: '',
    dateTo: '',
    yearOfEnrollment: '',
    yearOfAdmission: '',
    disabilitystatus: '',
    status: 'active',
    cohort: '',
  })
  const params = {
    status: filters.status,
    stateOfOrigin: filters.stateOfOrigin,
    ward: filters.ward,
    presentClass: filters.presentClass,
    lga: filters.lga,
    schoolId: filters.schoolId,
    nationality: filters.nationality,
    state: filters.state,
    enumerator: filters.enumerator,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    yearOfEnrollment: filters.yearOfEnrollment,
    yearOfAdmission: filters.yearOfAdmission,
    classAtEnrollment: filters.classAtEnrollment,
    disabilitystatus: filters.disabilitystatus,
    cohort: filters.cohort,
  }
  const filteredParams = Object.entries(params)
    .filter(([_, value]) => value != null && value !== '') // Filter out empty values
    .reduce((acc, [key, value]) => {
      acc[key] = value // Directly add each key-value pair to the accumulator
      return acc
    }, {})

  const sortParam = {
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  }

  useEffect(() => {
    dispatch(fetchSchools({ schoolType: '', lgaOfEnrollment: '' }))
  }, [dispatch])

  //   useEffect(() => {
  //     if (!filters.schoolId !== '') {
  //       dispatch(
  //         fetchStudentsFromComponent({
  //           filteredParams,
  //           sortParam,
  //           page: currentPage,
  //           limit: 500,
  //         })
  //       )
  //     }
  //   }, [dispatch, currentPage, rowsPerPage])

  // const [filterLoading, setFilterLoading] = useState(false);
  const schools = schoolsData
  const [schoolOptions, setSchoolOptions] = useState([]) // Start with an empty array
  const [hasMore, setHasMore] = useState(true) // To check if more data is available
  const [schoolLga, setSchoolLga] = useState('Nil') // Loading state for schools
  const [schoolCode, setSchoolCode] = useState(false) // Loading state for schools
  const [schoolName, setSchoolName] = useState(false) // Loading state for schools
  const [loadingSchools, setLoadingSchools] = useState(false) // Loading state for schools
  const [savingStatus, setSavingStatus] = useState(false) // Loading state for schools
  const [savingMessage, setSavingMessage] = useState('') // Loading state for schools
  const [page, setPage] = useState(1) // Kee

  // const [fetchLoading, setFetchLoading] = useState(false)

  // const [filteredData, setFilteredData] = useState([]); // State for filtered data
  const [checked, setChecked] = useState(false)

  // const [allStudentsData, setAllStudentsData] = useState([]); // State for filtered data
  // const [snackbarOpen, setSnackbarOpen] = useState(true); // State to control visibility

  const [studentsData, setStudentsData] = useState(filteredStudents)

  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`
  const token = localStorage.getItem('token') || ''

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

  useEffect(() => {
    setStudentsData(filteredStudents)
  }, [filteredStudents])

  const fetchMoreSchools = async (page) => {
    // Simulate network request to fetch schools for the current page
    return new Promise((resolve) => {
      setTimeout(() => {
        const startIndex = (page - 1) * 20
        resolve(schools.slice(startIndex, startIndex + 20)) // Return a slice of the schools array
      }, 1000)
    })
  }

  const clearFilters = () => {
    setFilters({
      ward: '',
      presentClass: '',
      sortBy: '',
      lga: '',
      schoolId: '',
    })
    // setStudentsData(studentsData);
  }

  // useEffect(() => {
  //     dispatch(resetStudentsData())
  // }, [clearFilters])

  const handleInputChange = useCallback((e) => {
    const { name, value, type, files } = e.target
    if (type === 'file') {
      setFilters({
        ...filters,
        [name]: files[0] || null, // Store the first selected file or null if no file
      })
    } else {
      setFilters((prevFilters) => {
        const updatedFilters = {
          ...prevFilters,
          [name]: value,
        }
        return updatedFilters
      })
    }
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    dispatch(
      fetchStudentsFromComponent({
        filteredParams,
        sortParam,
        page: currentPage,
        limit: 1000,
      })
    )
  }

  const handleChecked = async (studentId, present, date) => {
    // console.log(present, date)
    // console.log(studentId, present, `${API_URL}/attendance`)
    setSavingStatus(true)
    setSavingMessage('Saving record .....')

    const token = localStorage.getItem('token') || ''

    try {
      const res = await axios.post(
        `${API_URL}/attendance`,
        {
          studentId,
          present,
          date, // Must be a valid ISO string like "2025-07-10"
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      setStudentsData((prev) =>
        prev.map((student) => {
          if (student.studentId === studentId) {
            const updatedAttendance = student.attendance.map((day) => {
              const sameDay =
                new Date(day.date).toISOString() ===
                new Date(date).toISOString()
              if (sameDay) {
                return { ...day, present }
              }
              return day
            })

            return {
              ...student,
              attendance: updatedAttendance,
            }
          }
          return student
        })
      )
      setSavingStatus(true)
      setSavingMessage('Record Saved')
      const timeout = setTimeout(() => setSavingMessage(''), 5000)
      return () => clearTimeout(timeout) // cleanup



    } catch (err) {
      setSavingStatus(false)
      const timeout = setTimeout(
        () => setSavingMessage(err.response?.data || err.response?.data?.message || err.message || 'Error saving attendance'),
        5000
      )
      console.error(err)
      console.error(
        '❌ Error saving attendance:',
        err.response?.data || err.message
      )
      return () => clearTimeout(timeout) // cleanup
      // Optional: show error toast or retry logic
    }
  }
  const getAttendanceTable = async (e) => {
    e.preventDefault()
    // console.log(filters)
    const token = localStorage.getItem('token') || ''
    try {
      const response = await axios.get(`${API_URL}/attendance`, {
        params: {
          year: Number(filters.year),
          month: Number(filters.month) + 1,
          schoolId: filters.schoolId,
        },
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setStudentsData(response.data.table)
      // Optional: show toast, update local UI state, etc.
    } catch (err) {
      console.error(err)
      console.error(
        '❌ Error saving attendance:',
        err.response?.data || err.message
      )
      const timeout = setTimeout(
        () =>
          setSavingMessage(
            err.response?.data ||
              err.response?.data?.message ||
              err.message ||
              'Error saving attendance'
          ),
        5000
      )
      return () => clearTimeout(timeout) // cleanup

      // Optional: show error toast or retry logic
    }
  }

  if (schoolsLoading || studentsLoading) {
    return (
      <Box
        sx={{
          display: 'flex', // Corrected from 'dispflex'
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          width: '90vw',
        }}
      >
        <SpinnerLoader />
      </Box>
    )
  }

  if (schoolsError || studentsError) {
    return (
      <div>
        Error: {schoolsError} {studentsError}
      </div>
    )
  }

  // console.log('filters', filters)

  // ! Generated Days

  const getMonthDaysWithWeekdays = (year, month) => {
    const days = []
    const date = new Date(year, month, 1) // month is 0-based (0 = Jan)

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] // First letters

    while (date.getMonth() === month) {
      const day = date.getDate()
      const weekday = dayNames[date.getDay()]
      days.push({
        weekday: `${weekday}`,
        day: `${day}`,
        date: date.toISOString().split('T')[0],
      })
      date.setDate(day + 1)
    }

    return days
  }

  const days = getMonthDaysWithWeekdays(filters.year, filters.month) // July 2025 → month = 6
  // console.log(filters)

  // console.log('students data', studentsData)

  const studentsSorted = [...studentsData].sort((a, b) => {
    const fullNameA = `${a.surname ?? ''} ${a.firstname ?? ''} ${
      a.middlename ?? ''
    }`.toLowerCase()
    const fullNameB = `${b.surname ?? ''} ${b.firstname ?? ''} ${
      b.middlename ?? ''
    }`.toLowerCase()
    return fullNameA.localeCompare(fullNameB)
  })

  const chunkStudentsData = chunk(studentsSorted, 25)

  // console.log(chunkStudentsData)

  // console.log(' saved students data:', studentsData)

  //   ! DOM
  return (
    <Box
      className="attendance-container"
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* ! Form section  */}
      <Box
        id="form"
        component="form"
        onSubmit={getAttendanceTable}
        display="flex"
        flexDirection="column"
        gap={2}
        p={3}
        sx={{
          backgroundColor: '#f9f9f9',
          borderRadius: 2,
          boxShadow: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Filter Students
        </Typography>
        <Grid container spacing={2} alignItems="center">
          {/* Existing Fields */}

          <Grid item xs={12} sm={6} md={4}>
            <InputLabel id="lga-label" sx={{ marginBottom: 1 }}>
              All Schools
            </InputLabel>
            {schoolOptions.length > 0 ? (
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
                  schoolOptions.find(
                    (option) => option._id === filters.schoolId
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFilters((prevFilters) => ({
                    ...prevFilters,
                    schoolId: newValue?._id || null,
                  }))
                  setSchoolCode(newValue?.schoolCode)
                  setSchoolLga(newValue?.LGA)
                  setSchoolName(newValue?.schoolName)
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

          <Grid item xs={12} sm={6} md={4}>
            <InputLabel id="month" sx={{ marginBottom: 1 }}>
              Select Month
            </InputLabel>
            <Select
              name="month"
              value={filters.month}
              onChange={handleInputChange}
              displayEmpty
              fullWidth
              size="small"
              labelId="month"
            >
              {/* <MenuItem value="">
                            <em>Select Month</em>
                          </MenuItem> */}
              {Months.map((month) => (
                <MenuItem key={month.id} value={month.id}>
                  {month.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <InputLabel id="year" sx={{ marginBottom: 1 }}>
              Select Year
            </InputLabel>
            <Select
              name="year"
              value={filters.year}
              onChange={handleInputChange}
              displayEmpty
              fullWidth
              size="small"
              labelId="year"
            >
              {/* <MenuItem value="">
                            <em>Select year</em>
                          </MenuItem> */}
              {Years.map((year) => (
                <MenuItem key={year.id} value={year.id}>
                  {year.name}
                </MenuItem>
              ))}
            </Select>
          </Grid>
        </Grid>

        <Box display="flex" justifyContent="space-between" gap={2} mt={2}>
          <Button
            variant="outlined"
            color="secondary"
            size="large"
            sx={{ textTransform: 'none', width: '48%' }}
            onClick={clearFilters}
          >
            Reset Filters
          </Button>

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={filters.schoolId === ''}
            sx={{
              textTransform: 'none',
              width: '48%',
              color: '#fff',
            }}
          >
            Filter Students
          </Button>
        </Box>
      </Box>
      {studentsData.length !== 0 && filters.month && filters.year ? (
        <Box component={'paper'} mt={5} ref={contentRef}>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              justifyContent: 'flex-end',
              marginTop: '20px',
            }}
          >
            <Button
              variant="contained"
              id="button"
              onClick={() => reactToPrintFn()}
            >
              Print Attendance Sheet
            </Button>
          </Box>
          <Box
            className="attendanceSheetHeader print-header print-header-view"
            data-running="pageHeader"
            sx={{
              display: 'flex',
              alignItems: 'center',
              //   gap: '50px',
              justifyContent: 'space-around',
              fontWeight: 700,
              textTransform: 'uppercase',
              fontSize: '10px',
              flexWrap: 'wrap',

              '& .borderedItem': {
                border: '2px solid black',
                display: 'block',
                padding: '5px',
                // width: '100%',
              },
              '& > .MuiBox-root > .MuiBox-root': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                gap: '10px',
                width: '100%',
              },
              '& > .MuiBox-root': {
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                flexDirection: 'column',
                width: '100%',
                gap: '3px',
              },
            }}
          >
            <Typography
              variant="h3"
              className="title"
              sx={{
                flexBasis: '100%',
                width: '100%',
              }}
            >
              KOGI AGILE OFFLINE STUDENTS' ATTENDANCE REGISTER FOR MIS/CCT
            </Typography>
            <Box
              sx={{
                flexBasis: '37%',
              }}
            >
              <Grid
                container
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Grid item xs={3}>
                  School Name:
                </Grid>{' '}
                <Grid item xs={9} className="borderedItem">
                  {schoolName}
                </Grid>
              </Grid>
              <Grid
                container
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Grid item xs={3}>
                  School Code:
                </Grid>{' '}
                <Grid item xs={9} className="borderedItem">
                  {schoolCode}
                </Grid>
              </Grid>
            </Box>
            <Box
              sx={{
                flexBasis: '20%',
              }}
            >
              <Grid
                container
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Grid item xs={2}>
                  time:
                </Grid>{' '}
                <Grid item xs={10} className="borderedItem">
                  {new Date(filters.time)?.toLocaleString()}
                </Grid>
              </Grid>
              <Grid
                container
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Grid item xs={2}>
                  lga:
                </Grid>{' '}
                <Grid item xs={10} className="borderedItem">
                  {schoolLga}
                </Grid>
              </Grid>
            </Box>
            <Box
              sx={{
                flexBasis: '20%',
              }}
            >
              <Grid
                container
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Grid item xs={3}>
                  month:
                </Grid>{' '}
                <Grid item xs={9} className="borderedItem">
                  {Months.find((month) => month.id === filters.month)?.name}
                </Grid>
              </Grid>
              <Grid
                container
                sx={{
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Grid item xs={3}>
                  year:
                </Grid>{' '}
                <Grid item xs={9} className="borderedItem">
                  {filters.year}
                </Grid>
              </Grid>
            </Box>
          </Box>

          {chunkStudentsData.map((studentsGroup, pageIndex) => {
            return (
              <Box className="printable-area" key={pageIndex + 1}>
                <Box
                  className="attendanceSheetHeader print-header print-header-print"
                  data-running="pageHeader"
                  sx={{
                    alignItems: 'center',
                    //   gap: '50px',
                    justifyContent: 'space-around',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    fontSize: '10px',
                    flexWrap: 'wrap',

                    '& .borderedItem': {
                      border: '2px solid black',
                      display: 'block',
                      padding: '5px',
                      // width: '100%',
                    },
                    '& > .MuiBox-root > .MuiBox-root': {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: '10px',
                      width: '100%',
                    },
                    '& > .MuiBox-root': {
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      width: '100%',
                      gap: '3px',
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    className="title"
                    sx={{
                      flexBasis: '100%',
                      width: '100%',
                    }}
                  >
                    KOGI AGILE OFFLINE STUDENTS' ATTENDANCE REGISTER FOR MIS/CCT
                  </Typography>
                  <Box
                    sx={{
                      flexBasis: '37%',
                    }}
                  >
                    <Grid
                      container
                      sx={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Grid item xs={3}>
                        School Name:
                      </Grid>{' '}
                      <Grid item xs={9} className="borderedItem">
                        {schoolName}
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      sx={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Grid item xs={3}>
                        School Code:
                      </Grid>{' '}
                      <Grid item xs={9} className="borderedItem">
                        {schoolCode}
                      </Grid>
                    </Grid>
                  </Box>
                  <Box
                    sx={{
                      flexBasis: '20%',
                    }}
                  >
                    <Grid
                      container
                      sx={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Grid item xs={2}>
                        time:
                      </Grid>{' '}
                      <Grid item xs={10} className="borderedItem">
                        {new Date(filters.time).toLocaleString()}
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      sx={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Grid item xs={2}>
                        lga:
                      </Grid>{' '}
                      <Grid item xs={10} className="borderedItem">
                        {schoolLga}
                      </Grid>
                    </Grid>
                  </Box>
                  <Box
                    sx={{
                      flexBasis: '20%',
                    }}
                  >
                    <Grid
                      container
                      sx={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Grid item xs={3}>
                        month:
                      </Grid>{' '}
                      <Grid item xs={9} className="borderedItem">
                        {
                          Months.find((month) => month.id === filters.month)
                            ?.name
                        }
                      </Grid>
                    </Grid>
                    <Grid
                      container
                      sx={{
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Grid item xs={3}>
                        year:
                      </Grid>{' '}
                      <Grid item xs={9} className="borderedItem">
                        {filters.year}
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
                <Box
                  className="attendance-table-container"
                  sx={{
                    '@media Print': {
                      // height: '150mm',
                    },
                  }}
                >
                  <table className="attendance-table">
                    <thead>
                      <tr>
                        {/* <th>S/N</th> */}
                        <th className="name-col">Student Name</th>
                        {days.map((day, idx) => (
                          <th key={idx}>
                            <Box
                              sx={{
                                display: 'flex',
                                flexDirection: 'column',
                              }}
                            >
                              <span
                                style={{
                                  background: '#000',
                                  color: '#fff',
                                }}
                              >
                                {day.weekday}
                              </span>
                              <span>{day.day}</span>
                            </Box>
                          </th>
                        ))}
                        <th>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              width: '100%',
                              justifyContent: 'center',
                            }}
                            className={'p-total'}
                          >
                            <span>P</span>
                            <span>Total</span>
                          </Box>
                        </th>
                        <th>
                          <div
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              width: '100%',
                              justifyContent: 'center',
                            }}
                            className={'x-total'}
                          >
                            <span>X</span>
                            <span>Total</span>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsGroup.map((student, index) => {
                        const sn = String(pageIndex * 25 + index + 1).padStart(
                          3,
                          '0'
                        )

                        return (
                          <>
                            <tr key={index}>
                              <td className="name-col">
                                <div className="sn-name-wrapper">
                                  <span className="sn-cell">{sn}</span>
                                  <span className="name-cell">
                                    {student.surname} {student.firstname}{' '}
                                    {student.middlename}
                                  </span>
                                </div>
                              </td>
                              {student.attendance.map((date, i) => {
                                const splittedDate = date.date.split('T')[0]

                                return (
                                  <td key={i}>
                                    <Checkbox
                                      sx={{
                                        width: '13px',
                                        height: '13px',
                                        accentColor: 'rgb(17, 74, 60)', // Green checkbox color (modern browsers only)
                                        backgroundColor: '#fff', // might not work alone
                                        cursor: 'pointer',
                                      }}
                                      type="checkbox"
                                      checked={date.present === true}
                                      // disabled
                                      onChange={(e) =>
                                        handleChecked(
                                          student.studentId,
                                          e.target.checked,
                                          splittedDate
                                        )
                                      }
                                    />
                                    {/* {date.present ? (
                                      <Checkbox
                                        checked
                                        onChange={(e) =>
                                          handleChecked(
                                            student.studentId,
                                            e.target.checked,
                                            splittedDate
                                          )
                                        }
                                      />
                                    ) : (
                                      <CloseIcon
                                        color="error"
                                        sx={{ cursor: 'pointer' }}
                                        onClick={(e) =>
                                          handleChecked(
                                            student.studentId,
                                            e.target.checked,
                                            splittedDate
                                          )
                                        }
                                      />
                                    )} */}
                                  </td>
                                )
                              })}
                              <td
                                className="p-total"
                                style={{
                                  fontWeight: 600,
                                  fontSize: '12px',
                                }}
                              >
                                {student.attendance.filter(
                                  (day) => day.present === true
                                ).length * 5}
                              </td>
                              <td
                                className="x-total"
                                style={{
                                  fontWeight: 600,
                                  fontSize: '12px',
                                }}
                              >
                                {' '}
                                {student.attendance.filter(
                                  (day) => day.present === false
                                ).length * 5}
                              </td>
                            </tr>
                          </>
                        )
                      })}
                    </tbody>
                  </table>
                </Box>
                <Box
                  className="print-footer print-footer-print"
                  sx={{
                    justifyContent: 'space-around',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '5px',
                    marginTop: '10px',
                  }}
                >
                  <table
                    border={1}
                    style={{
                      borderCollapse: 'collapse',
                      textAlign: 'center',
                      flexBasis: '30%',
                      fontSize: '9px',
                    }}
                  >
                    <tbody style={{ fontWeight: 'bold' }}>
                      <tr>
                        <td
                          rowSpan="2"
                          style={{
                            fontWeight: 'bold',
                            padding: '8px',
                            borderRight: '1px solid black',
                            verticalAlign: 'middle',
                            borderBottom: 'none', // removes bottom border from merged cell
                          }}
                        >
                          LEGEND
                        </td>
                        <td>P</td>
                        <td>=</td>
                        <td>Present</td>
                        <td>
                          <CheckIcon />
                        </td>
                      </tr>
                      <tr>
                        <td>X</td>
                        <td>=</td>
                        <td>Absent</td>
                        <td>
                          <CloseIcon />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <table
                    border={1}
                    style={{
                      borderCollapse: 'collapse',
                      textAlign: 'left',
                      flexBasis: '58%',
                      fontSize: '9px',
                      padding: 0,
                      marging: 0,
                    }}
                  >
                    <tbody
                      style={{ fontWeight: 'bold' }}
                      className="tbody-instructions"
                    >
                      <tr style={{ fontWeight: 800, fontSize: '12px' }}>
                        <td>ATTENDANCE TAKING INSTRUCTIONS</td>
                      </tr>
                      <tr>
                        <td>
                          {' '}
                          1. Be present before the start of the school to
                          observe the full attendance process
                        </td>
                      </tr>
                      <tr>
                        <td>
                          2. Cross-check names using the class attendance
                          register provided by the teacher.
                        </td>
                      </tr>
                      <tr>
                        <td>
                          3. Mark ✔ for Present and mark X for Absent: Clearly
                          indicate each student’s status against their name for
                          the day.
                        </td>
                      </tr>
                      <tr>
                        <td>
                          4. Ensure that only red pen is used for marking.
                        </td>
                      </tr>
                      <tr>
                        <td>
                          {' '}
                          5. Take a snapshot of the main school attendance
                          register for onward transmission to the Compliance
                          Specialist.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      width: '70%',
                      '& .MuiTypography-body1': {
                        fontWeight: 700,
                        fontSize: '10px',
                      },
                    }}
                  >
                    <Typography>CONSULTANT: ERICLAFIA LIMITED</Typography>
                    {/* <Typography>ENUMERATOR NAME</Typography> */}
                    <Typography>PHONE:</Typography>
                    <Typography>SIGN: </Typography>
                  </Box>
                </Box>
              </Box>
            )
          })}
          <Box
            className="print-footer print-footer-view"
            sx={{
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: '5px',
              marginTop: '10px',
            }}
          >
            <table
              border={1}
              style={{
                borderCollapse: 'collapse',
                textAlign: 'center',
                flexBasis: '30%',
                fontSize: '9px',
              }}
            >
              <tbody style={{ fontWeight: 'bold' }}>
                <tr>
                  <td
                    rowSpan="2"
                    style={{
                      fontWeight: 'bold',
                      padding: '8px',
                      borderRight: '1px solid black',
                      verticalAlign: 'middle',
                      borderBottom: 'none', // removes bottom border from merged cell
                    }}
                  >
                    LEGEND
                  </td>
                  <td>P</td>
                  <td>=</td>
                  <td>Present</td>
                  <td>
                    <CheckIcon />
                  </td>
                </tr>
                <tr>
                  <td>X</td>
                  <td>=</td>
                  <td>Absent</td>
                  <td>
                    <CloseIcon />
                  </td>
                </tr>
              </tbody>
            </table>
            <table
              border={1}
              style={{
                borderCollapse: 'collapse',
                textAlign: 'left',
                flexBasis: '58%',
                fontSize: '9px',
                padding: 0,
                marging: 0,
              }}
            >
              <tbody
                style={{ fontWeight: 'bold' }}
                className="tbody-instructions"
              >
                <tr style={{ fontWeight: 800, fontSize: '12px' }}>
                  <td>ATTENDANCE TAKING INSTRUCTIONS</td>
                </tr>
                <tr>
                  <td>
                    {' '}
                    1. Be present before the start of the school to observe the
                    full attendance process
                  </td>
                </tr>
                <tr>
                  <td>
                    2. Cross-check names using the class attendance register
                    provided by the teacher.
                  </td>
                </tr>
                <tr>
                  <td>
                    3. Mark ✔ for Present and mark X for Absent: Clearly
                    indicate each student’s status against their name for the
                    day.
                  </td>
                </tr>
                <tr>
                  <td>4. Ensure that only red pen is used for marking.</td>
                </tr>
                <tr>
                  <td>
                    {' '}
                    5. Take a snapshot of the main school attendance register
                    for onward transmission to the Compliance Specialist.
                  </td>
                </tr>
              </tbody>
            </table>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '70%',
                '& .MuiTypography-body1': {
                  fontWeight: 700,
                  fontSize: '10px',
                },
              }}
            >
              <Typography>CONSULTANT: ERICLAFIA LIMITED</Typography>
              {/* <Typography>ENUMERATOR NAME</Typography> */}
              <Typography>PHONE:</Typography>
              <Typography>SIGN: </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '50px',
          }}
        >
          <Typography variant="h4">
            No student found in the selected school
          </Typography>
        </Box>
      )}

      <Box sx = {{
        position: "fixed", 
        bottom: "4%", 
        right: "4%"
      }}>
          {savingMessage && <Button variant='contained'>{savingMessage}</Button>}
      </Box>
    </Box>
  )
}
