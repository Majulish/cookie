import React from 'react';
import { RouterProvider, createBrowserRouter, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import SignIn from './pages/signin/SignIn';
import SignUp from './pages/signup/SignUp';
import HomePage from './pages/home/HomePage';
import LoadingPage from './pages/home/LoadingPage';
import ErrorPage from './pages/home/ErrorPage';
import EventPage from './pages/event_page/EventPage';
import FeedPage from './pages/home/feed/FeedPage';
import EventCalendarPage from './pages/calender/EventCalendarPage';
import Layout from './components/Layout';
import ProfilePage from './pages/profile/ProfilePage';

const queryClient = new QueryClient();

// Layout wrapper to use with routes that should have the common layout
const LayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
);

const router = createBrowserRouter([
  {
    element: <LayoutWrapper />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/event-page/:eventId', element: <EventPage /> },
      { path: '/feed', element: <FeedPage /> },
      { path: '/calendar', element: <EventCalendarPage /> },
      { path: '/profile/:userId', element: <ProfilePage/>}
      // Add other pages that should use the layout here
    ],
  },
  // Pages without the layout
  { path: '/sign-up', element: <SignUp /> },
  { path: '/sign-in', element: <SignIn /> },
  { path: '/loading', element: <LoadingPage /> },
  { path: '/error', element: <ErrorPage /> },
]);

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export default App;