import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/en-gb'; 
import { IntlProvider } from 'react-intl';
import SignIn from './pages/signin/SignIn';
import SignUp from './pages/signup/SignUp';
import HomePage from './pages/home/HomePage';
import LoadingPage from './pages/home/LoadingPage';
import ErrorPage from './pages/home/ErrorPage';

const queryClient = new QueryClient();

dayjs.locale('en-gb');

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/sign-up', element: <SignUp /> },
  { path: '/sign-in', element: <SignIn /> },
  { path: '/loading', element: <LoadingPage /> },
  { path: '/error', element: <ErrorPage /> },
]);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
        <IntlProvider locale="en-GB">
          <RouterProvider router={router} />
        </IntlProvider>
      </LocalizationProvider>
    </QueryClientProvider>
  );
};

export default App;
