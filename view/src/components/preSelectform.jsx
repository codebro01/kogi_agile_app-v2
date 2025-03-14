import React, { useEffect, useState } from "react";
import { Box, TextField, MenuItem, Button, Grid } from "@mui/material";
import lgasAndWards from "../Lga&wards.json";
import { Link } from "react-router-dom";
import preSelectLga from '../preselectLga.json'

export const PreselectForm = () => {
  const [formData, setFormData] = useState({
    lgaOfEnrollment: "",
    schoolType: ""
  });

  const schoolTypes = [
    { id: 1, name: "Primary"},
    { id: 2, name: "Technical" },
    { id: 3, name: " UBE/JSS" },
    { id: 4, name: "JSS/SSS" },
  ];

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    localStorage.setItem("preselectFilter", JSON.stringify(formData));
  }, [formData]);


  return (
    <Grid
      container
      direction="column"
      spacing={3}
      p={2}
      sx={{
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
      }}
    >

<Grid item>
        <TextField
          sx={{ width: "300px" }}
          label="LGA of Enrollment"
          name="lgaOfEnrollment"
          size="small" // Corrected this
          select
          variant="outlined"
          fullWidth
          value={formData.lgaOfEnrollment}
          onChange={handleSelectChange}
          required
        >
          {preSelectLga.map((lga) => (
            <MenuItem key={lga._id} value={lga._id}>
              {lga._id}
            </MenuItem>
          ))}
        </TextField>
      </Grid>


      <Grid item>
        <TextField
          sx={{ width: "300px" }}
          label="School Type"
          name="schoolType"
          size="small"
          select
          variant="outlined"
          fullWidth
          value={formData.schoolType}
          onChange={handleSelectChange}
          required
        >
          {schoolTypes.map((schoolType) => (
            <MenuItem key={schoolType.id} value={schoolType.name}>
              {schoolType.name}
            </MenuItem>
          ))}
        </TextField>
      </Grid>

     

      <Grid item>
        <Link to="/enumerator-dashboard/create-student-school-selector">
          <Button variant="contained">Next</Button>
        </Link>
      </Grid>
    </Grid>
  );
};
