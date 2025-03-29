import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Typography,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Stack,
  Divider,
  Avatar,
  Paper,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import { feedbackWorker } from '../../api/eventApi';

interface WorkerRatingModalProps {
  open: boolean;
  onClose: () => void;
  eventId: number;
  workerId: number;
  workerName: string;
  jobTitle: string;
  onRatingSuccess: () => void;
}

const WorkerRatingModal: React.FC<WorkerRatingModalProps> = ({
  open,
  onClose,
  eventId,
  workerId,
  workerName,
  jobTitle,
  onRatingSuccess
}) => {
  const [rating, setRating] = useState<number | null>(null);
  const [ratingInput, setRatingInput] = useState<string>('');
  const [review, setReview] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const theme = useTheme();

  const handleRatingChange = (_event: React.SyntheticEvent, newValue: number | null) => {
    setRating(newValue);
    if (newValue !== null) {
      setRatingInput(newValue.toString());
    }
  };

  const handleRatingInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Allow empty input or valid float numbers between 0 and 5
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0 && parseFloat(value) <= 5)) {
      setRatingInput(value);
      setRating(value === '' ? null : parseFloat(value));
    }
  };

  const handleReviewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReview(event.target.value);
  };

  const handleSubmit = async () => {
    // Validate that at least one field is filled
    if ((rating === null || isNaN(rating)) && review.trim() === '') {
      setError('Please provide either a rating or a review.');
      return;
    }

    // Prepare feedback data
    const feedbackData: {
      rating?: number;
      review?: string;
    } = {};

    // Add rating if provided
    if (rating !== null && !isNaN(rating)) {
      feedbackData.rating = rating;
    }

    // Add review if provided
    if (review.trim() !== '') {
      feedbackData.review = review;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Send feedback to API using the correct function signature
      await feedbackWorker(eventId, workerId, feedbackData);
      
      setSuccess(true);
      setLoading(false);
      
      // Call the success callback after a short delay to show success message
      setTimeout(() => {
        onRatingSuccess();
        onClose();
        // Reset form
        setRating(null);
        setRatingInput('');
        setReview('');
        setSuccess(false);
      }, 1500);
      
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Failed to submit rating');
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form state when closing
      setRating(null);
      setRatingInput('');
      setReview('');
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      TransitionComponent={Fade}
      transitionDuration={300}
      PaperProps={{
        elevation: 5,
        sx: { 
          borderRadius: 3,
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{ 
          pb: 2, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
        }}
      >
        <Typography variant="h5" fontWeight={600} sx={{ fontSize: '1.6rem' }}>Worker Evaluation</Typography>
        <IconButton 
          aria-label="close" 
          onClick={handleClose} 
          size="medium"
          sx={{
            color: theme.palette.grey[500],
            '&:hover': {
              backgroundColor: alpha(theme.palette.grey[500], 0.1),
              color: theme.palette.grey[800]
            }
          }}
        >
          <CloseIcon fontSize="medium" />
        </IconButton>
      </DialogTitle>

      <DialogContent 
        sx={{ 
          p: 0,
          '&:first-of-type': { 
            pt: 0 
          } 
        }}
      >
        {success ? (
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center', 
              py: 8, 
              px: 3, 
              textAlign: 'center',
              bgcolor: alpha(theme.palette.success.main, 0.05)
            }}
          >
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: alpha(theme.palette.success.main, 0.2), 
                color: theme.palette.success.main,
                mb: 3
              }}
            >
              <CheckCircleOutlineIcon sx={{ fontSize: '3rem' }} />
            </Avatar>
            <Typography variant="h5" gutterBottom color="success.main" fontWeight={600} sx={{ fontSize: '1.8rem' }}>
              Feedback Submitted
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.3rem' }}>
              Thank you for rating {workerName}
            </Typography>
          </Box>
        ) : (
          <>
            {/* Worker Information */}
            <Box 
              sx={{ 
                p: 4, 
                bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900',
                borderBottom: `1px solid ${theme.palette.divider}`
              }}
            >
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar 
                  sx={{ 
                    width: 64, 
                    height: 64, 
                    bgcolor: theme.palette.primary.main,
                    fontSize: '1.6rem'
                  }}
                >
                  {workerName.charAt(0)}
                </Avatar>
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <PersonOutlineIcon sx={{ fontSize: '1.3rem' }} color="action" />
                    <Typography variant="h6" fontWeight={600} sx={{ fontSize: '1.4rem' }}>
                      {workerName}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1.5} alignItems="center" mt={0.8}>
                    <WorkOutlineIcon sx={{ fontSize: '1.3rem' }} color="action" />
                    <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.2rem' }}>
                      {jobTitle}
                    </Typography>
                  </Stack>
                </Box>
              </Stack>
            </Box>

            {/* Rating Form */}
            <Box sx={{ p: 4 }}>
              {error && (
                <Alert 
                  severity="error" 
                  sx={{ 
                    mb: 4,
                    borderRadius: 2,
                    fontSize: '1.1rem',
                    '& .MuiAlert-icon': {
                      fontSize: '1.5rem'
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              <Typography variant="h6" gutterBottom sx={{ fontSize: '1.5rem', fontWeight: 600, mb: 1.5 }}>
                Performance Evaluation
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ fontSize: '1.2rem', mb: 3 }}>
                Please provide your feedback about this worker's performance. You can submit a star rating, a written review, or both.
              </Typography>

              <Paper 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  mb: 4, 
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
                }}
              >
                <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1.3rem', fontWeight: 600, mb: 2 }}>
                  Rating (0-5)
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  <Rating
                    name="worker-rating"
                    value={rating}
                    precision={0.5}
                    onChange={handleRatingChange}
                    emptyIcon={<StarOutlineIcon fontSize="inherit" />}
                    icon={<StarIcon fontSize="inherit" />}
                    size="large"
                    sx={{ 
                      fontSize: '2.5rem',
                      color: theme.palette.warning.main,
                      '& .MuiRating-iconEmpty': {
                        color: theme.palette.grey[400]
                      }
                    }}
                  />
                  
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '1.1rem' }}>OR</Typography>
                  </Divider>
                  
                  <TextField
                    label="Custom rating"
                    variant="outlined"
                    value={ratingInput}
                    onChange={handleRatingInputChange}
                    size="medium"
                    placeholder="e.g. 4.3"
                    helperText="Enter a value between 0 and 5"
                    InputProps={{
                      startAdornment: <StarIcon fontSize="medium" sx={{ mr: 1.5, color: theme.palette.warning.main }} />,
                      sx: {
                        fontSize: '1.2rem'
                      }
                    }}
                    FormHelperTextProps={{
                      sx: {
                        fontSize: '1rem',
                        mt: 1
                      }
                    }}
                    sx={{ 
                      width: '100%', 
                      maxWidth: 250,
                      '& .MuiInputLabel-root': {
                        fontSize: '1.1rem'
                      }
                    }}
                  />
                </Box>
              </Paper>

              <Typography variant="subtitle1" gutterBottom sx={{ fontSize: '1.3rem', fontWeight: 600, mb: 2 }}>
                Review (optional)
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                placeholder="Share your experience working with this person..."
                value={review}
                onChange={handleReviewChange}
                InputProps={{
                  sx: {
                    fontSize: '1.2rem',
                    p: 2
                  }
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>
          </>
        )}
      </DialogContent>

      {!success && (
        <DialogActions 
          sx={{ 
            px: 4, 
            py: 3,
            borderTop: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === 'light' ? 'grey.50' : 'grey.900'
          }}
        >
          <Button 
            onClick={handleClose} 
            disabled={loading}
            sx={{ 
              color: theme.palette.text.secondary,
              fontSize: '1.1rem',
              textTransform: 'none',
              '&:hover': {
                bgcolor: alpha(theme.palette.text.secondary, 0.05)
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={loading || ((rating === null || isNaN(rating)) && review.trim() === '')}
            startIcon={loading && <CircularProgress size={20} color="inherit" />}
            sx={{ 
              px: 4,
              py: 1.2,
              fontSize: '1.2rem',
              fontWeight: 600,
              borderRadius: '8px',
              textTransform: 'none',
              bgcolor: theme.palette.primary.main,
              '&:hover': {
                bgcolor: theme.palette.primary.dark
              },
              '&.Mui-disabled': {
                bgcolor: alpha(theme.palette.primary.main, 0.3)
              }
            }}
          >
            {loading ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default WorkerRatingModal;