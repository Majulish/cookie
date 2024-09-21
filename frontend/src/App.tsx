import React from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import SignIn from './pages/signin/SignIn';
import SignUp from './pages/signup/SignUp';
import HomePage from './pages/home/HomePage';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {path: '/',element: <HomePage />},
  { path: '/sign-up', element: <SignUp /> },
  { path: '/sign-in', element: <SignIn /> },
]);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;