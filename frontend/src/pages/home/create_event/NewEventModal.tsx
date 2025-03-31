import React, { useEffect } from "react";
import {
  Dialog,
  TextField,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Box,
  Typography,
  Divider,
  Paper,
  useTheme,
  alpha,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import { EventFormInputs } from "./eventScheme";
import { useEventJobs } from "./useEventJobs";
import { useEventForm } from "./useEventForm";
import GenerateButton from "../../../components/GenerateButton";
import SuccessModal from "../../../components/SuccessModal";
import { MyEventScheme } from "./eventScheme";
import { Controller } from "react-hook-form";

interface EventFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormInputs) => Promise<boolean>;
  mode: 'create' | 'edit';
  eventData?: MyEventScheme;
}

const NewEventDialog: React.FC<EventFormModalProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  mode,
  eventData 
}) => {
  const theme = useTheme();
  
  // Initialize the jobs hook first
  const {
    jobList,
    handleAddJob,
    handleJobChange,
    handleRemoveJob,
    getJobsObject,
    resetJobs,
    availableJobs,
    setInitialJobs,
  } = useEventJobs();
  
  // Then use the form hook, passing in the functions from jobs hook
  const {
    control,
    handleSubmit,
    errors,
    prompt,
    setPrompt,
    isGenerating,
    handleGenerateDescription,
    reset,
    showSuccessModal,
    handleCloseSuccessModal,
    setValue,
  } = useEventForm({
    onSubmit,
    getJobsObject,
    resetJobs,
    mode,
  });
  
  // After both hooks are initialized, now we can set up the connection
  // between them by passing setValue to the jobs hook
  useEffect(() => {
    if (setValue && jobList.length > 0) {
      setValue("jobs", getJobsObject());
    }
  }, [jobList, setValue, getJobsObject]);

  // Initialize form with event data when in edit mode
  useEffect(() => {
    if (open && mode === 'edit' && eventData) {
      // Reset form before setting new values
      reset();
      
      // Set the form values
      setValue("event_name", eventData.name);
      setValue("event_description", eventData.description);
      setValue("city", eventData.city);
      setValue("address", eventData.address);
      setValue("start_date", eventData.start_date);
      setValue("start_time", eventData.start_time);
      setValue("end_date", eventData.end_date);
      setValue("end_time", eventData.end_time);

      const convertedJobs = eventData.jobs.map(job => ({
        job: job.job_title.toLowerCase(),
        amount: job.slots
      }));
      
      // Set initial jobs in the job list
      setInitialJobs(convertedJobs);
      
      // Also directly set the jobs field in the form values
      const jobsObject = convertedJobs.reduce((acc, { job, amount }) => {
        acc[job] = amount;
        return acc;
      }, {} as Record<string, number>);
      
      setValue("jobs", jobsObject);
    }
  }, [open, mode, eventData, reset, setValue, setInitialJobs]);

  const handleClose = () => {
    reset();
    onClose();
  };

  // Custom section header
  const SectionHeader = ({ icon, title }: { icon: React.ReactNode, title: string }) => (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      mb: 2,
      mt: 3,
    }}>
      {icon}
      <Typography variant="h6" sx={{ fontWeight: 500 }}>
        {title}
      </Typography>
    </Box>
  );

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose} 
        fullWidth 
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          px: 3,
          py: 2.5,
          bgcolor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontSize: '1.25rem',
        }}>
          {mode === 'create' ? 'New Event' : 'Edit Event'}
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <form id="event-form" onSubmit={handleSubmit}>
            {/* Event Name */}
            <Controller
              name="event_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Event Name"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  error={!!errors.event_name}
                  helperText={errors.event_name?.message}
                  InputProps={{
                    sx: { borderRadius: 1.5 }
                  }}
                  sx={{ mb: 2 }}
                />
              )}
            />
            
            {/* Description Section */}
            <SectionHeader 
              icon={<DescriptionIcon color="primary" />} 
              title="Event Description" 
            />
            
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            }}>
              <Box sx={{ 
                display: 'flex', 
                gap: 1,
              }}>
                <TextField
                  label="Generate Description with AI"
                  fullWidth
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter prompt for AI description generation"
                  multiline
                  minRows={2}
                  maxRows={10}
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    '& .MuiInputBase-root': {
                      minHeight: '60px',
                      height: 'auto',
                      borderRadius: 1.5,
                    },
                  }}
                />
                <GenerateButton 
                  onClick={handleGenerateDescription}
                  loading={isGenerating}
                />
              </Box>
                
              <Controller
                name="event_description"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Event Description"
                    fullWidth
                    multiline
                    minRows={8}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    error={!!errors.event_description}
                    helperText={errors.event_description?.message}
                    sx={{
                      mt: 2,
                      '& .MuiInputBase-root': {
                        minHeight: '200px',
                        height: 'auto',
                        borderRadius: 1.5,
                      },
                    }}
                  />
                )}
              />
            </Box>
            
            {/* Location Section */}
            <SectionHeader 
              icon={<LocationOnIcon color="primary" />} 
              title="Event Location" 
            />
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 3, 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Controller
                    name="city"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="City"
                        fullWidth
                        variant="outlined"
                        error={!!errors.city}
                        helperText={errors.city?.message}
                        InputProps={{
                          sx: { borderRadius: 1.5 }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Controller
                    name="address"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Address"
                        fullWidth
                        variant="outlined"
                        error={!!errors.address}
                        helperText={errors.address?.message}
                        InputProps={{
                          sx: { borderRadius: 1.5 }
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Date/Time Section */}
            <SectionHeader 
              icon={<CalendarTodayIcon color="primary" />} 
              title="Event Schedule" 
            />
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 3, 
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Start Date & Time
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="start_date"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Start Date"
                          fullWidth
                          variant="outlined"
                          error={!!errors.start_date}
                          helperText={errors.start_date?.message || "Format: DD/MM/YYYY"}
                          placeholder="DD/MM/YYYY"
                          InputProps={{
                            startAdornment: <CalendarTodayIcon color="action" sx={{ mr: 1 }} />,
                            sx: { borderRadius: 1.5 }
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="start_time"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Start Time"
                          fullWidth
                          variant="outlined"
                          error={!!errors.start_time}
                          helperText={errors.start_time?.message || "Format: HH:mm (24-hour)"}
                          placeholder="HH:mm"
                          InputProps={{
                            startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />,
                            sx: { borderRadius: 1.5 }
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
              
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  End Date & Time
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Controller
                      name="end_date"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="End Date"
                          fullWidth
                          variant="outlined"
                          error={!!errors.end_date}
                          helperText={errors.end_date?.message || "Format: DD/MM/YYYY"}
                          placeholder="DD/MM/YYYY"
                          InputProps={{
                            startAdornment: <CalendarTodayIcon color="action" sx={{ mr: 1 }} />,
                            sx: { borderRadius: 1.5 }
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Controller
                      name="end_time"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="End Time"
                          fullWidth
                          variant="outlined"
                          error={!!errors.end_time}
                          helperText={errors.end_time?.message || "Format: HH:mm (24-hour)"}
                          placeholder="HH:mm"
                          InputProps={{
                            startAdornment: <AccessTimeIcon color="action" sx={{ mr: 1 }} />,
                            sx: { borderRadius: 1.5 }
                          }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            {/* Worker Section */}
            <SectionHeader 
              icon={<WorkOutlineIcon color="primary" />} 
              title="Event Staff" 
            />
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                border: `1px solid ${errors.jobs ? theme.palette.error.main : theme.palette.divider}`,
                borderRadius: 2,
              }}
            >
              {errors.jobs && typeof errors.jobs.message === 'string' && (
                <Typography 
                  color="error" 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    mb: 1.5,
                    fontWeight: 500
                  }}
                >
                  {errors.jobs.message}
                </Typography>
              )}
              
              {jobList.map((job, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 2, 
                    mb: 2,
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: index % 2 === 0 ? alpha(theme.palette.primary.main, 0.04) : 'transparent',
                  }}
                >
                  <FormControl fullWidth>
                    <InputLabel>Job</InputLabel>
                    <Select
                      value={job.job}
                      onChange={(e) => handleJobChange(index, "job", e.target.value)}
                      label="Job"
                      sx={{ borderRadius: 1.5 }}
                    >
                      {availableJobs.map((availableJob) => (
                        <MenuItem key={availableJob} value={availableJob}>
                          {availableJob.charAt(0).toUpperCase() + availableJob.slice(1)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Amount"
                    type="number"
                    value={job.amount}
                    onChange={(e) => handleJobChange(index, "amount", e.target.value)}
                    InputProps={{ 
                      inputProps: { min: 1 },
                      sx: { borderRadius: 1.5 }
                    }}
                    sx={{ width: 100 }}
                  />
                  <IconButton 
                    onClick={() => handleRemoveJob(index)}
                    color="error"
                    sx={{ 
                      p: 1,
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.error.main, 0.2),
                      }
                    }}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Box>
              ))}
              
              <Button 
                startIcon={<AddCircleOutlineIcon />} 
                onClick={handleAddJob} 
                variant="outlined"
                sx={{ 
                  mt: jobList.length > 0 ? 1 : 0,
                  borderRadius: 1.5,
                  textTransform: 'none',
                }}
              >
                Add Job
              </Button>
            </Paper>
          </form>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 2.5, 
          borderTop: `1px solid ${theme.palette.divider}`,
          justifyContent: 'flex-end',
          gap: 1.5,
        }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            sx={{ 
              px: 3,
              borderRadius: 1.5,
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="event-form"
            variant="contained"
            color="primary"
            sx={{ 
              px: 3,
              borderRadius: 1.5,
              textTransform: 'none',
              boxShadow: 2,
            }}
          >
            {mode === 'create' ? 'Create Event' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      <SuccessModal 
        open={showSuccessModal} 
        onClose={() => {
          handleCloseSuccessModal();
          onClose();
        }} 
        mode={mode}
      />
    </>
  );
};

export default NewEventDialog;