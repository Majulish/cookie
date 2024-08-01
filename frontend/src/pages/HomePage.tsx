import React from 'react';
import {Container, Typography, Grid, Paper, useMediaQuery, useTheme} from '@mui/material';
import ResponsiveTabs from '../components/ResponsiveTabs';
import SideTab from '../components/SideTab';

const HomePage: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <Container style={{paddingTop: isMobile ? '56px' : '64px', paddingBottom: isMobile ? '56px' : '0px'}}>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    {isMobile ? (
                        <div style={{position: 'fixed', bottom: 0, width: '100%'}}>
                            <ResponsiveTabs/>
                        </div>
                    ) : (
                        <div style={{position: 'fixed', top: 0, width: '100%'}}>
                            <ResponsiveTabs/>
                        </div>
                    )}
                </Grid>

                {/* Notification Bell Placeholder */}
                <Grid item xs={12} style={{textAlign: 'right'}}>
                    <div>
                        <Typography variant="h6">🔔 Notification Bell</Typography>
                    </div>
                </Grid>

                {/* Main Content */}
                <Grid item xs={12} md={8}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Events here
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6} md={6}>
                            <Paper elevation={3} style={{padding: '16px', textAlign: 'center'}}>
                                <Typography variant="h6">title of block</Typography>
                                <Typography>This is the content of the text block</Typography>
                            </Paper>
                        </Grid>
                        {/* Add more event items here */}
                    </Grid>
                </Grid>


                {/* SideTab */}
                <Grid item xs={12} md={4}>
                    <div style={{position: 'fixed', right: 0}}>
                        <SideTab/>
                    </div>
                </Grid>
            </Grid>
        </Container>
    );
};

export default HomePage;
