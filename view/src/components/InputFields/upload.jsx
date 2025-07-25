import { useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import PropTypes from 'prop-types'

export const UploadField = ({ handleInputChange, accept, name }) => {
  const [fileName, setFileName] = useState('')

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFileName(file.name)
      handleInputChange(e)
    }
  }
  return (
    <>
      {/* <InputLabel htmlFor="file-upload">Select File</InputLabel> */}
      <Box>
        <Button
          variant="contained"
          component="label"
          startIcon={<UploadFileIcon />}
          sx={{
            backgroundColor: 'primary',
            textTransform: 'uppercase',
            borderRadius: '5px',
            width: '100%',
            padding: '8px 16px',
            fontSize: {
              xs: '10px',
              md: '13px',
            },
            '&:hover': {
              opacity: 0.9,
            },
          }}
        >
          Select File
          <input
            capture
            type="file"
            name={name}
            accept={accept}
            hidden
            onChange={(e) => {
              handleFileChange(e)
              handleInputChange(e)
            }}
          />
        </Button>

        {fileName && (
          <Typography variant="body2" sx={{ marginTop: '8px', color: '#555' }}>
            Selected: {fileName}
          </Typography>
        )}
      </Box>
    </>
  )
}

UploadField.PropTypes = {
  handleInputChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  accept: PropTypes.string.isRequired,
}
