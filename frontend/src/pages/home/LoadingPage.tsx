import React from 'react';
import { CircularProgress, Typography, Box } from '@mui/material';

const LoadingPage: React.FC = () => (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
        <CircularProgress />
        <Typography variant="h6" style={{ marginTop: 16 }}>Loading...</Typography>
    </Box>
);

export default LoadingPage;
