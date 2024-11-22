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
import { DateTimePicker } from "@mui/x-date-pickers";
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
    setStartDateTime,
    setEndDateTime,
    startDateTime,
    endDateTime,
    availableJobs,
  } = useEventModal(onSubmit);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EventFormInputs>({
    resolver: zodResolver(eventSchema),
  });

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
              <DateTimePicker
                label="Start Date and Time"
                value={startDateTime}
                onChange={setStartDateTime}
                slots={{ textField: TextField }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.start_date,
                    helperText: errors.start_date?.message,
                  },
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <DateTimePicker
                label="End Date and Time"
                value={endDateTime}
                onChange={setEndDateTime}
                slots={{ textField: TextField }}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.end_date,
                    helperText: errors.end_date?.message,
                  },
                }}
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
