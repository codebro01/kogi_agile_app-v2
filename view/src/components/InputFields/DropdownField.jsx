// import React from 'react'
import { Box, MenuItem, InputLabel, TextField } from '@mui/material'
import PropTypes from 'prop-types'







export const DropdownField = ({
  value,
  handleInputChange,
  options,
  name,
  inputLabel,
  defaultValue,
  label, 
  required,
  setDefaultValue = false
}) => {
  return (
    <Box>
      <InputLabel id="class-label" sx={{ marginBottom: 1 }}>
        {inputLabel}
      </InputLabel>
      <TextField
        name={name}
        value={value}
        onChange={handleInputChange}
        displayEmpty
        select
        fullWidth
        labelId="class-label"
        label={label} 
        required ={required}
      >
        {setDefaultValue && (
          <MenuItem value="">
            <em>{defaultValue}</em>
          </MenuItem>
        )}
        {options?.map((option) => (
          <MenuItem key={option?.id || option.name || option } value={option?.value || option?.name ||option }>
            {option?.name || option}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  )
}

DropdownField.propTypes = {
  value: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  name: PropTypes.string.isRequired,
  inputLabel: PropTypes.string.isRequired,
  defaultValue: PropTypes.string,
  label: PropTypes.string,
  setDefaultValue: PropTypes.bool,
  required: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
}
