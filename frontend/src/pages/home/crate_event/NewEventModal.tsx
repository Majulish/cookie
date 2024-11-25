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
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventFormInputs } from "./eventScheme";
import useEventModal from "./useEventModal";

interface NewEventDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventFormInputs) => void;
}

const NewEventDialog: React.FC<NewEventDialogProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const {
    jobList,
    handleAddJob,
    handleJobChange,
    handleRemoveJob,
    handleFormSubmit,
    resetModalState,
    availableJobs,
  } = useEventModal(onSubmit);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    trigger,
  } = useForm<EventFormInputs>({
    resolver: zodResolver(eventSchema),
    mode: 'onChange',
    defaultValues: {
      start_date: '',
      start_time: '',
      end_date: '',
      end_time: '',
    }
  });

  // Watch date/time fields
  const startDate = watch('start_date');
  const startTime = watch('start_time');
  const endDate = watch('end_date');
  const endTime = watch('end_time');

  // Validate dates when they change
  React.useEffect(() => {
    if (startDate && startTime && endDate && endTime) {
      console.log('Form Values Changed:');
      console.log('Start:', startDate, startTime);
      console.log('End:', endDate, endTime);
      console.log('Current Errors:', {
        start_date: errors.start_date,
        start_time: errors.start_time,
        end_date: errors.end_date,
        end_time: errors.end_time,
      });
      trigger(['start_date', 'start_time', 'end_date', 'end_time']);
    }
  }, [startDate, startTime, endDate, endTime, errors, trigger]);

  const handleClose = () => {
    reset();
    resetModalState();
    onClose();
  };


  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>New Event</DialogTitle>
      <DialogContent>
       <form id="new-event-form" onSubmit={handleSubmit(handleFormSubmit)}>
          <TextField
            label="Event Name"
            fullWidth
            margin="normal"
            {...register("event_name")}
            error={!!errors.event_name}
            helperText={errors.event_name?.message}
          />
          <TextField
            label="Event Description"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            {...register("event_description")}
            error={!!errors.event_description}
            helperText={errors.event_description?.message}
          />
          <TextField
            label="Location"
            fullWidth
            margin="normal"
            {...register("location")}
            error={!!errors.location}
            helperText={errors.location?.message}
          />

          {/* Date and Time Fields */}
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

          {/* Choose Workers Section */}
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
          <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddJob}>
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