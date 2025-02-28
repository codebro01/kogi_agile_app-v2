import React, { useRef, useEffect, useState } from "react";
import { StudentIDFront, StudentIDBack } from "../../components/idCard";
import { Container, Typography, TextField, Button, Box, Grid, Autocomplete } from "@mui/material";
import { useReactToPrint } from "react-to-print";
import { useDispatch, useSelector } from "react-redux";
import { fetchStudentsFromComponent } from "../../components/studentsSlice";
import { fetchDashboardStat } from "../../components/dashboardStatsSlice";
import { SpinnerLoader } from '../../components/spinnerLoader'


export const PrintIdCard = () => {
  const studentsState = useSelector(state => state.students);
  const dashboardStatState = useSelector(state => state.dashboardStat);


  const { loading: studentsLoading, error: studentsError, filteredStudents: studentsData, currentPage, rowsPerPage, totalRows } = studentsState;

  const { data: dashboardData, loading: dashboardStatLoading, error: dashboardStatError } = dashboardStatState






  const dispatch = useDispatch();
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });


  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('entered here')
    dispatch(fetchStudentsFromComponent({ filteredParams: { schoolId: selectedSchoolId, isActive: true }, sortParam: { sortBy: "" } }));
    console.log('outta here')
  }

  useEffect(() => {
    dispatch(fetchDashboardStat());
  }, [dispatch]);




  const [students, setStudents] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState([]);

  const uniqueSchools = dashboardData?.results?.[0]?.distinctSchoolsDetails || []

  if (studentsLoading) return <Box>

    <><Box
      sx = {{
        display: "flex",
        justifyContent: "center", 
        alignItems: "center",
        height: "80vh"
      }}
    >
    <SpinnerLoader/>
    </Box></>
  </Box>


  console.log(studentsData)

  return (
    <Container sx={{
      textAlign: "center", mt: 3, display: 'flex', flexDirection: "column", justifyContent: "center", alignItems: "center", height: "auto", width: {
        xs: "300px",
        sm: "65vw",
        md: "65vw",
        lg: "800px"
      },
      position: "relative",

    
    }}>
      <Typography variant="h4" gutterBottom>
        Printable Student ID Cards
      </Typography>



      <Box component={"form"} onSubmit={handleSubmit} mt={3}>

        <Grid item xs={12} sm={6}>
          <Autocomplete

            sx={{
              width: "250px"
            }}
            id="schoolId-autocomplete"
            options={uniqueSchools} // Array of school objects
            getOptionLabel={(option) => option.schoolName} // Use schoolName as the label
            value={uniqueSchools.find((school) => school.schoolId === selectedSchoolId) || null} // Set the current value
            onChange={(event, newValue) => setSelectedSchoolId(newValue ? newValue.schoolId : null)}
            isOptionEqualToValue={(option, value) => option.schoolId === value.schoolId} // Ensure correct matching
            renderInput={(params) => (
              <TextField
                {...params}
                label="Select School"
                placeholder="Search Schools"
                fullWidth
                size="medium"
                sx={{
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#4caf50' },
                    '&:hover fieldset': { borderColor: '#2e7d32' },
                    '&.Mui-focused fieldset': { borderColor: '#1b5e20', borderWidth: 2 },
                  },
                }}
              />
            )}
          />
        </Grid>
        <Button disabled={selectedSchoolId.length === 0} type="submit"
          sx={{
            marginTop: 3,
            background: "#196b57",
            color: "#fff",
            "&:hover": {
              background: "#389780"
            }
          }}
        >Generate Id Cards</Button>
      </Box>


      <Button className="no-print" variant="contained" onClick={() => reactToPrintFn()} sx={{
        mb: 3,
        position: "fixed",
        bottom: 0,
        right: "5%",
        zIndex: "9999",
        background: "#196b57", 
        "&:hover": {
          background: "#196b57", 

        }
      }}
        disabled={studentsData.length === 0}

      >
        Print ID Cards
      </Button>

      {/* Print Area */}
      {studentsLoading ? <Typography><Box><SpinnerLoader /></Box></Typography> : (
        <Box id="idCardContainer" ref={contentRef} sx={{ width: "100%", height: "auto", component: "paper", backgroundColor: "white", padding: "10mm", display: "flex", flexDirection: "column", gap: "60px", justifyConten: "center", alignItems: "center" }}>
          {studentsData.map((student, index) => (
            <>

              <Box key={index} sx={{
                display: "flex", justifyContent: "center", mb: 3, alignItem: "center", flexDirection: {
                  lg: "row",
                  md: "column",
                  sm: "column",
                  xs: "column",

                },
                
                "@media Print": {
                  flexDirection: "row"
                },
             

                gap: {
                  xs: "15px"
                }

              }}>
                <StudentIDFront student={student} />
                <Box sx={{ width: "20mm" }} /> {/* Spacer */}
                <StudentIDBack student={student} />
                
              </Box>

            </>
          ))}
        </Box>
      )}

    </Container>


  );
};

