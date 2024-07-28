import React from 'react';
import { Container, Typography, Grid, Paper } from '@mui/material';

const HomePage: React.FC = () => {
  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Events here
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} style={{ padding: '16px', textAlign: 'center' }}>
            <Typography variant="h6">Worker Management</Typography>
            <Typography>Manage all workers and their assignments.</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <Paper elevation={3} style={{ padding: '16px', textAlign: 'center' }}>
            <Typography variant="h6">Job Listings</Typography>
            <Typography>Create and manage job listings.</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
