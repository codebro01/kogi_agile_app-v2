import { useState, useCallback } from 'react'
import { Box, Typography, Button, CircularProgress } from '@mui/material'
import { UploadButtonField } from '../../components/uploadButtonField'
import axios from 'axios'

export const UpdateBankAccountInfo = () => {
  const [updateAccountMessage, setUpdateAccountMessage] = useState({
    message: '',
    matched: 0,
    modified: 0,
    unmatchedStudents: [],
  })
  const [updateAccountLoading, setUpdateAccountLoading] = useState(false)
  const [filters, setFilters] = useState({
    file: '',
  })

  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`

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

      const res = await axios.patch(
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
      setUpdateAccountMessage(res?.data)
      setFilters((prev) => ({ ...prev, file: '' }))
      setTimeout(() => {
        setUpdateAccountMessage({
          message: '',
          matched: 0,
          modified: 0,
          unmatchedStudents: [],
        })
      }, 60000)
    } catch (err) {
      setUpdateAccountLoading(false)
      console.log(err)
      // console.log(err.response?.data?.message)
      if (err.response?.data?.message) {
        setUpdateAccountMessage({
          message: err.response?.data?.message,
        })
        setTimeout(() => {
          setUpdateAccountMessage({
            message: '',
          })
        }, 60000)
        return
      } else if (err.response?.data) {
        setUpdateAccountMessage({
          message: err.response?.data,
        })
        setTimeout(() => {
          setUpdateAccountMessage({
            message: '',
          })
        }, 60000)
        return
      } else {
        setUpdateAccountMessage({
          message: 'An error occured, please try again',
        })
        setTimeout(() => {
          setUpdateAccountMessage('')
        }, 60000)
      }
    }
  }
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        minHeight: '70%',
      }}
    >
      <Box
        id="update-bank-acount"
        component={'form'}
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
        sx={{
          width: {
            xs: '75vw',
            md: '70vw',
          },
        }}
      >
        <Typography
          variant="h4"
          sx={{
            textAlign: 'center',
            fontWeight: 800,
            fontSize: {
              xs: '13px',
              md: '20px',
            },
          }}
        >
          Upload an excel file here to update students accounts information
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Box
            sx={{
              width: {
                xs: '150px',
                md: '250px',
              },
            }}
          >
            <UploadButtonField handleInputChange={handleInputChange} />
          </Box>
        </Box>
        <Button
          type="submit"
          variant="contained"
          sx={{
            minWidth: {
              sm: '150px',
              md: '250px',
            },
            padding: '10px 16px',
            borderRadius: '5px',
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            alignItems: 'center',
            width: {
              xs: '150px',
              md: '250px',
            },
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
                fontSize: {
                  xs: '10px',
                  md: '13px',
                },
              }}
            >
              Please wait...
              <CircularProgress
                size={'20px'}
                sx={{
                  color: '#fff',
                }}
              />
            </Typography>
          ) : (
            <Typography
              sx={{
                fontSize: {
                  xs: '10px',
                  md: '13px',
                },
              }}
            >
              Update Account Info
            </Typography>
          )}
        </Button>

        {!updateAccountLoading && updateAccountMessage.message && (
          <Box
            sx={{
              fontSize: '20px',
              fontWeight: 600,
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            <Typography
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                fontWeight: 600,

                alignItems: 'center',
              }}
            >
              Message: {updateAccountMessage?.message}
            </Typography>
            <Typography
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                fontWeight: 600,
                alignItems: 'center',
              }}
            >
              Matched: {updateAccountMessage?.matched}
            </Typography>
            <Typography
              sx={{
                display: 'flex',
                justifyContent: 'flex-start',
                fontWeight: 600,
                alignItems: 'center',
              }}
            >
              Modified: {updateAccountMessage?.modified}
            </Typography>
            {updateAccountMessage.unmatchedStudents && (
              <Typography
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  fontWeight: 600,
                  alignItems: 'center',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal',
                  overflowWrap: 'break-word',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                  }}
                >
                  Could not find students with the following ids:{' '}
                </Typography>
                {updateAccountMessage?.unmatchedStudents.map((s) => (
                  <Typography
                    key={s}
                    sx={{
                      textAlign: 'left',
                      display: 'flex',
                      width: '100%',
                      fontWeight: 600,
                    }}
                  >
                    [{s}],{' '}
                  </Typography>
                ))}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Box>
  )
}
