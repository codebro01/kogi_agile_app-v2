import  {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo
} from 'react'
import { useNavigate } from 'react-router-dom'

import chunk from 'lodash.chunk'
// import { PersonLoader } from '../../components/personLoader'

// import { SchoolsContext } from '../../components/dataContext.jsx'

import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import { useSelector, useDispatch } from 'react-redux'
import { useReactToPrint } from 'react-to-print'
import { fetchDashboardStat } from '../../components/dashboardStatsSlice'

import {

  fetchStudentsFromComponent,

} from '../../components/studentsSlice.js'
import { fetchSchools } from '../../components/schoolsSlice.js'
import { useAuth } from '../auth/authContext'

import '../../attendanceSheet.css'
import { Months, Years } from '../../../data/data'
import {

  Typography,
  Button,
 
  Select,
  MenuItem,
  
  Box,
  TextField,
  Grid,
  InputLabel,
  Autocomplete,
  CircularProgress,
} from '@mui/material'

export const AttendanceSheet = () => {
  // const [currentPage, setCurrentPage] = useState(1);
  const dispatch = useDispatch()
  const schoolsState = useSelector((state) => state.schools)
  const studentsState = useSelector((state) => state.students)
  const dashboardStatState = useSelector((state) => state.dashboardStat)



  const {
    data: dashboardData,
    loading: dashboardStatLoading,
    error: dashboardStatError,
  } = dashboardStatState

  const contentRef = useRef(null)
  const reactToPrintFn = useReactToPrint({ contentRef })
  const {
    currentPage,
   
    filteredStudents,
    loading: studentsLoading,
  
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

    useEffect(() => {
      dispatch(fetchDashboardStat())
    }, [dispatch])

  

  // const [allStudentsData, setAllStudentsData] = useState([]); // State for filtered data
  // const [snackbarOpen, setSnackbarOpen] = useState(true); // State to control visibility

  const [studentsData, setStudentsData] = useState(filteredStudents)


  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`

 

  useEffect(() => {
    setStudentsData(filteredStudents)
  }, [filteredStudents])



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

  const classOptions = [
    { class: 'Primary 6', id: 1 },
    { class: 'JSS 1', id: 2 },
    { class: 'JSS 2', id: 3 },
    { class: 'JSS 3', id: 4 },
    { class: 'SSS 1', id: 5 },
  ]

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

  // const handlePrint = () => {
  //   const previewer = new Previewer()

  //   previewer.preview(contentRef.current).then(() => {
  //     // trigger native print after paged.js renders it
  //     window.print()
  //   })
  // }

  // if (schoolsLoading || studentsLoading) {
  //   return (
  //     <Box
  //       sx={{
  //         display: 'flex', // Corrected from 'dispflex'
  //         flexDirection: 'column',
  //         justifyContent: 'center',
  //         alignItems: 'center',
  //         height: '50vh',
  //         width: '90vw',
  //       }}
  //     >
  //       <SpinnerLoader />
  //     </Box>
  //   )
  // }



  // console.log('filters', filters)

  // ! Generated Days

  const getMonthDaysWithWeekdays = (year, month) => {
    const days = []
    const date = new Date(year, month, 1) // month is 0-based (0 = Jan)

    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'] // Just for reference

    while (date.getMonth() === month) {
      const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday

      // Skip weekends
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const day = date.getDate()
        const weekday = dayNames[dayOfWeek]
        days.push({
          weekday: `${weekday}`,
          day: `${day}`,
          date: date.toISOString().split('T')[0],
        })
      }

      date.setDate(date.getDate() + 1) // move to next day
    }

    return days
  }

  const days = getMonthDaysWithWeekdays(filters.year, filters.month) // July 2025 → month = 6

  
  // console.log(filters)

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

  const getUniqueSchools =
    dashboardData?.results?.[0]?.distinctSchoolsDetails || []

 const uniqueSchools = useMemo(() => {
    const sorted = [...getUniqueSchools].sort((a, b) =>
      a.schoolName.toLowerCase().localeCompare(b.schoolName.toLowerCase())
    )
    return [
      {
        schoolName: 'All Schools',
        schoolId: 'all',
        schoolCode: '',
        LGA: '',
      },
      ...sorted,
    ]
  }, [getUniqueSchools])

  // console.log(schoolOptions, uniqueSchools)
  // console.log(uniqueSchools)
  return (
    <Box
      className="attendance-container"
      sx={{ display: 'flex', flexDirection: 'column' }}
    >
      {/* ! Form section  */}
      <Box
        id="form"
        component="form"
        onSubmit={handleSubmit}
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
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          Export Students Attendance Sheet
        </Typography>
        <Grid container spacing={2} alignItems="center">
          {/* Existing Fields */}

          <Grid item xs={12} sm={6} md={4}>
            <InputLabel id="lga-label" sx={{ marginBottom: 1 }}>
              All Schools
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
                    (option) => option.schoolId === filters.schoolId
                  ) || null
                }
                onChange={(event, newValue) => {
                  setFilters((prevFilters) => ({
                    ...prevFilters,
                    schoolId: newValue?.schoolId || null,
                  }))
                }}
                options={uniqueSchools}
                getOptionLabel={(option) => option?.schoolName || ''}
                isOptionEqualToValue={(option, value) =>
                  option?.schoolId === value?.schoolId
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
          <Grid item xs={12} sm={6} md={4}>
            <InputLabel id="class-label" sx={{ marginBottom: 1 }}>
              Present Class
            </InputLabel>
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
            disabled={filters.schoolId === '' || studentsLoading || filters.schoolId === 'all'}
            sx={{
              textTransform: 'none',
              width: '48%',
              color: '#fff',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '20px',
            }}
          >
            Load Attendance
            {studentsLoading && <CircularProgress size={20} />}
          </Button>
        </Box>

      </Box>
      {studentsData.length !== 0 && filters.year ? (
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
                  {studentsData[0]?.schoolId?.schoolName}
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
                  {studentsData[0]?.schoolId?.schoolCode}
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
                  {studentsData[0]?.schoolId?.LGA}
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
                  month/
                  <br />
                  Year:
                </Grid>{' '}
                <Grid item xs={9} className="borderedItem">
                  {Months.find((month) => month.id === filters.month)?.name},
                  &nbsp;
                  {filters.year}
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
                  Class:
                </Grid>{' '}
                <Grid item xs={9} className="borderedItem">
                  {filters.presentClass || 'All classes'}
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
                        {studentsData[0]?.schoolId?.schoolName}
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
                        {studentsData[0]?.schoolId?.schoolCode}
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
                        {studentsData[0]?.schoolId?.LGA}
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
                        month/
                        <br />
                        Year:
                      </Grid>{' '}
                      <Grid item xs={9} className="borderedItem">
                        {
                          Months.find((month) => month.id === filters.month)
                            ?.name
                        }
                        , &nbsp;
                        {filters.year}
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
                        Class:
                      </Grid>{' '}
                      <Grid item xs={9} className="borderedItem">
                        {filters.presentClass || 'All classes'}
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
                              {days.map((day, i) => (
                                <td key={i}>
                                  {/* <input type="checkbox" /> */}
                                </td>
                              ))}
                              <td className="p-total"></td>
                              <td className="x-total"></td>
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
    </Box>
  )
}
