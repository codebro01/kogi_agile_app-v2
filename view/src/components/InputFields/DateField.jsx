import { Box, InputLabel as MuiInputLabel, TextField } from '@mui/material'

import PropTypes from 'prop-types'



export const DateField = ({
  value,
  handleInputChange,
  name,
  label,
  required,
  InputLabel,
}) => {
  return (
    <Box>
      <MuiInputLabel sx={{ marginBottom: 1 }}>{InputLabel}</MuiInputLabel>
      <TextField
        type="date"
        name={name}
        value={value}
        onChange={handleInputChange}
        InputLabelProps={{ shrink: true }}
        variant="outlined"
        size="small"
        label={label}
        fullWidth
        required={required}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: '50px', // Adjusts the overall height of the input box
          },
        }}
      />
    </Box>
  )
}

DateField.propTypes = {
  value: PropTypes.string.isRequired,
  InputLabel: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  required: PropTypes.bool,

  //   options: PropTypes.arrayOf(
  //     PropTypes.shape({
  //       id: PropTypes.string.isRequired,
  //       value: PropTypes.string.isRequired,
  //       name: PropTypes.string.isRequired,
  //     })
  //   ).isRequired,
}