import * as React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert'; 
import Copyright from '../components/CopyRight';
import { useSignUp } from '../hooks/useSignUp';
import { signUpSchema } from '../schemas/signUpSchema';
import { SignUpFormData } from '../types/auth';

const defaultTheme = createTheme();

export default function NewSignUp() {
  const { errors: serverErrors, handleSubmit: handleServerSubmit, loading, isSuccess, handleDialogClose, globalError } = useSignUp();

  const { control, handleSubmit, formState: { errors } } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      id: "",
      phoneNumber: "",
      dateOfBirth: "",
      email: "",
      password: "",
      confirmPassword: "",
      companyName: "",
      firstName: "",
      lastName: "",
      role: "",
    }
  });

  const onSubmit = handleSubmit((data) => {
    handleServerSubmit(data);
  });

  return (
    <ThemeProvider theme={defaultTheme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          {globalError && <Alert severity="error">{globalError}</Alert>}
          <Box component="form" noValidate onSubmit={onSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="username"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      fullWidth
                      id="username"
                      label="Username"
                      autoComplete="username"
                      error={Boolean(errors.username) || Boolean(serverErrors.username)}
                      helperText={errors.username?.message || serverErrors.username}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="firstName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      autoComplete="given-name"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                      error={Boolean(errors.firstName) || Boolean(serverErrors.firstName)}
                      helperText={errors.firstName?.message || serverErrors.firstName}
                    />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="lastName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      autoComplete="family-name"
                      error={Boolean(errors.lastName) || Boolean(serverErrors.lastName)}
                      helperText={errors.lastName?.message || serverErrors.lastName}
                    />
                  )}
                />
              </Grid>
              {/* Add similar Controller components for id, phoneNumber, dateOfBirth, email, password, confirmPassword, companyName */}
              <Grid item xs={12}>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth>
                      <InputLabel id="role">Role</InputLabel>
                      <Select
                        {...field}
                        labelId="role"
                        id="role"
                        label="Role"
                        error={Boolean(errors.role) || Boolean(serverErrors.role)}
                      >
                        <MenuItem value="worker">Worker</MenuItem>
                        <MenuItem value="recruiter">Recruiter</MenuItem>
                        <MenuItem value="hr_manager">HR Manager</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link component={RouterLink} to="/log-in" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>

      <Dialog open={isSuccess} onClose={handleDialogClose}>
        <DialogTitle>{"User registered successfully"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your account has been created successfully. Please log in to continue.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} component={RouterLink} to='/sign-up'>
            Log in
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}