import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  memo,
} from 'react'
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

// import { StudentsContext } from '../../components/dataContext'
import axios from 'axios'
import { resolvePath, useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit'
import { tokens } from '../../theme'
// import { PersonLoader } from '../../components/personLoader'
import { getNigeriaStates } from 'geo-ng'
import lgasAndWards from '../../Lga&wards.json'
// import { SchoolsContext } from '../../components/dataContext.jsx'
import DataTable from 'react-data-table-component'
import DeleteIcon from '@mui/icons-material/Delete'
import { useSelector, useDispatch } from 'react-redux'
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

// Import context

export const AdminViewAllStudentsDataNoExport = () => {
  const { userPermissions } = useAuth()
  const theme = useTheme()
  const colors = tokens(theme.palette.mode)
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
    nationality: '',
    stateOfOrigin: '',
    enumerator: '',
    dateFrom: '',
    dateTo: '',
    yearOfEnrollment: '',
    yearOfAdmission: '',
    disabilitystatus: '',
    status: 'active',
    cohort: '' 
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
    dispatch(
      fetchStudentsFromComponent({
        filteredParams,
        sortParam,
        page: currentPage,
        limit: rowsPerPage,
      })
    )
  }, [dispatch, currentPage, rowsPerPage])

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
        limit: rowsPerPage,
      })
    )
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

  console.log(filters)

  return (
    <>
      {userPermissions.includes('handle_registrars') ||
      userPermissions.includes('handle_payments') ? (
        <Container
          maxWidth="lg"
          sx={{ marginTop: 4, marginBottom: '50px', position: 'relative' }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItem: 'center',
              width: '100px',
              position: 'fixed',
              background: 'transparent',
              zIndex: 999999,
              right: 50,
              bottom: 30,
              gap: "10px"
            }}
          >
            <Box
              sx={{
                display:"flex", 
                justifyContent:"center", 
                alignItems:"center", 
                padding: '12px',
                background: 'rgb(194, 186, 186)',
                cursor: "pointer"

              }}
            
              onClick={handleEditManyStudents}
            >
              <EditIcon />
            </Box>

            <DeleteButton
              onConfirm={handleDeleteManyStudents}
              itemName="Students Record"
              selectedRows={selectedStudents}
            />
          </Box>

          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            textAlign="center"
            sx={{ fontWeight: 'bold' }}
          >
            View All Students
          </Typography>
          {/* Promotion section */}

          {userPermissions.includes('handle_registrars') && (
            <Paper
              elevation={3}
              sx={{
                padding: {
                  xs: '8px',
                  sm: '20px',
                  md: '30px',
                },
                background: '#f7f5f5',
                marginBottom: '30px',
              }}
            >
              <Box
                sx={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1.2rem',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: '600',
                  }}
                >
                  {' '}
                  Students Promotion
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#196b57',
                    color: 'white',
                    display: 'flex',
                    '&:hover': {
                      backgroundColor: '#155e4b', // Darker shade for hover effect
                    },
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  endIcon={
                    checked ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />
                  }
                  onClick={handleChecked}
                >
                  Promote Students
                </Button>
                {checked && (
                  <Fade in={checked}>
                    <Grid container spacing={2}>
                      {classPromotionOptions.map((presentClass, index) => (
                        <Grid
                          key={presentClass.id}
                          item
                          xs={12} // Full width on extra-small screens
                          sm={4} // 3 buttons per row on small screens
                          md={2.4} // 5 buttons per row on medium and large screens
                        >
                          <Button
                            key={presentClass.id}
                            variant="contained"
                            fullWidth
                            sx={{
                              background: '#196b57',
                              '&:hover': {
                                background: '#145944', // Slightly darker for hover effect (optional)
                              },
                            }}
                            onClick={() =>
                              handleBulkPromotion(presentClass.prevClass)
                            }
                          >
                            {presentClass.prevClass}{' '}
                            <ArrowForwardIcon></ArrowForwardIcon>{' '}
                            {presentClass.class}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Fade>
                )}
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: '#196b57',
                    color: 'white',
                    display: 'flex',
                    '&:hover': {
                      backgroundColor: '#155e4b', // Darker shade for hover effect
                    },
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  endIcon={
                    demotionChecked ? (
                      <ArrowDropUpIcon />
                    ) : (
                      <ArrowDropDownIcon />
                    )
                  }
                  onClick={handleDemotionChecked}
                >
                  Demote Students
                </Button>
                {demotionChecked && (
                  <Fade in={demotionChecked}>
                    <Grid container spacing={2}>
                      {classPromotionOptions.map((presentClass, index) => (
                        <Grid
                          key={presentClass.id}
                          item
                          xs={12} // Full width on extra-small screens
                          sm={4} // 3 buttons per row on small screens
                          md={2.4} // 5 buttons per row on medium and large screens
                        >
                          <Button
                            key={presentClass.id}
                            variant="contained"
                            fullWidth
                            sx={{
                              background: '#196b57',
                              '&:hover': {
                                background: '#145944', // Slightly darker for hover effect (optional)
                              },
                            }}
                            onClick={() =>
                              handleBulkdemotion(presentClass.class)
                            }
                          >
                            {presentClass.prevClass} <ArrowBackwardIcon />{' '}
                            {presentClass.class}
                          </Button>
                        </Grid>
                      ))}
                    </Grid>
                  </Fade>
                )}
              </Box>
            </Paper>
          )}

          {/* Filter Form */}
          <Box
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
                <InputLabel id="lga-label" sx={{ marginBottom: 1 }}>
                  All LGA
                </InputLabel>
                <Select
                  name="lga"
                  value={filters.lga}
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
                <InputLabel id="ward-label" sx={{ marginBottom: 1 }}>
                  Select Ward
                </InputLabel>
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

              {/* New Fields */}
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel id="nationality-label" sx={{ marginBottom: 1 }}>
                  Nationality
                </InputLabel>
                <Select
                  name="nationality"
                  value={filters.nationality}
                  onChange={handleInputChange}
                  displayEmpty
                  fullWidth
                  size="small"
                  labelId="nationality-label"
                >
                  <MenuItem value="">
                    <em>Nationality</em>
                  </MenuItem>
                  {nationalityOptions?.map((nationality, index) => (
                    <MenuItem key={index} value={nationality.value}>
                      {nationality.value}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputLabel id="lga-label" sx={{ marginBottom: 1 }}>
                  All states
                </InputLabel>
                <Select
                  name="stateOfOrigin"
                  value={filters.stateOfOrigin || ''}
                  onChange={handleInputChange}
                  fullWidth
                  size="small"
                  labelId="state-label"
                >
                  <MenuItem value="">
                    <em>All States</em>
                  </MenuItem>
                  {statesData.map((state) => (
                    <MenuItem key={state} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputLabel id="enumerator-label" sx={{ marginBottom: 1 }}>
                  All Enumerator
                </InputLabel>
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
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputLabel id="year-label" sx={{ marginBottom: 1 }}>
                  Year of Enrollment
                </InputLabel>
                <Select
                  name="yearOfEnrollment"
                  value={filters.yearOfEnrollment || ''}
                  onChange={handleInputChange}
                  displayEmpty
                  fullWidth
                  size="small"
                  labelId="yearOfEnrollment-label"
                >
                  <MenuItem value="">
                    <em>All Year</em>
                  </MenuItem>
                  {registrationYearOptions?.map((yearOfEnrollment, index) => (
                    <MenuItem key={index} value={yearOfEnrollment.year}>
                      {yearOfEnrollment.year}
                    </MenuItem>
                  ))}
                </Select>
              </Grid>

              {/* <Grid item xs={12} sm={6} md={4}>
                                <InputLabel id="yearOfAdmission-label" sx={{ marginBottom: 1 }}>Year of Admission</InputLabel>
                                <Select
                                    name="yearOfAdmission"
                                    value={filters.yearOfAdmission}
                                    onChange={handleInputChange}
                                    displayEmpty
                                    fullWidth
                                    size="small"
                                    labelId="yearOfAdmission-label"
                                >
                                    <MenuItem value="">
                                        <em>All Year</em>
                                    </MenuItem>
                                    {yearOfAdmissionOptions?.map((yearOfAdmission, index) => (
                                        <MenuItem key={index} value={yearOfAdmission.year}>
                                            {yearOfAdmission.year}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </Grid> */}

              {/* Existing Fields */}
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel id="sortBy-label" sx={{ marginBottom: 1 }}>
                  Sort By
                </InputLabel>
                <Select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleInputChange}
                  displayEmpty
                  fullWidth
                  size="small"
                  labelId="sortBy-label"
                >
                  <MenuItem value="">
                    <em>Sort Criteria</em>
                  </MenuItem>
                  {['ward', 'lga', 'createdAt', 'presentClass'].map(
                    (option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    )
                  )}
                </Select>
              </Grid>

              {filters.sortBy && (
                <Grid item xs={12} sm={6} md={4}>
                  <InputLabel id="sortOrder-label" sx={{ marginBottom: 1 }}>
                    Sort Order
                  </InputLabel>
                  <Select
                    name="sortOrder"
                    value={filters.sortOrder}
                    onChange={handleInputChange}
                    displayEmpty
                    fullWidth
                    size="small"
                    labelId="sortOrder-label"
                  >
                    <MenuItem value="">
                      <em>Sort Order</em>
                    </MenuItem>
                    <MenuItem value="asc">asc</MenuItem>
                  </Select>
                </Grid>
              )}

              {/* Date Filter */}
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel sx={{ marginBottom: 1 }}>From</InputLabel>
                <TextField
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputLabel sx={{ marginBottom: 1 }}>To</InputLabel>
                <TextField
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputLabel
                  id="disabilitystatus-label"
                  sx={{ marginBottom: 1 }}
                >
                  Disability status
                </InputLabel>
                <Select
                  name="disabilitystatus"
                  value={filters.disabilitystatus || ''}
                  onChange={handleInputChange}
                  displayEmpty
                  fullWidth
                  size="small"
                  labelId="sortBy-label"
                >
                  <MenuItem value="">
                    <em>All</em>
                  </MenuItem>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <InputLabel id="active-status" sx={{ marginBottom: 1 }}>
                  Active status
                </InputLabel>
                <Select
                  name="status"
                  value={filters.status || 'active'}
                  onChange={handleInputChange}
                  displayEmpty
                  fullWidth
                  size="small"
                  labelId="sortBy-label"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <InputLabel id="cohort" sx={{ marginBottom: 1 }}>
                  Cohort
                </InputLabel>
                <Select
                  name="cohort"
                  value={filters.cohort || ''}
                  onChange={handleInputChange}
                  displayEmpty
                  fullWidth
                  size="small"
                  labelId="cohort"
                >
                  <MenuItem value=""><em>all</em></MenuItem>
                  <MenuItem value="1">1</MenuItem>
                  <MenuItem value="2">2</MenuItem>
                  <MenuItem value="3">3</MenuItem>
                  <MenuItem value="4">4</MenuItem>
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
                sx={{
                  textTransform: 'none',
                  width: '48%',
                  color: '#fff',
                  background: colors.main['darkGreen'],
                }}
              >
                Filter Students
              </Button>
            </Box>

            {filterError && <Typography>{filterError}</Typography>}
          </Box>

          {/* ! UPdate students bank account details */}

          <Box
            id="update-bank-acount"
            component={'form'}
            width={'100%'}
            display={'flex'}
            justifyContent={'flex-start'}
            alignItems={'center'}
            flexDirection={'column'}
            bgcolor={'#e1f8d9'}
            p={5}
            mt={3}
            gap={3}
            borderRadius={'6px'}
            onSubmit={(e) => handleBankAccountDetailsUpdate(e)}
          >
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center',
                fontWeight: 800,
              }}
            >
              Upload an excel file here to update students accounts information
            </Typography>

            <Box>
              <UploadButtonField handleInputChange={handleInputChange} />
            </Box>
            <Button
              type="submit"
              variant="contained"
              sx={{
                minWidth: '250px',
                padding: '8px 16px',
                borderRadius: '5px',
                display: 'flex',
                justifyContent: 'center',
                gap: 2,
                alignItems: 'center',
              }}
              //   disabled={!filters.file}
            >
              {updateAccountLoading === true ? (
                <Typography
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 2,
                    alignItems: 'center',
                  }}
                >
                  Please wait, this may take some time...
                  <CircularProgress
                    size={'30px'}
                    sx={{
                      color: '#fff',
                    }}
                  />
                </Typography>
              ) : (
                'Update Account Info'
              )}
            </Button>

            {!updateAccountLoading && (
              <Typography>{updateAccountMessage}</Typography>
            )}
          </Box>

          <Typography
            variant="h4"
            sx={{
              marginTop: '100px',
              marginBottom: '30px',
              textAlign: 'center',
              fontWeight: 800,
            }}
          >
            View Registered Students Information
          </Typography>
          <div>
            {/* Search Input */}
            <div style={{ marginBottom: '20px', position: 'relative' }}>
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
                onFocus={(e) =>
                  (e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)')
                }
                onBlur={(e) =>
                  (e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)')
                }
              />
            </div>
          </div>

          <DataTable
            title="View Registered Students Information"
            columns={columns}
            data={studentsData}
            selectableRows // Enable checkboxes
            onSelectedRowsChange={handleSelectedStudentsChange} // Handle selected rows
            progressPending={studentsLoading} // Show loading spinner
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
                  filteredParams,
                  sortParam,
                  page,
                  limit: rowsPerPage,
                })
              ) // Fetch data for the selected page
            }}
            onChangeRowsPerPage={(newLimit) => {
              // Update rowsPerPage in Redux state and fetch new data

              dispatch(setRowsPerPage(newLimit)) // Update rowsPerPage in Redux
              dispatch(
                fetchStudents({
                  filteredParams,
                  sortParam,
                  page: 1,
                  limit: newLimit,
                })
              ) // Fetch new data with updated limit
            }}
            customStyles={customStyles} // Applying the custom styles
          />

          {isModalOpen && (
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'rgba(0, 0, 0, 0.52)', // Semi-transparent black overlay
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'fixed',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  backgroundColor: '#fff',
                  padding: '20px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  width: {
                    lg: '30%',
                    md: '50%',
                    sm: '50%',
                    xs: '80%',
                  },
                  height: {
                    xs: '80vh',
                  },
                  overflowY: 'scroll',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                  }}
                >
                  <Typography sx={{ fontWeight: 700, fontSize: '17px' }}>
                    Student Details
                  </Typography>
                  <Box
                    onClick={() => setIsModalOpen(false)}
                    sx={{
                      cursor: 'pointer',
                    }}
                  >
                    <CancelIcon sx={{ color: 'red' }} />
                  </Box>
                </Box>

                <div style={{ alignSelf: 'center' }}>
                  <img src={`${selectedItem.passport}`} alt="" />
                </div>
                <p>
                  <strong>Student ID:</strong> {selectedItem.randomId}
                </p>
                <p>
                  <strong>Name:</strong>{' '}
                  {`${selectedItem.surname} ${selectedItem.firstname} ${
                    selectedItem.fiddlename || ''
                  }`}
                </p>
                <p>
                  <strong>School name:</strong>{' '}
                  {selectedItem.schoolId.schoolName}
                </p>
                <p>
                  <strong>Date of Birth:</strong> {selectedItem.dob}
                </p>
                <p>
                  <strong>state Of Origin:</strong> {selectedItem.stateOfOrigin}
                </p>
                <p>
                  <strong>LGA of Enrollment:</strong>{' '}
                  {selectedItem.lgaOfEnrollment}
                </p>
                <p>
                  <strong>Ward:</strong> {selectedItem.ward}
                </p>
                <p>
                  <strong>Present Class:</strong> {selectedItem.presentClass}
                </p>
                <p>
                  <strong>Year of Enrollment:</strong>{' '}
                  {selectedItem.yearOfEnrollment}
                </p>
                <p>
                  <strong>Parent Name:</strong> {selectedItem?.parentName}
                </p>
                <p>
                  <strong>Parent Contact:</strong> 0{selectedItem?.parentPhone}
                </p>
                <p>
                  <strong>Registered By: </strong>{' '}
                  {selectedItem?.createdBy?.fullName}
                </p>
                <button
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
              </Box>
            </div>
          )}

          {singlePromotionMessage && (
            <AlertSnackbars
              severityType="success"
              message={singlePromotionMessage}
              open={singleSnackbarOpen}
              onClose={() => setSingleSnackbarOpen(false)}
            />
          )}

          {bulkPromotionMessage && (
            <AlertSnackbars
              severityType="success"
              message={bulkPromotionMessage}
              open={bulkSnackbarOpen}
              onClose={() => setBulkSnackbarOpen(false)}
            />
          )}

          {bulkDemotionMessage && (
            <AlertSnackbars
              severityType="success"
              message={bulkDemotionMessage}
              open={bulkDemotionSnackbarOpen}
              onClose={() => setBulkDemotionSnackbarOpen(false)}
            />
          )}
        </Container>
      ) : (
        <h1>Not authorized to access this route</h1>
      )}
    </>
  )
}
