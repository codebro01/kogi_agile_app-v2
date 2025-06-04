import { useState } from 'react'
import { Box, Button, Typography } from '@mui/material'
import UploadFileIcon from '@mui/icons-material/UploadFile'

export const UploadButtonField = ({ handleInputChange }) => {

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
            width: '250px', 
            padding: '8px 16px',
            '&:hover': {
              opacity: 0.9,
            },
          }}
        >
          Select File
          <input type="file" name='file' hidden onChange={handleFileChange} />
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
