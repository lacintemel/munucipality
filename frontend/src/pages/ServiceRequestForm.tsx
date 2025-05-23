import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  InputAdornment,
  Fade,
  Zoom,
  Slide,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Title as TitleIcon,
  Description as DescriptionIcon,
  Category as CategoryIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useServiceRequest } from '../contexts/ServiceRequestContext';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

const steps = ['Basic Information', 'Location Details', 'Review & Submit'];

const ServiceRequestForm: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { createRequest } = useServiceRequest();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    location: {
      coordinates: [0, 0],
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedLocation, setSelectedLocation] = useState<google.maps.LatLng | null>(null);

  const handleNext = () => {
    if (validateStep()) {
      if (activeStep === steps.length - 1) {
        handleSubmit(new Event('submit') as any);
      } else {
        setActiveStep((prevStep) => prevStep + 1);
      }
    }
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields before submission
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        location: formData.location.address.street ? {
          type: 'Point',
          coordinates: selectedLocation ? [selectedLocation.lat(), selectedLocation.lng()] : [0, 0],
          address: {
            street: formData.location.address.street.trim(),
            city: formData.location.address.city.trim(),
            state: formData.location.address.state.trim(),
            zipCode: formData.location.address.zipCode.trim(),
          },
        } : {
          type: 'Point',
          coordinates: [0, 0],
          address: {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          }
        }
      };

      await createRequest(requestData);
      navigate('/requests');
    } catch (error: any) {
      console.error('Error creating request:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Failed to create service request. Please try again.' 
      });
    }
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    switch (activeStep) {
      case 0:
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
      case 1:
        // Location is optional, no validation needed
        break;
      case 2:
        // Review step, validate all required fields again
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.category) newErrors.category = 'Category is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setSelectedLocation(e.latLng);
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          coordinates: [e.latLng!.lat(), e.latLng!.lng()],
        },
      }));
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Fade in timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card elevation={0} sx={{ 
                  background: `linear-gradient(45deg, ${theme.palette.primary.light}15, ${theme.palette.primary.main}15)`,
                  borderRadius: 2,
                  mb: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Request Details
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Please provide the basic information about your service request. This will help us understand and process your request efficiently.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  error={!!errors.title}
                  helperText={errors.title}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <TitleIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  error={!!errors.description}
                  helperText={errors.description}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <DescriptionIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                    startAdornment={
                      <InputAdornment position="start">
                        <CategoryIcon color="primary" />
                      </InputAdornment>
                    }
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        },
                      },
                    }}
                  >
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="repair">Repair</MenuItem>
                    <MenuItem value="installation">Installation</MenuItem>
                    <MenuItem value="inspection">Inspection</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  {errors.category && (
                    <Typography color="error" variant="caption">
                      {errors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Fade>
        );
      case 1:
        return (
          <Slide direction="left" in timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card elevation={0} sx={{ 
                  background: `linear-gradient(45deg, ${theme.palette.primary.light}15, ${theme.palette.primary.main}15)`,
                  borderRadius: 2,
                  mb: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Location Information (Optional)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      You can optionally provide location details for your service request. This will help us better understand where the service is needed.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Select Location (Optional)
                  </Typography>
                  <Box sx={{ height: 400, width: '100%', mb: 2, borderRadius: 2, overflow: 'hidden' }}>
                    <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY!}>
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%' }}
                        center={selectedLocation ? { lat: selectedLocation.lat(), lng: selectedLocation.lng() } : { lat: 0, lng: 0 }}
                        zoom={13}
                        onClick={handleMapClick}
                        options={{
                          styles: [
                            {
                              featureType: 'poi',
                              elementType: 'labels',
                              stylers: [{ visibility: 'off' }]
                            }
                          ]
                        }}
                      >
                        {selectedLocation && <Marker position={selectedLocation} />}
                      </GoogleMap>
                    </LoadScript>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Click on the map to mark the exact location (optional)
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Street Address"
                  value={formData.location.address.street}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: { ...formData.location.address, street: e.target.value },
                      },
                    })
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="City"
                  value={formData.location.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: { ...formData.location.address, city: e.target.value },
                      },
                    })
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="State"
                  value={formData.location.address.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: { ...formData.location.address, state: e.target.value },
                      },
                    })
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="ZIP Code"
                  value={formData.location.address.zipCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: {
                        ...formData.location,
                        address: { ...formData.location.address, zipCode: e.target.value },
                      },
                    })
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Slide>
        );
      case 2:
        return (
          <Zoom in timeout={500}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card elevation={0} sx={{ 
                  background: `linear-gradient(45deg, ${theme.palette.primary.light}15, ${theme.palette.primary.main}15)`,
                  borderRadius: 2,
                  mb: 3
                }}>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      <CheckCircleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Review Your Request
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Please review all the information before submitting your service request.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle1" color="primary" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TitleIcon sx={{ mr: 1 }} />
                        Basic Information
                      </Typography>
                      <Card elevation={0} sx={{ 
                        background: theme.palette.background.default,
                        p: 2,
                        borderRadius: 2,
                        mb: 2
                      }}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Title:</strong> {formData.title}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Category:</strong> {formData.category}
                        </Typography>
                        <Typography variant="body1">
                          <strong>Description:</strong> {formData.description}
                        </Typography>
                      </Card>
                    </Grid>
                    {formData.location.address.street && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle1" color="primary" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <LocationIcon sx={{ mr: 1 }} />
                          Location Details
                        </Typography>
                        <Card elevation={0} sx={{ 
                          background: theme.palette.background.default,
                          p: 2,
                          borderRadius: 2
                        }}>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Address:</strong> {formData.location.address.street}
                          </Typography>
                          <Typography variant="body1">
                            {formData.location.address.city}, {formData.location.address.state}{' '}
                            {formData.location.address.zipCode}
                          </Typography>
                        </Card>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          </Zoom>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <MotionPaper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 2,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            Create New Request
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Fill out the form below to submit your service request
          </Typography>
        </Box>

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <form onSubmit={handleSubmit}>
          {getStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              endIcon={activeStep === steps.length - 1 ? <SendIcon /> : <ArrowForwardIcon />}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem',
              }}
            >
              {activeStep === steps.length - 1 ? 'Submit Request' : 'Next'}
            </Button>
          </Box>
        </form>
      </MotionPaper>
    </Container>
  );
};

export default ServiceRequestForm; 