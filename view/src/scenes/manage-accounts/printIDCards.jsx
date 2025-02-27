import React, { useRef } from "react";
import { StudentIDFront, StudentIDBack } from "../../components/idCard";
import { Container, Typography, Button, Box } from "@mui/material";
import { useReactToPrint } from "react-to-print";

const students = [
  { name: "John Doe", id: "S12345", class: "JSS 2", department: "Science", photo: "https://via.placeholder.com/100", cohort: "first", dob: "21-11-2006" },
  { name: "Jane Smith", id: "S67890", class: "JSS 1", department: "Arts", photo: "https://via.placeholder.com/100", cohort: "first", dob: "21-11-2006" },
  { name: "Mike Johnson", id: "S54321", class: "SS 1", department: "Commerce", photo: "https://via.placeholder.com/100", cohort: "first", dob: "21-11-2006" },
  { name: "Sarah Lee", id: "S98765", class: "JSS 3", department: "Science", photo: "https://via.placeholder.com/100", cohort: "first", dob: "21-11-2006" },
  { name: "David Brown", id: "S23456", class: "SS 2", department: "Arts", photo: "https://via.placeholder.com/100", cohort: "first", dob: "21-11-2006" },
  { name: "Emily Clark", id: "S34567", class: "SS 3", department: "Commerce", photo: "https://via.placeholder.com/100", cohort: "first", dob: "21-11-2006" },
];

export const PrintIdCard = () => {
  const contentRef = useRef(null);
  const reactToPrintFn = useReactToPrint({ contentRef });


  return (
    <Container sx={{ textAlign: "center", mt: 3, display: 'flex', flexDirection: "column", justifyContent: "center", alignItems: "center", height: "auto", width: {
      xs: "300px", 
      sm: "65vw", 
      md: "65vw", 
      lg: "800px"
    } }}>
      <Typography variant="h4" gutterBottom>
        Printable Student ID Cards (A4 Format)
      </Typography>

      <Button className="no-print" variant="contained" color="secondary" onClick={() => reactToPrintFn()} sx={{ mb: 3 }}>
        Print ID Cards
      </Button>

      {/* Print Area */}
      <Box id="idCardContainer" ref={contentRef} sx={{ width: "1123px", height: "auto", component: "paper", backgroundColor: "white", padding: "10mm", display: "flex", flexDirection: "column", gap: "60px", justifyConten: "center", alignItems: "center"}}>
        {students.map((student, index) => (
          <>
          
          <Box key={index} sx={{ display: "flex", justifyContent: "center", mb: 3, alignItem: "center", flexDirection: {
            xs: "column", 
            sm: "row"
          }, 



}}>
            <StudentIDFront student={student} />
            <Box sx={{ width: "20mm" }} /> {/* Spacer */}
            <StudentIDBack student={student} />
          </Box>

          </>
        ))}
      </Box>
    </Container>

    
  );
};

