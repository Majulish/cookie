import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import {RouterProvider, createBrowserRouter} from 'react-router-dom'
import HomePage from './pages/HomePage';

const router = createBrowserRouter([

  {path: '/' , element: <App/>},
  {path: '/sign-up', element: <SignUp/>},
  {path: '/home-page', element: <HomePage/>}
  /*
  {path: '/' ,
  element: <RootLayout/> , 
  children: [
    {path: '/' ,
    element: <Posts/> , 
    loader: () => {} ,
    children: [
    {path: '/create-post', element: <NewPost/>, action: newPostAction}
    ]},
    
  ]},
  */
]);

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <RouterProvider router = {router}/>
            </ThemeProvider>
    </React.StrictMode>
);