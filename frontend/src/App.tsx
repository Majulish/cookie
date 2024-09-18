import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import SignIn from './pages/sign in/SignIn';
//import SignUp from './pages/sign up/SignUp';
import HomePage from './pages/home/HomePage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
 // { path: '/sign-up', element: <SignUp /> },
  { path: '/sign-in', element: <SignIn /> },
]);

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};

export default App;