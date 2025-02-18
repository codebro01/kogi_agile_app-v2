import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

export const AlertSnackbars = ({ severityType, message, onOpen, onClose }) => {
  return (
    <Snackbar 
      open={onOpen} 
      autoHideDuration={6000} 
      onClose={onClose} 
    >
      <Alert 
        severity={severityType} 
        variant="filled" 
        sx={{ width: '100%', display: 'flex', alignItems: 'center' }}
        action={
          <IconButton size="small" color="inherit" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};