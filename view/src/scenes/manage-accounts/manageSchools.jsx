import React, { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchSchools, deleteSchool } from '../../components/schoolsSlice.js'
import { SpinnerLoader } from '../../components/spinnerLoader.jsx'
import DataTable from 'react-data-table-component'
import DeleteIcon from '@mui/icons-material/Delete'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useReactToPrint } from 'react-to-print'

export const ManageSchools = () => {
  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`
  const [schoolsByStudentsRegistered, setSchoolsByStudentsRegistered] =
    React.useState([])
  const [lgasByStudentsRegistered, setLgasByStudentsRegistered] =
    React.useState([])
  const [currentPage, setCurrentPage] = React.useState(1)
  const [rowsPerPage, setRowsPerPage] = React.useState(200)
  const [viewSchoolDetails, setViewSchoolDetails] = React.useState(true)

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handlePerRowsChange = (newPerPage, page) => {
    setRowsPerPage(newPerPage)
    setCurrentPage(page)
  }

  const dispatch = useDispatch()
  const schoolsState = useSelector((state) => state.schools)
  const {
    data: schoolsData,
    loading: schoolsLoading,
    error: schoolsError,
  } = schoolsState

  useEffect(() => {
    dispatch(fetchSchools({ schoolType: '', lgaOfEnrollment: '' }))
  }, [dispatch])

  useEffect(() => {
    ;(async () => {
      const token = localStorage.getItem('token')
      try {
        const [schoolsRes, lgasRes] = await Promise.all([
          axios.get(`${API_URL}/student/admin/schools-by-students-registered`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }),
          axios.get(`${API_URL}/student/admin/lgas-by-students-registered`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }),
        ])

        setSchoolsByStudentsRegistered(schoolsRes.data.data)
        setLgasByStudentsRegistered(lgasRes.data.data)
      } catch (error) {
        console.error(
          'Error fetching data:',
          error.response?.data || error.message
        )
      }
    })()
  }, [])

  // 1️⃣ Create a map of schoolId -> totalStudents
  const studentCountMap = new Map(
    schoolsByStudentsRegistered.map((school) => [
      school._id,
      school.schoolByStudentCount,
    ])
  )

  // Merge the count into the full schools list
  const allSchoolsData = schoolsData
    .map((school) => ({
      ...school,
      totalStudents: studentCountMap.get(school._id) || 0,
    }))
    // Sort by totalStudents in descending order
    .sort((a, b) => b.totalStudents - a.totalStudents)

  // console.log('allSchoolsData', allSchoolsData)

  // console.log(schoolsState)
  const handleDelete = (row) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${row.schoolName}?`
    )

    if (confirmDelete) {
      try {
        ;(async () => {
          try {
            dispatch(deleteSchool(row._id)).unwrap()
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

  const schoolColumns = [
    {
      name: 'S/N',
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
    },

    {
      name: 'School Name',
      selector: (row) => row.schoolName,
      sortable: true,
    },
    {
      name: 'Total Students',
      selector: (row) => row.totalStudents,
      sortable: true,
    },
    {
      name: 'School Code',
      selector: (row) => row.schoolCode,
      sortable: true,
    },
    {
      name: 'School Category',
      selector: (row) => row.schoolCategory,
      sortable: true,
    },
    {
      name: 'LGA',
      selector: (row) => row.LGA,
      sortable: true,
    },
    {
      name: 'Delete School',
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
  const lgaColumns = [
    {
      name: 'S/N',
      selector: (row, index) => (currentPage - 1) * rowsPerPage + index + 1,
      sortable: true,
    },

    {
      name: 'LGA Name',
      selector: (row) => row._id,
      sortable: true,
    },
    {
      name: 'Total Students',
      selector: (row) => row.lgaByStudentCount,
      sortable: true,
    },
   
  ]

  const contentRef = useRef(null)
  const reactToPrintFn = useReactToPrint({ contentRef })


  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        padding: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {' '}
        <Typography variant="h3">All Registered School</Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 5,
          alignItems: 'center',
        }}
      >
        <Link
          to={'/admin-dashboard/create-accounts/update-school-information'}
          style={{
            backgroundColor: '#196b57',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '5px',
            textDecoration: 'none',
          }}
        >
          <EditIcon />
        </Link>
        <Button
          variant="contained"
          onClick={() => reactToPrintFn()}
          sx={{ backgroundColor: '#196b57' }}
        >
          {viewSchoolDetails
            ? 'Print School Statistics'
            : 'Print LGA Statistics'}
        </Button>
        <Button
          variant="contained"
          onClick={() => setViewSchoolDetails(!viewSchoolDetails)}
          sx={{ backgroundColor: '#196b57' }}
        >
          {viewSchoolDetails
            ? 'Switch to View LGA Statistics'
            : 'Switch to View School Statistics Statistics'}
        </Button>
      </Box>
      {schoolsLoading ? (
        <CircularProgress />
      ) : schoolsError ? (
        <p>{schoolsError}</p>
      ) : (
        <Box className="printable-area" ref={contentRef}>
          {viewSchoolDetails ? (
            <DataTable
              columns={schoolColumns}
              data={allSchoolsData || []}
              pagination
              highlightOnHover
              pointerOnHover
              paginationPerPage={200} // Set the default number of rows to 200
              paginationRowsPerPageOptions={[100, 200, 500, 1000]} // Customize options for rows per page
              responsive
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
            />
          ) : (
            <DataTable
              columns={lgaColumns}
              data={lgasByStudentsRegistered || []}
              pagination
              highlightOnHover
              pointerOnHover
              paginationPerPage={200} // Set the default number of rows to 200
              paginationRowsPerPageOptions={[100, 200, 500, 1000]} // Customize options for rows per page
              responsive
              onChangePage={handlePageChange}
              onChangeRowsPerPage={handlePerRowsChange}
            />
          )}
        </Box>
      )}
    </Box>
  )
}
