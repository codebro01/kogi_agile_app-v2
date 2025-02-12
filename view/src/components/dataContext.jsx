import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate if navigating
import { SpinnerLoader } from './spinnerLoader';
import { Box } from '@mui/material';
// Create the context
export const StudentsContext = createContext();
export const SchoolsContext = createContext();


// Create the provider component
export const DataProvider = ({ children }) => {
  const [studentsData, setStudentsData] = useState([]);
  const [schoolsData, setSchoolsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [user, setUser] = useState({
    isAdmin: false,  // Change this according to your user data
    // Add other user data like token, name, etc.
  });

  const API_URL = `${import.meta.env.VITE_API_URL}/api/v1`;
  const token = localStorage.getItem('token') || '';
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentsRes, schoolsRes] = await Promise.all([
          axios.get(`${API_URL}/student`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            withCredentials: true,
          }),
          axios.get(`${API_URL}/all-schools`),
        ]);


        setStudentsData(studentsRes.data.students);
        setSchoolsData(schoolsRes.data.allSchools);
      } catch (err) {
        console.error(err);
        if (err.response?.status === 401) {
          navigate('/sign-in');
        } else {
          setError(err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [API_URL, navigate, token]);
  return (
    <StudentsContext.Provider value={{ studentsData, setStudentsData }}>
      <SchoolsContext.Provider value={{ selectedSchool, setSelectedSchool, schoolsData }}>
        {loading ? <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}><SpinnerLoader /></Box> : children}
        {error && <div>Error: {error.message}</div>}
      </SchoolsContext.Provider>
    </StudentsContext.Provider>
  );
};

