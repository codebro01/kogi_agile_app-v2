import { useState, useEffect, useContext, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Button,
  Grid,
  Container,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material'
// import { useTheme } from '@mui/material/styles';
import axios from 'axios'
import PropTypes from 'prop-types'
import { getNigeriaStates } from 'geo-ng'
import { SpinnerLoader } from './spinnerLoader.jsx'
import lgasAndWards from '../Lga&wards.json'
import {
  BankList,
  banks,
  Occupations,
  SchoolCategory,
} from '../../data/data.js'
import { TextField as ComponentTextField } from './InputFields/TextField.jsx'
import { UploadField } from './InputFields/upload.jsx'
import { DateField } from './InputFields/DateField.jsx'
import { DropdownField } from './InputFields/DropdownField.jsx'

axios.defaults.withCredentials = true

export const FormComponent = ({
  submitButtonText, 
  reqType,
  reqUrl,
  reqBody,
  formTitle,
  allowWard = true,
  allowSchoolId = true,
  allowSurname = true,
  allowFirstname = true,
  allowMiddlename = true,
  allowStudentNin = true,
  allowDob = true,
  allowStateOfOrigin = true,
  allowLga = true,
  allowLgaOfEnrollment = true,
  allowGender = true,
  allowCommunityName = true,
  allowResidentialAddress = true,
  allowPresentClass = true,
  allowYearAdmitted = true,
  allowYearOfEnrollment = true,
  allowParentPhone = true,
  allowParentName = true,
  allowParentNin = true,
  allowNationality = true,
  allowParentContact = true,
  allowParentOccupation = true,
  allowBankName = true,
  allowAccountNumber = true,
  allowParentBvn = true,
  allowDisabilitystatus = true,
  allowImage = true,
  allowSchoolCategory = false,
}) => {
  // const theme = useTheme();

  const [bankList, setBankList] = useState(BankList)

  const [occupations, setOccupation] = useState(Occupations)

  const navigate = useNavigate()
  //   const nationalityOptions = NationalityOptions

  const preselectFilter = JSON.parse(localStorage.getItem('preselectFilter'))

  // const {selectType, lgaOfEnrollment}  = preselectFilter;

  const [formData, setFormData] = useState({
    ward: '',
    schoolId: '',
    surname: '',
    firstname: '',
    middlename: '',
    studentNin: '',
    dob: '',
    stateOfOrigin: '',
    lga: '',
    lgaOfEnrollment: '',
    gender: '',
    communityName: '',
    residentialAddress: '',
    presentClass: '',
    yearAdmitted: '',
    yearOfEnrollment: '',
    parentPhone: '',
    parentName: '',
    parentNin: '',
    nationality: 'Nigeria',
    parentContact: '',
    parentOccupation: '',
    bankName: '',
    accountNumber: '',
    parentBvn: '',
    disabilitystatus: '',
    schoolCategory: '',
    image: null,
  })
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)
  //   const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [errors, setErrors] = useState({})
  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`
  const [states, setStates] = useState([])
  const [lgas, setLgas] = useState([])
  //   const [wardValue, setWardValue] = useState(null)
  const [formSubmissionLoading, setFormSubmissionLoading] = useState(false)
  const [storedSchool, setStoredSchool] = useState(null)
  const [selectedLga, setSelectedLga] = useState('') // State for LGA selection
  const [selectedWard, setSelectedWard] = useState('') // State for Ward selection

  useEffect(() => {
    const retrievedSchool = sessionStorage.getItem('selectedSchool')
    setStoredSchool(JSON.parse(retrievedSchool)) // Store the retrieved value in state
  }, [])

  const handleChange = useCallback((e) => {
    const { name, value, files } = e.target
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: files ? files[0] : value,
    }))
  }, [])

  useEffect(() => {
    if (storedSchool) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        schoolId: storedSchool._id, // Set the school ID
      }))
    }
  }, [storedSchool])

  const getLGAs = (stateName) => {
    const state = getNigeriaStates().find((s) => s.name === stateName)
    return state ? state.lgas : []
  }

  useEffect(() => {
    if (formData.nationality === 'Nigeria') {
      const statesObjects = getNigeriaStates()
      const newStates = statesObjects.map((state) => state.name)
      setStates(newStates)
    } else {
      setStates([])
      setLgas([])
    }
  }, [formData.nationality])

  useEffect(() => {
    if (formData.stateOfOrigin && formData.nationality === 'Nigeria') {
      const lgas = getLGAs(formData.stateOfOrigin)
      setLgas(lgas)
    } else {
      setLgas([])
    }
  }, [formData.stateOfOrigin, formData.nationality])

  const handleStateChange = (selectedState) => {
    setFormData({
      ...formData,
      stateOfOrigin: selectedState,
      lga: '', // Reset LGA when state changes
    })
  }

  const handleSelectChange = (e, { name }) => {
    setSelectedLga(e.target.value)
    setSelectedWard('')
    setFormData((prevData) => ({
      ...prevData,
      [name]: e.target.value, // Update the correct field based on `name`
    }))
  }
  const selectedLgaWards =
    lgasAndWards.find((lga) => lga.name === selectedLga)?.wards || []

  const handleWardChange = (selectedWard) => {
    setFormData({
      ...formData,
      ward: selectedWard,
      // Reset LGA when state changes
    })
  }

  const handleSearch = (e) => {
    const searchQuery = e.target.value.toLowerCase()
    const filteredBanks = bankList.filter((bank) =>
      bank.toLowerCase().includes(searchQuery)
    )
    setBankList(filteredBanks)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    ;(async () => {
      try {
        setFormSubmissionLoading(true)
        const token = localStorage.getItem('token')
        if (reqType === 'post') {
          const response = await axios.post(`${API_URL}/student`, formData, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data',
            },
            withCredentials: true,
          })
        }
        if (reqType === 'patch') {
          const response = await axios.patch(
            `${reqUrl}`,
            { formData },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              withCredentials: true,
            }
          )
          // console.log(response)
          setSuccess(true)
          setSuccessMessage(response.data.message)
          const formSubmissionSuccess = true
          if (formSubmissionSuccess) {
            // Clear form fields
            setFormData({
              ward: '',
              schoolId: formData.schoolId ? storedSchool._id: "",
              surname: '',
              firstname: '',
              middlename: '',
              studentNin: '',
              dob: '',
              stateOfOrigin: '',
              lga: '',
              lgaOfEnrollment: '',
              gender: '',
              communityName: '',
              residentialAddress: '',
              presentClass: '',
              yearAdmitted: '',
              yearOfEnrollment: '',
              parentPhone: '',
              parentName: '',
              parentNin: '',
              nationality: 'Nigeria',
              parentContact: '',
              parentOccupation: '',
              bankName: '',
              accountNumber: '',
              parentBvn: '',
              schoolCategory: '',
              image: null,
            })

            // Optionally display a success message or reset other states
          }
          setFormSubmissionLoading(false)
          setTimeout(() => setSuccessMessage(''), 7000)
          setTimeout(
            () =>
              navigate('/admin-dashboard/admin-view-all-students-no-export'),
            7000
          )
          
        }
      } catch (err) {
        console.log(err)
        setFormSubmissionLoading(false)
        if (err.response?.data?.status === 401) return navigate('/sign-in')
        setError(true)
        setValidationError(err.response?.data?.message || 'An error occurred, please try again')
        setTimeout(() => setValidationError(''), 20000)
      }
    })()
  }

  // ** clear fields if students creation is successful

  setTimeout(() => {
    setError('')
    setSuccess('')
  }, 10000)

  return (
    <>
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          paddingTop: '16px',
          paddingBottom: '16px',
          marginTop: '32px',
          marginBottom: '50px',
        }}
      >
        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: 'white',
            width: '100%',
          }}
        >
          <Typography
            variant="h4"
            gutterBottom
            align="center"
            textTransform="uppercase"
            fontWeight="bolder"
            marginBottom="20px"
            background="red"
          >
            {formTitle}
          </Typography>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {allowSurname && (
                <Grid item xs={12}>
                  <ComponentTextField
                    name={'surname'}
                    value={formData.surname}
                    handleInputChange={handleChange}
                    label={'Surname'}
                    placeholder={''}
                    required={true}
                  />
                </Grid>
              )}

              {allowFirstname && (
                <Grid item xs={12}>
                  <ComponentTextField
                    name={'firstname'}
                    value={formData.firstname}
                    handleInputChange={handleChange}
                    label={'Firstname'}
                    placeholder={''}
                    required={true}
                  />
                </Grid>
              )}
              {allowMiddlename && (
                <Grid item xs={12}>
                  <ComponentTextField
                    name={'middlename'}
                    value={formData.middlename}
                    handleInputChange={handleChange}
                    label={'Middlename'}
                    placeholder={''}
                    required={true}
                  />
                </Grid>
              )}
              {allowStudentNin && (
                <Grid item xs={12}>
                  <ComponentTextField
                    name={'studentNin'}
                    value={formData.studentNin}
                    handleInputChange={handleChange}
                    label={'Student Nin'}
                    placeholder={''}
                    inputProps={{
                      maxLength: 11, // Stops further input after 11 characters
                      pattern: '\\d{11}', // Requires exactly 11 digits
                      title: 'Student Nin must be exactly 11 digits', // Shows this message on invalid input
                    }}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, '') // Remove non-digit characters
                    }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}

              {allowDob && (
                <Grid item xs={12}>
                  <DateField
                    name="dob"
                    label="Date of Birth"
                    value={formData.dob}
                    handleInputChange={handleChange}
                    required={true}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              )}

              {allowSchoolId && (
                <Grid item xs={12}>
                  <ComponentTextField
                    label="School"
                    name="schoolId"
                    value={storedSchool?.schoolName || 'No school found'}
                    required={true}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      readOnly: true, // Make it readonly
                    }}
                  />
                </Grid>
              )}

              {allowGender && (
                <Grid item xs={12}>
                  <DropdownField
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    handleInputChange={handleChange}
                    required={true}
                    options={[{ name: 'Female', value: 'Female', id: 1 }]}
                  />
                </Grid>
              )}

              {allowDisabilitystatus && (
                <Grid item xs={12}>
                  <DropdownField
                    label="Disability Status"
                    name="disabilitystatus"
                    value={formData.disabilitystatus}
                    handleInputChange={handleChange}
                    required={true}
                    options={[
                      { name: 'No', value: 'No', id: 1 },
                      { name: 'Yes', value: 'Yes', id: 2 },
                    ]}
                  />
                </Grid>
              )}

              {allowNationality && (
                <Grid item xs={12}>
                  <DropdownField
                    label="Nationality"
                    name="nationality"
                    value={formData.nationality}
                    handleInputChange={(e) =>
                      handleSelectChange(e, { name: 'nationality' })
                    }
                    required={true}
                    options={[
                      { name: 'Nigeria', value: 'Nigeria', id: 1 },
                      { name: 'Others', value: 'Others', id: 2 },
                    ]}
                  />
                </Grid>
              )}

              {/* State of Origin Select (visible only if nationality is Nigeria) */}
              {allowStateOfOrigin && formData.nationality === 'Nigeria' && (
                <Grid item xs={12}>
                  <DropdownField
                    label="State of Origin"
                    name="stateOfOrigin"
                    select
                    variant="outlined"
                    fullWidth
                    value={formData.stateOfOrigin || ''}
                    handleInputChange={(e) => handleStateChange(e.target.value)}
                    required
                    options={states}
                  />
                </Grid>
              )}

              {formData.nationality === 'Others' && (
                <Grid item xs={12}>
                  <ComponentTextField
                    label="Nationality (Specify)"
                    name="customNationality"
                    value={formData.customNationality}
                    handleInputChange={handleChange}
                    required={true}
                  />
                </Grid>
              )}

              {/* LGA Select (visible only if a state is selected and nationality is Nigeria) */}

              {allowLga &&
                formData.stateOfOrigin &&
                formData.nationality === 'Nigeria' && (
                  <Grid item xs={12}>
                    <DropdownField
                      label="LGA of Origin"
                      name="lga"
                      value={formData.lga || ''}
                      handleInputChange={(e) =>
                        handleSelectChange(e, { name: 'lga' })
                      }
                      required={true}
                      options={lgas}
                    />
                  </Grid>
                )}

              {allowLgaOfEnrollment && (
                <Grid item xs={12}>
                  <DropdownField
                    label="LGA of Enrollment"
                    name="lgaOfEnrollment"
                    value={formData.lgaOfEnrollment || ''}
                    handleInputChange={(e) =>
                      handleSelectChange(e, { name: 'lgaOfEnrollment' })
                    }
                    required={true}
                    options={lgasAndWards}
                  />
                  {/* {lgasAndWards.map((lga) => (
                    <MenuItem key={lga.name} value={lga.name}>
                      {lga.name}
                    </MenuItem>
                  ))} */}
                </Grid>
              )}

              {formData.lgaOfEnrollment && (
                <Grid item xs={12}>
                  <DropdownField
                    label="Wards"
                    name="ward"
                    value={formData.ward || ''} // Using ward ID
                    handleInputChange={(e) => handleWardChange(e.target.value)} // Updating
                    // the form data with the ward ID
                    options={selectedLgaWards}
                    required={true}
                  />
                </Grid>
              )}

              {formData.nationality === 'Others' && (
                <Grid item xs={12}>
                  <ComponentTextField
                    label="Nationality (Specify)"
                    name="customNationality"
                    value={formData.customNationality}
                    handleInputChange={handleChange}
                  />
                </Grid>
              )}

              {allowResidentialAddress &&
                [
                  {
                    label: 'Name of community / Town of Residence',
                    name: 'communityName',
                  },
                  { label: 'Residential Address', name: 'residentialAddress' },
                ].map(({ label, name }) => (
                  <Grid item xs={12} key={name}>
                    <ComponentTextField
                      label={label}
                      name={name}
                      value={formData[name]}
                      handleInputChange={handleChange}
                      required={true}
                    />
                  </Grid>
                ))}

              {allowPresentClass && (
                <Grid item xs={12}>
                  <DropdownField
                    label={'Present Class'}
                    name="presentClass"
                    value={formData.presentClass}
                    handleInputChange={handleChange}
                    options={[
                      { id: 1, value: 'Primary 6', name: 'Primary 6' },
                      { id: 2, value: 'JSS 1', name: 'JSS 1' },
                      { id: 3, value: 'JSS 3', name: 'JSS 3' },
                      { id: 4, value: 'SSS 1', name: 'SSS 1' },
                    ]}
                    required={true}
                  />
                </Grid>
              )}

              {allowYearOfEnrollment && (
                <Grid item xs={12}>
                  <DropdownField
                    label="Year of Enrollment"
                    name="yearOfEnrollment"
                    value={formData.yearOfEnrollment}
                    handleInputChange={handleChange}
                    required={true}
                    options={[
                      { id: 1, value: '2024', name: '2024' },
                      { id: 2, value: '2025', name: '2025' },
                      { id: 3, value: '2026', name: '2026' },
                      { id: 4, value: '2027', name: '2027' },
                      { id: 5, value: '2028', name: '2028' },
                      { id: 6, value: '2029', name: '2029' },
                    ]}
                  />
                </Grid>
              )}

              {allowParentName && (
                <Grid item xs={12} key={name}>
                  <ComponentTextField
                    label={'Parent/Caregiver Name'}
                    name={'parentName'}
                    value={formData?.parentName}
                    handleInputChange={handleChange}
                    required={true}
                  />
                </Grid>
              )}

              {allowParentPhone && (
                <Grid item xs={12}>
                  <ComponentTextField
                    label={'Parent/caregiver phone No.'}
                    name={'parentPhone'}
                    value={formData.parentPhone}
                    handleInputChange={handleChange}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, '') // Remove non-digit characters
                    }}
                    inputProps={{
                      maxLength: 11, // Stops further input after 11 characters
                      pattern: '\\d{11}', // Requires exactly 11 digits
                      title: 'Phone number must be exactly 11 digits', // Shows this message on invalid input
                    }}
                    required={true}
                  />
                </Grid>
              )}

              {allowParentNin && (
                <Grid item xs={12}>
                  <ComponentTextField
                    label={'Parent/caregiver NIN'}
                    name={'parentNin'}
                    value={formData.parentNin}
                    handleInputChange={handleChange}
                    inputProps={{
                      maxLength: 11, // Stops further input after 11 characters
                      pattern: '\\d{11}', // Requires exactly 11 digits
                      title: 'Parent Nin must be exactly 11 digits', // Shows this message on invalid input
                    }}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, '') // Remove non-digit characters
                    }}
                  />
                </Grid>
              )}

              {allowParentBvn && (
                <Grid item xs={12}>
                  <ComponentTextField
                    label={'Parent/caregiver BVN'}
                    name={'parentBvn'}
                    value={formData.parentBvn}
                    handleInputChange={handleChange}
                    inputProps={{
                      maxLength: 11, // Stops further input after 11 characters
                      pattern: '\\d{11}', // Requires exactly 11 digits
                      title: 'BVN must be exactly 11 digits', // Shows this message on invalid input
                    }}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, '') // Remove non-digit characters
                    }}
                  />
                </Grid>
              )}

              {allowParentOccupation && (
                <Grid item xs={12}>
                  <DropdownField
                    //   inputLabel="Parent/Caregiver Occupation"
                    name="parentOccupation"
                    value={formData.parentOccupation}
                    handleInputChange={handleChange}
                    label="Parent/Caregiver Occupation"
                    required={true}
                    options={occupations}
                  />
                </Grid>
              )}

              {formData.parentOccupation === 'Others' && (
                <Grid item xs={12}>
                  <ComponentTextField
                    label="Occupation (Specify)"
                    name="parentOccupation"
                    value={formData.parentOccupation}
                    handleInputChange={handleChange}
                  />
                </Grid>
              )}

              {allowBankName && (
                <Grid item xs={12}>
                  <DropdownField
                    name="bankName"
                    value={formData.bankName || ''} // Default value set to 'Select Bank'
                    handleInputChange={handleChange}
                    label="Bank Name"
                    options={banks}
                  />
                </Grid>
              )}

              {allowAccountNumber && (
                <Grid item xs={12}>
                  <ComponentTextField
                    label="Account Number"
                    name="accountNumber"
                    value={formData.accountNumber}
                    handleInputChange={handleChange}
                    inputProps={{
                      maxLength: 10, // Stops further input after 10 characters
                      pattern: '\\d{10}', // Requires exactly 11 digits
                      title: 'Account Number must be exactly 10 digits', // Shows this message on invalid input
                    }}
                    onInput={(e) => {
                      e.target.value = e.target.value.replace(/\D/g, '') // Remove non-digit characters
                    }}
                  />
                </Grid>
              )}

              {allowSchoolCategory && (
                <Grid item xs={12}>
                  <DropdownField
                    //   inputLabel="Parent/Caregiver Occupation"
                    name="schoolCategory"
                    value={formData.schoolCategory}
                    handleInputChange={handleChange}
                    label="School Category"
                    required={true}
                    options={SchoolCategory}
                  />
                </Grid>
              )}

              {/* <div style={{ margin: '20px' }}>
                <label
                  htmlFor="file-upload"
                  style={{ cursor: 'pointer', display: 'block' }}
                >
                  <strong>Add a passport </strong>
                </label>
                <input
                  id="file-upload"
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  style={{ marginBottom: '10px' }}
                />
                {formData.image && (
                  <p>
                    Selected File: <strong>{formData.image.name}</strong>
                  </p>
                )}
              </div> */}

              {allowImage && (
                <Grid item xs={12}>
                  <UploadField
                    handleInputChange={handleChange}
                    name={'image'}
                    accept="image/*"
                  />
                </Grid>
              )}

            
                <Grid item xs={12} marginTop="20px">
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                      display:"flex",
                      gap:"20px",
                      padding: '10px 0',
                      backgroundColor: '#196b57',
                      fontSize: '0.9rem',
                      color: '#ffffff',
                      '&:hover': {
                        opacity: 0.9,
                      },
                    }}
                    disabled = {formSubmissionLoading ? true : false}
                  >
                    {submitButtonText}
                    {formSubmissionLoading && (
                      <CircularProgress size = {"25px"}/>
                    )}
                  </Button>
                </Grid>
              
            </Grid>
            <Box
              variant="body2"
              style={{
                marginTop: '8px',
                fontWeight: 'bold',
                textAlign: 'center', // Center align the text
              }}
            >
              {/* {formSubmissionLoading && (
                <Grid
                  sx={{
                    display: 'flex',
                    width: '100%',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                </Grid>
              )} */}
              {success && (
                <Typography
                  variant="h5"
                  fontWeight={600}
                  color="green"
                  sx={{ textAlign: 'center', marginTop: '20px' }}
                >
                  {successMessage}
                </Typography>
              )}

              {error && (
                <Typography
                  variant="h5"
                  fontWeight={600}
                  color="red"
                  sx={{ textAlign: 'center', marginTop: '20px' }}
                >
                  {validationError}
                </Typography>
              )}
            </Box>
          </form>
        </Box>
      </Container>
    </>
  )
}

FormComponent.propTypes = {
  ward: PropTypes.string,
  schoolId: PropTypes.string,
  surname: PropTypes.string,
  firstname: PropTypes.string,
  middlename: PropTypes.string,
  studentNin: PropTypes.string,
  dob: PropTypes.string,
  stateOfOrigin: PropTypes.string,
  lga: PropTypes.string,
  lgaOfEnrollment: PropTypes.string,
  gender: PropTypes.string,
  communityName: PropTypes.string,
  residentialAddress: PropTypes.string,
  presentClass: PropTypes.string,
  yearAdmitted: PropTypes.string,
  yearOfEnrollment: PropTypes.string,
  parentPhone: PropTypes.string,
  parentName: PropTypes.string,
  parentNin: PropTypes.string,
  nationality: PropTypes.string,
  parentContact: PropTypes.string,
  parentOccupation: PropTypes.string,
  bankName: PropTypes.string,
  accountNumber: PropTypes.string,
  parentBvn: PropTypes.string,
  disabilitystatus: PropTypes.string,
  image: PropTypes.string,
}
