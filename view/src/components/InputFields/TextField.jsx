import { Box, TextField as MuiTextField } from '@mui/material'
import {memo} from 'react';
import PropTypes from 'prop-types'

export const TextField = ({
  value,
  handleInputChange,
  name,
  placeholder,
  inputProps,
  onInput,
  label,
  InputLabelProps,
  required,
  height = 50,
}) => {
  return (
    <Box>
      <MuiTextField
        name={name}
        variant="outlined"
        label={label}
        fullWidth
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder} // Add this line for default text
        inputProps={inputProps}
        onInput={onInput}
        required={required}
        InputLabelProps={InputLabelProps}
        sx={{
          '& .MuiOutlinedInput-root': {
            height: `${height}px`, // Adjusts the overall height of the input box
          },
        }}
      />
    </Box>
  )
}

TextField.propTypes = {
  value: PropTypes.string.isRequired,
  handleInputChange: PropTypes.func.isRequired,
  onInput: PropTypes.func,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  height: PropTypes.number,
  required: PropTypes.bool,
  inputProps: PropTypes.object,
  InputLabelProps: PropTypes.object,
}
