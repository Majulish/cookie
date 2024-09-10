import * as React from 'react';
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
import { useSignUp } from '../hooks/useSignUp';
import CircularProgress from '@mui/material/CircularProgress';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Alert from '@mui/material/Alert'; 
import Copyright from '../components/Copyright';

interface FormDataState{
  username: string,
  id: string,
  phoneNumber: string,
  dateOfBirth: string,
  email: string,
  password: string,
  confirmPassword: string,
  companyName: string,
  firstName: string,
  lastName: string,
  role: string,
}

const defaultTheme = createTheme();

export default function SignUp() {
  const { errors, handleSubmit, loading, isSuccess, handleDialogClose, globalError } = useSignUp(); // Add globalError from useSignUp
  const [formData, setFormData] = React.useState<FormDataState>(
    {username: "",
    id: "",
    phoneNumber: "",
    dateOfBirth: "",
    email: "",
    password:"",
    confirmPassword:"",
    companyName:"",
    firstName: "",
    lastName: "",
    role: "",});

  const handleRoleChange = (event: SelectChangeEvent) => {
    updateFormData({ role: event.target.value });
  };

  const updateFormData = (update: Partial<FormDataState>)=> {
    setFormData({...formData,
      ...update
    })


  }



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
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField 
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  error={Boolean(errors.username)}
                  helperText={errors.username}
                  value= {formData.username}
                  onChange={e=>updateFormData({username: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="First Name"
                  autoFocus
                  error={Boolean(errors.firstName)}
                  helperText={errors.firstName}
                  value= {formData.firstName}
                  onChange={e=>updateFormData({firstName: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  error={Boolean(errors.lastName)}
                  helperText={errors.lastName}
                  value= {formData.lastName}
                  onChange={e=>updateFormData({lastName: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="id"
                  label="ID"
                  name="id"
                  autoComplete="id"
                  error={Boolean(errors.id)}
                  helperText={errors.id}
                  value= {formData.id}
                  onChange={e=>updateFormData({id: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="phoneNumber"
                  label="Phone Number"
                  name="phoneNumber"
                  autoComplete="phone"
                  error={Boolean(errors.phoneNumber)}
                  helperText={errors.phoneNumber}
                  value= {formData.phoneNumber}
                  onChange={e=>updateFormData({phoneNumber: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="dateOfBirth"
                  label="Date of Birth"
                  name="dateOfBirth"
                  autoComplete="bday"
                  error={Boolean(errors.dateOfBirth)}
                  helperText={errors.dateOfBirth}
                  placeholder="00/00/0000" 
                  value= {formData.dateOfBirth}
                  onChange={e=>updateFormData({dateOfBirth: e.target.value})}

                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="companyName"
                  label="Company Name"
                  name="companyName"
                  autoComplete="organization"
                  error={Boolean(errors.companyName)}
                  helperText={errors.companyName}
                  value= {formData.companyName}
                  onChange={e=>updateFormData({companyName: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="role">Role</InputLabel>
                  <Select
                    labelId="role"
                    id="role"
                    value={formData.role}
                    label="Role"
                    name='role'
                    error={Boolean(errors.role)}
                    onChange={handleRoleChange}
                  >
                    <MenuItem value="worker">Worker</MenuItem>
                    <MenuItem value="recruiter">Recruiter</MenuItem>
                    <MenuItem value="hr_manager">HR Manager</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  error={Boolean(errors.email)}
                  helperText={errors.email}
                  value= {formData.email}
                  onChange={e=>updateFormData({email: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  error={Boolean(errors.password)}
                  helperText={errors.password}
                  value= {formData.password}
                  onChange={e=>updateFormData({password: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  error={Boolean(errors.confirmPassword)}
                  helperText={errors.confirmPassword}
                  value= {formData.confirmPassword}
                  onChange={e=>updateFormData({confirmPassword: e.target.value})}
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
