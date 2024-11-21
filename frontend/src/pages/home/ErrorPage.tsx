import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useNavigate , useRouteError} from 'react-router-dom';

const ErrorPage: React.FC = () => {
    const navigate = useNavigate();
    const error = useRouteError();
    console.error(error);

    return (
        <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
            <Typography variant="h4" color="error">An error occurred</Typography>
            <Typography variant="body1" style={{ marginTop: 8 }}>We couldn’t load the requested page.</Typography>
            <Button variant="contained" color="primary" onClick={() => navigate('/sign-in') } style={{ marginTop: 16 }}>
                Go Back
            </Button>
        </Box>
    );
};

export default ErrorPage;
