import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  memo,
  useRef,
} from 'react'
import axios from 'axios'
import { Previewer } from 'pagedjs'
import { resolvePath, useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import chunk from 'lodash.chunk'
import { tokens } from '../../theme'
// import { PersonLoader } from '../../components/personLoader'
import { getNigeriaStates } from 'geo-ng'
import lgasAndWards from '../../Lga&wards.json'
// import { SchoolsContext } from '../../components/dataContext.jsx'
import DataTable from 'react-data-table-component'
import DeleteIcon from '@mui/icons-material/Delete'
import CloseIcon from '@mui/icons-material/Close'
import CheckIcon from '@mui/icons-material/Check'
import { useSelector, useDispatch } from 'react-redux'
import { useReactToPrint } from 'react-to-print'

import {
  deleteStudent,
  fetchStudents,
  fetchStudentsFromComponent,
  filterStudents,
  resetStudentsData,
  setRowsPerPage,
  setPage,
  setCurrentPage,
  setSearchQuery,
  setStudents,
} from '../../components/studentsSlice.js'
import { fetchSchools } from '../../components/schoolsSlice.js'
import { SpinnerLoader } from '../../components/spinnerLoader.jsx'
import UpgradeIcon from '@mui/icons-material/Upgrade'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ArrowBackwardIcon from '@mui/icons-material/ArrowBack'
import { AlertSnackbars } from '../../components/alertSnackbar.jsx'
import CancelIcon from '@mui/icons-material/Cancel'
import { useAuth } from '../auth/authContext'
import { DeleteButton } from '../../components/deleteButton.jsx'
import { UploadButtonField } from '../../components/uploadButtonField.jsx'
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
  CircularProgress,
} from '@mui/material'

export const AttendanceSheet = ({
  students = [{ name: 'victor' }, { name: 'damilola' }],
}) => {
  const { userPermissions } = useAuth()
  // const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(100) // Number of students per page
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
    totalRows,
    rowsPerPage,
    data,
    filteredStudents,
    loading: studentsLoading,
    error: studentsError,
    searchQuery,
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
  const [loadingSchools, setLoadingSchools] = useState(false) // Loading state for schools
  const [page, setPage] = useState(1) // Kee
  const [filterError, setFilterError] = useState(null)
  const [statesData, setStatesData] = useState([])
  const [lgasData, setLgasData] = useState([])
  const [enumeratorsData, setEnumeratorsData] = useState([])
  const [enumeratorsLoading, setEnumeratorsLoading] = useState(false)
  // const [fetchLoading, setFetchLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  // const [filteredData, setFilteredData] = useState([]); // State for filtered data
  const [checked, setChecked] = useState(false)
  const [demotionChecked, setDemotionChecked] = useState(false)
  const [bulkPromotionMessage, setBulkPromotionMessage] = useState('')
  const [bulkPromotionLoading, setBulkPromotionLoading] = useState(false)
  const [singlePromotionMessage, setSinglePromotionMessage] = useState('')
  const [singlePromotionLoading, setSinglePromotionLoading] = useState(false)
  const [bulkDemotionMessage, setBulkDemotionMessage] = useState('')
  const [bulkdemotionLoading, setBulkDemotionLoading] = useState(false)
  // const [allStudentsData, setAllStudentsData] = useState([]); // State for filtered data
  // const [snackbarOpen, setSnackbarOpen] = useState(true); // State to control visibility
  const [singleSnackbarOpen, setSingleSnackbarOpen] = useState(false)
  const [bulkSnackbarOpen, setBulkSnackbarOpen] = useState(false)
  const [bulkDemotionSnackbarOpen, setBulkDemotionSnackbarOpen] =
    useState(false)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [studentsData, setStudentsData] = useState(filteredStudents)
  const [updateAccountMessage, setUpdateAccountMessage] = useState('')
  const [updateAccountLoading, setUpdateAccountLoading] = useState(false)

  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`
  const token = localStorage.getItem('token') || ''
  useEffect(() => {
    if (singlePromotionMessage) setSingleSnackbarOpen(true)
    if (bulkPromotionMessage) setBulkSnackbarOpen(true)
    if (bulkDemotionMessage) setBulkDemotionSnackbarOpen(true)
  }, [singlePromotionMessage, bulkPromotionMessage, bulkDemotionMessage])

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

  const yearOfAdmissionOptions = [
    { year: '2020' },
    { year: '2021' },
    { year: '2022' },
    { year: '2023' },
    { year: '2024' },
    { year: '2025' },
  ]

  const registrationYearOptions = [
    { year: '2024' },
    { year: '2025' },
    { year: '2026' },
    { year: '2027' },
    { year: '2028' },
    { year: '2029' },
  ]

  useEffect(() => {
    ;(async () => {
      try {
        const token = localStorage.getItem('token')
        setEnumeratorsLoading(true)
        const response = await axios.get(`${API_URL}/admin-enumerator`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        })
        const { registrars } = response.data
        setEnumeratorsData(registrars)
      } catch (err) {
        console.log(err)
      }
    })()
  }, [])
  // ! Nationality state and local government data set up
  const nationalityOptions = [
    { value: 'Nigeria', label: 'Nigeria' },
    { value: 'Others', label: 'Others' },
  ]
  const getLGAs = (stateName) => {
    const state = getNigeriaStates().find((s) => s.name === stateName)
    return state ? state.lgas : []
  }

  useEffect(() => {
    if (filters.nationality === 'Nigeria') {
      const statesObjects = getNigeriaStates()
      const newStates = statesObjects.map((state) => state.name)
      setStatesData(newStates)
    } else {
      setStatesData([])
      setLgasData([])
    }
  }, [filters.nationality])

  useEffect(() => {
    if (filters.state && filters.nationality === 'Nigeria') {
      const lgas = getLGAs(filters.state)
      setLgasData(lgas)
    } else {
      setLgasData([])
    }
  }, [filters.state, filters.nationality])

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
  const classPromotionOptions = [
    { class: 'JSS 1', prevClass: 'Primary 6', id: 1 },
    { class: 'JSS 2', prevClass: 'JSS 1', id: 2 },
    { class: 'JSS 3', prevClass: 'JSS 2', id: 3 },
    { class: 'SSS 1', prevClass: 'JSS 3', id: 4 },
    { class: 'SSS 2', prevClass: 'SSS 1', id: 5 },
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

  const handlePrint = () => {
    const previewer = new Previewer()

    previewer.preview(contentRef.current).then(() => {
      // trigger native print after paged.js renders it
      window.print()
    })
  }

  const handleChecked = () => {
    setChecked((prev) => !prev)
  }
  const handleDemotionChecked = () => {
    setDemotionChecked((prev) => !prev)
  }

  const handleEdit = (student) => {
    navigate(`/enumerator-dashboard/update-student/${student._id}`, {
      state: student,
    })
  }

  function DowngradeIcon() {
    return (
      <Box sx={{ transform: 'rotate(180deg)' }}>
        <UpgradeIcon sx={{ color: 'red' }} />
      </Box>
    )
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

  const handleDelete = (row) => {
    // Replace this with your actual delete logic, such as making an API request to delete the record
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${row.firstname} ${row.surname}?`
    )

    if (confirmDelete) {
      try {
        ;(async () => {
          try {
            dispatch(deleteStudent(row.randomId)).unwrap()
          } catch (err) {
            console.log(err)
          }
        })()

        // Optionally, you can refresh or re-fetch the data here
      } catch (error) {
        console.error('Error deleting student:', error)
      }
    }
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

    userPermissions.includes('handle_registrars') && {
      name: 'Edit',
      cell: (row) => (
        <button
          onClick={() => handleEdit(row)}
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
          <EditIcon style={{ marginRight: '8px', color: '#196b57' }} />
        </button>
      ),
    },

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
            fontSize: '12px',
          }}
        >
          View
        </Typography>
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
      name: 'School Type',
      selector: (row) => row?.schoolId?.schoolCategory,
      sortable: true,
    },
    {
      name: 'dob',
      selector: (row) => row?.dob,
      sortable: true,
    },
    {
      name: 'LGA of Enrollment',
      selector: (row) => row?.lgaOfEnrollment,
      sortable: true,
    },
    {
      name: 'Present Class',
      selector: (row) => row?.presentClass,
      sortable: true,
    },
    {
      name: 'Year of Enrollment',
      selector: (row) => row?.yearOfEnrollment,
      sortable: true,
    },
    {
      name: 'Src',
      selector: (row) => row?.src,
      sortable: true,
    },

    userPermissions.includes('handle_admins', 'handle_registrars') && {
      name: 'Promote',
      cell: (row) => (
        <button
          onClick={() => handleSinglePromotion(row)}
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
          <UpgradeIcon style={{ marginRight: '8px', color: '#196b57' }} />
        </button>
      ),
    },
    userPermissions.includes('handle_admins', 'handle_registrars') && {
      name: 'Demote',
      cell: (row) => (
        <button
          onClick={() => handleSingleDemotion(row)}
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
          <DowngradeIcon />
        </button>
      ),
    },
    userPermissions.includes('handle_admins') && {
      name: 'Delete',
      cell: (row) => (
        <button
          onClick={() => handleDelete(row)}
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
          <DeleteIcon style={{ marginRight: '8px', color: 'red' }} />
        </button>
      ),
    },
  ]

  const handleViewItem = (item) => {
    setSelectedItem(item)
    setIsModalOpen(true)
  }

  const handleSearch = (event) => {
    const query = event.target.value
    dispatch(setSearchQuery(query))
  }

  const handleSinglePromotion = async (row) => {
    const studentRandomId = row.randomId
    const getNextClass = (currentClass) => {
      const nextClassObj = classPromotionOptions.find(
        (option) => option.prevClass === currentClass
      )
      return nextClassObj ? nextClassObj.class : null
    }
    const currentClass = row.presentClass // Assuming `row.class` contains the student's current class
    const nextClass = getNextClass(currentClass)
    try {
      const confirmUpdate = window.confirm(
        `This action will promote ${row.surname} ${row.firstname} to the ${nextClass}.`
      )
      if (!confirmUpdate) return
      setSinglePromotionLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.patch(
        `${API_URL}/student/promote/single/student`,
        { studentRandomId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // params: {...studentRandomId},
          withCredentials: true,
        }
      )
      setSinglePromotionLoading(false)
      setSinglePromotionMessage(response.data.message)
    } catch (err) {
      console.error(err)
      setSinglePromotionLoading(false)
      setSinglePromotionMessage(err?.response?.data?.message)
    }
  }
  const handleSingleDemotion = async (row) => {
    const studentRandomId = row.randomId
    const getPrevClass = (currentClass) => {
      const nextClassObj = classPromotionOptions.find(
        (option) => option.class === currentClass
      )
      return nextClassObj ? nextClassObj.prevClass : null
    }
    const currentClass = row.presentClass // Assuming `row.class` contains the student's current class
    const prevClass = getPrevClass(currentClass)
    try {
      const confirmUpdate = window.confirm(
        `This action will demote ${row.surname} ${row.firstname} from ${currentClass} to ${prevClass}.`
      )
      if (!confirmUpdate) return
      setSinglePromotionLoading(true)
      const token = localStorage.getItem('token')
      const response = await axios.patch(
        `${API_URL}/student/demote/single/student`,
        { studentRandomId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          // params: {...studentRandomId},
          withCredentials: true,
        }
      )
      setSinglePromotionLoading(false)
      setSinglePromotionMessage(response.data.message)
    } catch (err) {
      console.error(err)
      setSinglePromotionLoading(false)
      setSinglePromotionMessage(err?.response?.data?.message)
    }
  }
  const handleBulkdemotion = async (presentClass) => {
    try {
      const token = localStorage.getItem('token')

      const confirmUpdate = window.confirm(
        `This action will demote all students in ${presentClass} to the previous class.`
      )
      if (!confirmUpdate) return
      setBulkDemotionLoading(true)
      const response = await axios.patch(
        `${API_URL}/student/demote/plenty/students`,
        { presentClass },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      )
      setBulkDemotionLoading(false)
      setBulkDemotionMessage(response.data.message)
    } catch (err) {
      console.error(err)
      setBulkDemotionLoading(false)
      setBulkDemotionMessage(response?.data?.message)
    }
  }
  const handleBulkPromotion = async (presentClass) => {
    try {
      const token = localStorage.getItem('token')

      const confirmUpdate = window.confirm(
        `This action will Promote all students in ${presentClass} to the next class.`
      )
      if (!confirmUpdate) return

      setBulkPromotionLoading(true)
      const response = await axios.patch(
        `${API_URL}/student/promote/plenty/students`,
        { presentClass },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      )
      setBulkPromotionLoading(false)
      setBulkPromotionMessage(response.data.message)
    } catch (err) {
      console.error(err)
      setBulkPromotionLoading(false)
      setBulkPromotionMessage(response?.data?.message)
    }
  }

  const handleSelectedStudentsChange = ({ selectedRows }) => {
    setSelectedStudents(selectedRows)
    // console.log('Selected Rows:', selectedStudents)
  }

  const handleDeleteManyStudents = async () => {
    try {
      // const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedStudents.length} students `)
      // if (!confirmDelete) return;
      // setDeleteLoading(true)

      const ids = selectedStudents.map(
        (selectedStudents) => selectedStudents.randomId
      )
      // const ids = selectedStudents.join(',');
      const joinedIds = ids.join(',')

      const response = await axios.delete(
        `${API_URL}/student/delete/delete-many/?ids=${joinedIds}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      )
      setStudentsData((prevStudents) =>
        prevStudents.filter((student) => !ids.includes(student.randomId))
      )

      setSelectedStudents([])
    } catch (err) {
      console.log(err)
      if (err.response.statusText === '"Unauthorized"' || err.status === 401)
        return navigate('/')
      alert(
        err.response?.message ||
          err.response?.data?.message ||
          err?.message ||
          'an error occured, please try again'
      )
    }
  }

  // ! handle bank accounts details update for students

  const handleBankAccountDetailsUpdate = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()
      formData.append('file', filters['file'])
      if (filters.file === '') {
        setUpdateAccountMessage('Please select a file')
        setTimeout(() => setUpdateAccountMessage(''), 2000)
        return
      }
      const token = localStorage.getItem('token')
      setUpdateAccountLoading(true)
      setUpdateAccountMessage('...Please wait while the update completes.')

      const response = await axios.patch(
        `${API_URL}/student/update/bank-account-details`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          withCredentials: true,
        }
      )
      setUpdateAccountLoading(false)
      setUpdateAccountMessage(
        'Students Accounts has been successfully updated!!!'
      )
      setFilters((prev) => ({ ...prev, file: '' }))
      setTimeout(() => {
        setUpdateAccountMessage('')
      }, 15000)
    } catch (err) {
      setUpdateAccountLoading(false)
      console.log(err)
      console.log(err.response?.data?.message)
      if (err.response?.data?.message) {
        setUpdateAccountMessage(err.response?.data?.message)
        setTimeout(() => {
          setUpdateAccountMessage('')
        }, 15000)
        return
      } else if (err.response?.data) {
        setUpdateAccountMessage(err.response?.data)
        setTimeout(() => {
          setUpdateAccountMessage('')
        }, 15000)
        return
      } else {
        setUpdateAccountMessage('An error occured, please try again')
        setTimeout(() => {
          setUpdateAccountMessage('')
        }, 15000)
      }
    }
  }

  console.log(selectedStudents.length)

  const handleEditManyStudents = () => {
    if (selectedStudents.length < 1) return

    // just pass the selected students as state
    navigate('/admin-dashboard/edit-many-students', {
      state: { selectedStudents },
    })
  }

  console.log('filters', filters)

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
  console.log(filters)

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

  console.log(chunkStudentsData)
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

        {filterError && <Typography>{filterError}</Typography>}
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
