import React from "react";
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
  CircularProgress,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { EventFormInputs } from "./eventScheme";
import { useEventJobs } from "./useEventJob";
import { useEventForm } from "./useEventForm";

interface NewEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormInputs) => void;
}

const NewEventDialog: React.FC<NewEventDialogProps> = ({ open, onClose, onSubmit }) => {
  const {
    jobList,
    handleAddJob,
    handleJobChange,
    handleRemoveJob,
    getJobsObject,
    resetJobs,
    availableJobs,
  } = useEventJobs();

  const {
    register,
    handleSubmit,
    errors,
    prompt,
    setPrompt,
    isGenerating,
    handleGenerateDescription,
    reset,
  } = useEventForm({
    onSubmit,
    getJobsObject,
    resetJobs,
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>New Event</DialogTitle>
      <DialogContent>
        <form id="new-event-form" onSubmit={handleSubmit}>
          <TextField
            label="Event Name"
            fullWidth
            margin="normal"
            {...register("event_name")}
            error={!!errors.event_name}
            helperText={errors.event_name?.message}
          />
          
          <Box sx={{ mt: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              '& .MuiInputBase-root': {
                minHeight: '60px',
                height: 'auto',
                backgroundColor: '#f5f5f5'
              }
            }}>
              <TextField
                label="Generate Description with AI"
                fullWidth
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter prompt for AI description generation"
                multiline
                rows={2}
                sx={{
                  '& .MuiInputLabel-root': {
                    background: 'white',
                    padding: '0 4px',
                  }
                }}
              />
              <Button
                onClick={handleGenerateDescription}
                variant="outlined"
                disabled={isGenerating}
                sx={{ minWidth: '120px' }}
              >
                {isGenerating ? <CircularProgress size={16} /> : "AI Generate"}
              </Button>
            </Box>
            
            <TextField
              label="Event Description"
              fullWidth
              multiline
              {...register("event_description")}
              error={!!errors.event_description}
              helperText={errors.event_description?.message}
              sx={{
                mt: '-1px',
                '& .MuiInputBase-root': {
                  minHeight: '200px',
                  height: 'auto'
                },
                '& .MuiInputLabel-root': {
                  background: 'white',
                  padding: '0 4px',
                }
              }}
            />
          </Box>
          
          <TextField
            label="Location"
            fullWidth
            margin="normal"
            {...register("location")}
            error={!!errors.location}
            helperText={errors.location?.message}
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="Start Date (DD/MM/YYYY)"
                fullWidth
                margin="normal"
                {...register("start_date")}
                error={!!errors.start_date}
                helperText={errors.start_date?.message}
                placeholder="DD/MM/YYYY"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="Start Time (HH:mm)"
                fullWidth
                margin="normal"
                {...register("start_time")}
                error={!!errors.start_time}
                helperText={errors.start_time?.message}
                placeholder="HH:mm"
              />
            </Grid>
          </Grid>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label="End Date (DD/MM/YYYY)"
                fullWidth
                margin="normal"
                {...register("end_date")}
                error={!!errors.end_date}
                helperText={errors.end_date?.message}
                placeholder="DD/MM/YYYY"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                label="End Time (HH:mm)"
                fullWidth
                margin="normal"
                {...register("end_time")}
                error={!!errors.end_time}
                helperText={errors.end_time?.message}
                placeholder="HH:mm"
              />
            </Grid>
          </Grid>

          <Typography variant="h6" sx={{ mt: 3 }}>
            Choose Workers
          </Typography>
          {jobList.map((job, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 2, mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Job</InputLabel>
                <Select
                  value={job.job}
                  onChange={(e) => handleJobChange(index, "job", e.target.value)}
                >
                  {availableJobs.map((availableJob) => (
                    <MenuItem key={availableJob} value={availableJob}>
                      {availableJob}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Amount"
                type="number"
                value={job.amount}
                onChange={(e) => handleJobChange(index, "amount", e.target.value)}
                sx={{ maxWidth: 100 }}
              />
              <IconButton onClick={() => handleRemoveJob(index)}>
                <AddCircleOutlineIcon />
              </IconButton>
            </Box>
          ))}
          <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddJob} sx={{ mt: 2 }}>
            Add Job
          </Button>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button
          type="submit"
          form="new-event-form"
          variant="contained"
          color="primary"
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewEventDialog;