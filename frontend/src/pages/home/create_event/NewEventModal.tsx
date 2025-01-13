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
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
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

  // Initialize form with event data when in edit mode
  useEffect(() => {
    if (open && mode === 'edit' && eventData) {
      // Reset form before setting new values
      reset();
      
      // Set the form values
      setValue("event_name", eventData.name);
      setValue("event_description", eventData.description);
      setValue("location", eventData.location);
      setValue("start_date", eventData.start_date);
      setValue("start_time", eventData.start_time);
      setValue("end_date", eventData.end_date);
      setValue("end_time", eventData.end_time);

      const convertedJobs = eventData.jobs.map(job => ({
        job: job.job_title.toLowerCase(),
        amount: job.slots
      }));
      setInitialJobs(convertedJobs);
    }
  }, [open]); // Only run when the modal opens

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
        <DialogTitle>
          {mode === 'create' ? 'New Event' : 'Edit Event'}
        </DialogTitle>
        <DialogContent>
          <form id="event-form" onSubmit={handleSubmit}>
            <Controller
              name="event_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Event Name"
                  fullWidth
                  margin="normal"
                  error={!!errors.event_name}
                  helperText={errors.event_name?.message}
                />
              )}
            />
            
            <Box sx={{ mt: 2 }}>
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
                    backgroundColor: '#f5f5f5',
                    '& .MuiInputBase-root': {
                      minHeight: '60px',
                      height: 'auto',
                    },
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                    }
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
                      },
                    }}
                  />
                )}
              />
            </Box>
            
            <Controller
              name="location"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Location"
                  fullWidth
                  margin="normal"
                  error={!!errors.location}
                  helperText={errors.location?.message}
                />
              )}
            />

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
                      margin="normal"
                      error={!!errors.start_date}
                      helperText={errors.start_date?.message || "Format: DD/MM/YYYY"}
                      placeholder="DD/MM/YYYY"
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
                      margin="normal"
                      error={!!errors.start_time}
                      helperText={errors.start_time?.message || "Format: HH:mm (24-hour)"}
                      placeholder="HH:mm"
                    />
                  )}
                />
              </Grid>
            </Grid>
            
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
                      margin="normal"
                      error={!!errors.end_date}
                      helperText={errors.end_date?.message || "Format: DD/MM/YYYY"}
                      placeholder="DD/MM/YYYY"
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
                      margin="normal"
                      error={!!errors.end_time}
                      helperText={errors.end_time?.message || "Format: HH:mm (24-hour)"}
                      placeholder="HH:mm"
                    />
                  )}
                />
              </Grid>
            </Grid>

            <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
              Choose Workers
            </Typography>
            
            {jobList.map((job, index) => (
              <Box 
                key={index} 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 2, 
                  mb: 2 
                }}
              >
                <FormControl fullWidth>
                  <InputLabel>Job</InputLabel>
                  <Select
                    value={job.job}
                    onChange={(e) => handleJobChange(index, "job", e.target.value)}
                    label="Job"
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
                  InputProps={{ inputProps: { min: 1 } }}
                  sx={{ width: 100 }}
                />
                <IconButton 
                  onClick={() => handleRemoveJob(index)}
                  color="error"
                  sx={{ p: 1 }}
                >
                  <DeleteOutlineIcon />
                </IconButton>
              </Box>
            ))}
            
            <Button 
              startIcon={<AddCircleOutlineIcon />} 
              onClick={handleAddJob} 
              variant="outlined"
              sx={{ mt: 1 }}
            >
              Add Job
            </Button>
          </form>
        </DialogContent>
        
        <DialogActions sx={{ p: 2.5, pt: 1.5 }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="event-form"
            variant="contained"
            color="primary"
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
      />
    </>
  );
};

export default NewEventDialog;