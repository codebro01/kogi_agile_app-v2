import { useEffect, useState } from 'react'
import DataTable from 'react-data-table-component'
import { Box, IconButton, Typography, Button } from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import RestoreIcon from '@mui/icons-material/Restore'

export const RecycleBin = () => {
  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`

const [selectedStudents, setSelectedStudents] = useState([]);
const [recycleBinData, setRecycleBinData] = useState([]);
const [restoring, setRestoring] = useState(false);
const [restoreMessage, setRestoreMessage] = useState('');
const token = localStorage.getItem('token')
const navigate = useNavigate()
console.log(`${API_URL}/students/fetch/recycle-bin-data`)
  useEffect(() => {
    (async () => {
     try {
     
         const response = await axios.get(
           `${API_URL}/student/fetch/recycle-bin-data`,
           {
             headers: {
               Authorization: `Bearer ${token}`,
             },
             withCredentials: true,
           }
         )
         const { data } = response.data
        setRecycleBinData(data)
    } catch (err) {
        console.log(err)
        
    }
})()
}, [])

console.log('selectedStudents', selectedStudents)
  const handleRestore = async () => {
     try {
       const confirmDelete = window.confirm(`Are you sure you want to restore ${selectedStudents.length} students `)
       if (!confirmDelete) return;
       setRestoring(true)
 
       const ids = selectedStudents.map(
         (selectedStudents) => selectedStudents.randomId
       )
       // const ids = selectedStudents.join(',');
       const joinedIds = ids.join(',')
 
       await axios.post(
         `${API_URL}/student/restore/recycle-bin-data/?ids=${joinedIds}`,
         {},
         {
           headers: {
             Authorization: `Bearer ${token}`,
             'Content-Type': 'application/json',
           },
           withCredentials: true,
         }
       )
       setRecycleBinData((prevStudents) =>
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


    const handleSelectedStudentsChange = ({ selectedRows }) => {
      setSelectedStudents(selectedRows)
      // console.log('Selected Rows:', selectedStudents)
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
    }
  ]
  return (
    <Box>
      <Typography sx = {{
        textAlign: "center", 
        fontSize: "2rem", 
        fontWeight:"600"
      }}>Recycle Bin</Typography>

      {selectedStudents.length > 0 && <Button variant = {'contained'} marginLeft ={2} onclick = {handleRestore}>
          Restore
      </Button>}

      <DataTable
        title=""
        columns={columns}
        data={recycleBinData}
        selectableRows
        onSelectedRowsChange={handleSelectedStudentsChange} // Handle selected rows
        customStyles={customStyles}
      />
    </Box>
  )
}
