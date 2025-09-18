import React from 'react'
import { Autocomplete, InputLabel, TextField, Typography, Box } from "@mui/material";
import { useSelector, useDispatch } from 'react-redux';
import { fetchSchools } from '../../components/schoolsSlice.js'



export const AutoCompleteField = ({filters, setFilters}) => {

const dispatch = useDispatch()
  const schoolsState = useSelector((state) => state.schools)

  const {
    data: schoolsData,
    // loading: schoolsLoading,
    // error: schoolsError,
  } = schoolsState
  const schools = schoolsData
  const [schoolOptions, setSchoolOptions] = React.useState([]) // Start with an empty array
    const [hasMore, setHasMore] = React.useState(true) // To check if more data
     const [loadingSchools, setLoadingSchools] = React.useState(false) // Loading state for schools
      const [page, setPage] = React.useState(1) // Kee 
      // const [selectedSchool, setSelectedSchool] = useState(null);
      // const [submitting, setSubmitting] = useState(false);
      // const [submitMessage, setSubmitMessage] = useState('');
      // const [filters, setFilters] = React.useState({
      //   schoolId: "", 
      // })

  React.useEffect(() => {
    dispatch(fetchSchools({ schoolType: '', lgaOfEnrollment: '' }))
  }, [dispatch])

    React.useEffect(() => {
      if (schools && schools.length > 0) {
        setSchoolOptions(schools) // Set schools if available
      }
    }, [schools]) // Re-run whenever schools change
    const loadMoreSchools = async () => {
      if (loadingSchools || !hasMore) return
  
      setLoadingSchools(true)
  
      // Fetch the next batch of schools here (this is just a mock-up)
      const nextSchools = await fetchMoreSchools(page)
  
      if (nextSchools.length > 0) {
        setSchoolOptions((prev) => [...prev, ...nextSchools]) // Append new schools to the list
        setPage((prev) => prev + 1) // Increment the page
      } else {
        setHasMore(false) // No more schools to load
      }
  
      setLoadingSchools(false)
    }


    const fetchMoreSchools = async (page) => {
      // Simulate network request to fetch schools for the current page
      return new Promise((resolve) => {
        setTimeout(() => {
          const startIndex = (page - 1) * 20
          resolve(schools.slice(startIndex, startIndex + 20)) // Return a slice of the schools array
        }, 1000)
      })
    }





  return (
    <Box> 
                    <InputLabel id="lga-label" sx={{ marginBottom: 1 }}>
                      All Schools
                    </InputLabel>
                    {schoolOptions.length > 0 ? (
                      <Autocomplete
                        sx={{
                          width: '100%',
                          '& .MuiAutocomplete-input': {
                            height: '5px', // Adjust input field height
                            borderRadius: '4px',
                            padding: '10px',
                          },
                        }}
                        id="school-select"
                        value={
                          schoolOptions.find(
                            (option) => option._id === filters.schoolId
                          ) || null
                        }
                        onChange={(event, newValue) => {
                          setFilters((prevFilters) => ({
                            ...prevFilters,
                            schoolId: newValue?._id || null,
                          }))
                        }}
                        options={schoolOptions}
                        getOptionLabel={(option) => option?.schoolName || ''}
                        isOptionEqualToValue={(option, value) =>
                          option?._id === value?._id
                        }
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="School"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                  borderColor: 'green',
                                },
                                '&:hover fieldset': {
                                  borderColor: 'darkgreen',
                                },
                                '&.Mui-focused fieldset': {
                                  borderColor: 'green',
                                  borderWidth: 2,
                                },
                              },
                            }}
                          />
                        )}
                        loading={loadingSchools}
                        noOptionsText="No schools found"
                        getOptionKey={(option, index) =>
                          option?._id || `${option.schoolName}-${index}`
                        } // Unique key
                      />
                    ) : (
                      <Typography
                        variant="body1"
                        color="textSecondary"
                        sx={{ textAlign: 'center', marginTop: 2 }}
                      >
                        No schools available
                      </Typography>
                    )}
                  </Box>
  )
}
