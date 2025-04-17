import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Container, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  Paper, 
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  CssBaseline,
  createTheme,
  ThemeProvider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider
} from '@mui/material';
import { 
  PersonAdd as PersonAddIcon, 
  LocalHospital as HospitalIcon,
  List as ListIcon
} from '@mui/icons-material';

// Theme with blue colors and red icon
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Blue color
      contrastText: '#fff',
    },
    secondary: {
      main: '#388e3c', // Green color for buttons
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    error: {
      main: '#d32f2f', // Red color for hospital icon
    }
  },
  typography: {
    h4: {
      fontWeight: 700,
      marginBottom: '1rem',
      color: '#1976d2', // Blue color for text
    },
    h5: {
      fontWeight: 600,
      color: '#1976d2', // Blue color for text
      marginTop: '2rem',
    },
    body1: {
      fontSize: '1.1rem',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          padding: '12px 24px',
          textTransform: 'none',
          fontSize: '1rem',
          fontWeight: 600,
          height: '50px',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            fontSize: '1.1rem',
            marginBottom: '8px',
            display: 'block',
            position: 'relative',
            transform: 'none',
            color: '#333',
          },
          '& .MuiOutlinedInput-root': {
            fontSize: '1.1rem',
            height: '56px',
          },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            fontSize: '1.1rem',
            marginBottom: '8px',
            display: 'block',
            position: 'relative',
            transform: 'none',
            color: '#333',
          },
          '& .MuiSelect-select': {
            fontSize: '1.1rem',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          fontSize: '1rem',
          backgroundColor: '#f5f5f5',
        },
        body: {
          fontSize: '1rem',
        },
      },
    },
  },
});

const PatientForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    contact: ''
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [errors, setErrors] = useState({});
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.age) newErrors.age = 'Age is required';
    else if (isNaN(formData.age) || formData.age < 0 || formData.age > 120) 
      newErrors.age = 'Please enter a valid age (0-120)';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.contact) newErrors.contact = 'Contact is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:8000/patients/', {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        contact: formData.contact
      });

      setSnackbarMessage('Patient registered successfully!');
      setSnackbarSeverity('success');
      setOpenSnackbar(true);
      
      // Reset form
      setFormData({
        name: '',
        age: '',
        gender: '',
        contact: ''
      });
      
      // Refresh patient list
      if (showPatientList) {
        fetchPatients();
      }
    } catch (error) {
      setSnackbarMessage('Error registering patient: ' + (error.response?.data?.detail || error.message));
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8000/patients/');
      setPatients(response.data);
    } catch (error) {
      setSnackbarMessage('Error fetching patients: ' + error.message);
      setSnackbarSeverity('error');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const togglePatientList = () => {
    if (!showPatientList) {
      fetchPatients();
    }
    setShowPatientList(!showPatientList);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Registration Form */}
        <Paper elevation={3} sx={{ p: 6, mb: 6, borderRadius: '12px' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <HospitalIcon color="error" sx={{ fontSize: 48, mr: 3, alignSelf: 'flex-start', mt: '4px' }} />
            <Typography variant="h4" component="h1" sx={{ lineHeight: '1.2' }}>
              Hospital Patient Registration
            </Typography>
          </Box>
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <InputLabel htmlFor="name-field">Full Name</InputLabel>
                <TextField
                  fullWidth
                  id="name-field"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  variant="outlined"
                  placeholder="Enter patient's full name"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InputLabel htmlFor="age-field">Age</InputLabel>
                <TextField
                  fullWidth
                  id="age-field"
                  name="age"
                  type="number"
                  value={formData.age}
                  onChange={handleChange}
                  error={!!errors.age}
                  helperText={errors.age}
                  variant="outlined"
                  placeholder="Enter patient's age"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <InputLabel htmlFor="gender-field">Gender</InputLabel>
                <FormControl fullWidth error={!!errors.gender} sx={{ mb: 2 }}>
                  <Select
                    id="gender-field"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    displayEmpty
                    renderValue={formData.gender !== "" ? undefined : () => "Select gender"}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                    <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                  </Select>
                  {errors.gender && (
                    <Typography variant="caption" color="error" sx={{ ml: 1.5, mt: 1, display: 'block' }}>
                      {errors.gender}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <InputLabel htmlFor="contact-field">Contact Number</InputLabel>
                <TextField
                  fullWidth
                  id="contact-field"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  error={!!errors.contact}
                  helperText={errors.contact}
                  variant="outlined"
                  placeholder="Enter contact number"
                  sx={{ mb: 2 }}
                />
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="secondary"
                    size="large"
                    startIcon={<PersonAddIcon />}
                    disabled={loading}
                    sx={{ minWidth: '220px' }}
                  >
                    {loading ? 'Registering...' : 'Add Patient'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    size="large"
                    startIcon={<ListIcon />}
                    onClick={togglePatientList}
                    disabled={loading}
                    sx={{ minWidth: '220px' }}
                  >
                    {showPatientList ? 'Hide Patients' : 'Show All Patients'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>

        {/* Patient List Section */}
        {showPatientList && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
              Registered Patients
            </Typography>
            <Divider sx={{ mb: 4 }} />
            <Paper elevation={3} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              <TableContainer>
                <Table stickyHeader aria-label="patient table">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Full Name</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Registration Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients.length > 0 ? (
                      patients.map((patient) => (
                        <TableRow key={patient.id} hover>
                          <TableCell>{patient.id}</TableCell>
                          <TableCell>{patient.name}</TableCell>
                          <TableCell>{patient.age}</TableCell>
                          <TableCell>{patient.gender}</TableCell>
                          <TableCell>{patient.contact}</TableCell>
                          <TableCell>
                            {new Date(patient.created_at).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body1" color="textSecondary">
                            No patient records found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
        
        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbarSeverity} 
            sx={{ width: '100%', fontSize: '1rem' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
};

export default PatientForm;