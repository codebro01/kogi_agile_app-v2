import React, { useRef, useEffect, useMemo, useState } from 'react'
import {
  Container,
  Box,
  Typography,
  FormControlLabel,
  Switch,
  Button,
  CircularProgress,
  Grid,
  Pagination,
  Stack,
} from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { fetchStudentsFromComponent } from '../../components/studentsSlice.js'
import { useReactToPrint } from 'react-to-print'
import axios from 'axios'

// Utility: chunk an array into pages of 4 (2x2 layout per A4 page)

// Front side: two images side-by-side per student card
export const PhotoCardFront = ({ student }) => {
  const studentPassportUrl = student?.passport || '/placeholder-passport.png'
  const verificationImageUrl = student?.verificationImage || '/not-verified.png'
  const verifiedStatusText = student?.verified ? 'Verified' : 'Not Verified'
  const studentFullName = `${student?.surname || ''} ${
    student?.firstname || ''
  } ${student?.middlename || ''}`.trim()
  const parentPhone = student?.parentPhone
    ? `${String(student.parentPhone).startsWith('0') ? '' : '0'}${
        student.parentPhone
      }`
    : ''

  return (
    <Box
      className="id-front"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        width: '420px',
        height: '450px',
        //   borderRadius: 3,
        textAlign: 'center',
        p: 3,
        // paddingTop: '40px',

        boxShadow: 3,
        position: 'relative',
        //   backgroundColor: 'hsl(160deg 31.03% 94.31%)',

        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `url("/site-logo-dark-no-writeup.png")`,
          backgroundSize: '35%',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: '50% 80%',
          opacity: 0.3, // ✅ Reduce opacity to make the background faint
        },

        '@media Print': {
          width: '500px',
          height: '420px',
          breakInside: 'avoid',
          pageBreakInside: 'avoid',
        },
      }}
    >
      <Box sx={{ display: 'flex', flex: 1, minHeight: '0', gap: 3 }}>
        <Box sx={{ width: '50%', borderRight: '1px solid #eee' }}>
          <img
            src={studentPassportUrl}
            alt="Student Passport"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
        <Box sx={{ width: '50%' }}>
          <img
            src={verificationImageUrl}
            alt="Verification"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          mt: 3,
          fontSize: '10pt',
          '& > .MuiTypography-body1': {
            textAlign: 'left',
          },
        }}
      >
        <Typography>
          <strong>Name:</strong> {studentFullName}
        </Typography>
        <Typography>
          <strong>RandomID:</strong> {student?.randomId || ''}
        </Typography>
        <Typography>
          <strong>Class:</strong> {student?.presentClass || ''}
        </Typography>
        <Typography>
          <strong>Verification Status:</strong> {verifiedStatusText}
        </Typography>
        <Typography>
          <strong>Name of School:</strong> {student?.schoolId?.schoolName || ''}
        </Typography>
        <Typography>
          <strong>Parent/Caregiver’s Name:</strong> {student?.parentName || ''}
        </Typography>
        <Typography>
          <strong>Phone Number:</strong> {parentPhone}
        </Typography>
        <Typography>
          <strong>Assigned ATM Card No:</strong> {student?.cardNo || ''}
        </Typography>
      </Box>
    </Box>
  )
}

// Back side: key text fields only
// export const PhotoCardBack = ({ student }) => {
//   const verifiedStatusText = student?.verified ? 'Verified' : 'Not Verified'
//   const studentFullName = `${student?.surname || ''} ${
//     student?.firstname || ''
//   } ${student?.middlename || ''}`.trim()
//   const parentPhone = student?.parentPhone
//     ? `${String(student.parentPhone).startsWith('0') ? '' : '0'}${
//         student.parentPhone
//       }`
//     : ''

//   return (
//     <Box
//       className="id-front"
//       sx={{
//         display: 'flex',
//         flexDirection: 'column',
//         justifyContent: 'center',
//         width: '340px',
//         height: '230px',
//         //   borderRadius: 3,
//         textAlign: 'center',
//         p: 3,
//         paddingTop: '20px',

//         boxShadow: 3,
//         position: 'relative',
//         //   backgroundColor: 'hsl(160deg 31.03% 94.31%)',

//         '&::before': {
//           content: '""',
//           position: 'absolute',
//           top: 0,
//           left: 0,
//           width: '100%',
//           height: '100%',
//           background: `url("/site-logo-dark-no-writeup.png")`,
//           backgroundSize: '35%',
//           backgroundRepeat: 'no-repeat',
//           backgroundPosition: 'center',
//           opacity: 0.3, // ✅ Reduce opacity to make the background faint
//         },

//         '@media Print': {
//           width: '450px',
//           height: '280px',
//           breakInside: 'avoid',
//           pageBreakInside: 'avoid',
//         },
//       }}
//     >
//       <Typography
//         sx={{
//           fontWeight: 700,
//           fontSize: '12pt',
//           textAlign: 'left',
//           mb: '3mm',
//           color: '#196b57',
//         }}
//       >
//         Student Photocard
//       </Typography>
//       <Box
//         sx={{
//           display: 'flex',
//           flexDirection: 'column',
//           gap: '2mm',
//           fontSize: '10pt',
//         }}
//       >
//         <Typography>
//           <strong>Name:</strong> {studentFullName}
//         </Typography>
//         <Typography>
//           <strong>RandomID:</strong> {student?.randomId || ''}
//         </Typography>
//         <Typography>
//           <strong>Class:</strong> {student?.presentClass || ''}
//         </Typography>
//         <Typography>
//           <strong>Verification Status:</strong> {verifiedStatusText}
//         </Typography>
//         <Typography>
//           <strong>Name of School:</strong> {student?.schoolId?.schoolName || ''}
//         </Typography>
//         <Typography>
//           <strong>Parent/Caregiver’s Name:</strong> {student?.parentName || ''}
//         </Typography>
//         <Typography>
//           <strong>Phone Number:</strong> {parentPhone}
//         </Typography>
//         <Typography>
//           <strong>Assigned ATM Card No:</strong> {student?.cardNo || ''}
//         </Typography>
//       </Box>
//     </Box>
//   )
// }

// Container: fetch verified students and render printable A4 pages
const PhotoCard = () => {
  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`

  const dispatch = useDispatch()
  const studentsState = useSelector((state) => state.students)
  const { filteredStudents, loading, error, total } = studentsState
  // ⬆️ Make sure your backend returns `totalCount` (total students, not just current page)
  // console.log('totalCount', total)
  //   const [showFront, setShowFront] = useState(true)
  const [verifiedOnly, setVerifiedOnly] = useState(true)
  const [verificationDataReady, setVerificationDataReady] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [message, setMessage] = useState('')

  const [page, setPage] = useState(1)
  const limit = 40 // 🔹 how many students per page

  const contentRef = useRef(null)
  const reactToPrintFn = useReactToPrint({ contentRef })

  useEffect(() => {
    const filteredParams = {
      verified: verifiedOnly ? 'true' : '',
      status: 'active',
    }
    const sortParam = { sortBy: '', sortOrder: '' }
    if (verificationDataReady) {
      dispatch(
        fetchStudentsFromComponent({
          filteredParams,
          sortParam,
          page,
          limit,
        })
      )
    }
  }, [dispatch, verifiedOnly, page, limit, verificationDataReady])

  const studentsToRender = useMemo(() => {
    if (!filteredStudents || filteredStudents.length === 0) return []
    return verifiedOnly
      ? filteredStudents.filter(
          (s) => String(s?.verified) === 'true' || s?.verified === true
        )
      : filteredStudents
  }, [filteredStudents, verifiedOnly])

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  //  handle sync verification data

  const handleSyncVerificationData = async () => {
    try {
      const token = localStorage.getItem('token')
      // console.log(token)
      // console.log(token)
      setSyncLoading(true)
      const res = await axios.patch(
        `${API_URL}/student/sync/verifications`,
        null,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: true,
        }
      )
      // console.log('res', res)
      setSyncLoading(false)
      setMessage(res?.data?.message)

      setVerificationDataReady(true)
    } catch (error) {
      setVerificationDataReady(false)

      setSyncLoading(false)
      setMessage('An Error occured, Please sync again')
      console.log(error)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }} id={'idCardContainer'}>
      {/* Print styles */}
      <style>
        {`
          @page { size: A4; margin: 0; }
          @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            .print-page { break-after: page; }
            .sheet { width: 210mm; min-height: 297mm; padding: 8mm; }
          }
        `}
      </style>

      {/* Top Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <Button
          onClick={handleSyncVerificationData}
          variant="contained"
          sx={{
            width: '100%',
          }}
        >
          {syncLoading ? (
            <>
              Sync Verification Data{' '}
              <CircularProgress
                size={20}
                sx={{
                  color: '#fff',
                  marginLeft: '30px',
                }}
              />
            </>
          ) : (
            'Sync Verification Data'
          )}
        </Button>
        {message && (
          <Typography
            sx={{
              textAlign: 'center',
              color: '#196b57',
            }}
          >
            {message}
          </Typography>
        )}
        {/* <Button
          variant="contained"
          sx={{
            width: '100%',
          }}
        >
          Generate Photo Card
        </Button> */}
      </Box>
      <Box
        className="no-print"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          gap: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Photocard Printing
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                disabled={true}
              />
            }
            label="Verified only"
          />
          <Button
            variant="contained"
            onClick={() => reactToPrintFn()}
            sx={{ backgroundColor: '#196b57' }}
          >
            Print
          </Button>
        </Box>
      </Box>

      {/* Loading & Error */}
      {loading && (
        <Box
          className="no-print"
          sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}
        >
          <CircularProgress size={20} />
          <Typography>Loading students…</Typography>
        </Box>
      )}
      {error && (
        <Typography className="no-print" color="error" sx={{ mb: 2 }}>
          {String(error)}
        </Typography>
      )}

      {/* Grid of Students */}
      <Grid
        className="printable-area"
        container
        spacing={2}
        columns={12}
        ref={contentRef}
        sx={{
          width: '100%',
          height: 'auto',
          component: 'paper',
          backgroundColor: 'white',
          alignItems: 'center',
          '@media print': {
            width: '1134px',
            marginLeft: '15mm',
            marginRight: '15mm',
            marginTop: '30mm',
            marginBottom: '20mm',
            visibility: 'visible',
            rowGap: '23mm',

            '@page': {
              size: 'A4 portrait',
              marginTop: '3cm',
              marginBottom: '1cm',
            },
          },
        }}
      >
        {studentsToRender.map((student, index) => (
          <Grid item key={student?.randomId || index} xs={12} sm={6}>
            <PhotoCardFront student={student} />
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      <Stack
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="center"
        className="no-print"
        sx={{ mt: 3 }}
      >
        <Pagination
          count={Math.ceil(total / limit)} // total pages
          page={page}
          onChange={handlePageChange}
          color="primary"
          shape="rounded"
          showFirstButton
          showLastButton
        />
        <Typography
          sx={{
            fontWeight: '700',
            fontSize: '17px',
          }}
        >
          Total Verified Students: {total}
        </Typography>
      </Stack>
    </Container>
  )
}

export default PhotoCard
