import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import SignIn from './pages/signin/SignIn';
import SignUp from './pages/signup/SignUp';
import HomePage from './pages/home/HomePage';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {path: '/',element: <HomePage />},
  { path: '/sign-up', element: <SignUp /> },
  { path: '/sign-in', element: <SignIn /> },
]);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;
