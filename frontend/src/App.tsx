import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import SignIn from './pages/signin/SignIn';
import SignUp from './pages/signup/SignUp';
import HomePage from './pages/home/HomePage';
import LoadingPage from './pages/home/LoadingPage';
import ErrorPage from './pages/home/ErrorPage';
import EventPage from './pages/event_page/EventPage';
import FeedPage from './pages/home/feed/feedPage';

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/sign-up', element: <SignUp /> },
  { path: '/sign-in', element: <SignIn /> },
  { path: '/loading', element: <LoadingPage /> },
  { path: '/error', element: <ErrorPage /> },
  { path: '/event-page/:eventId', element: <EventPage /> },
  {path: '/feed', element: <FeedPage/>}
]);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;