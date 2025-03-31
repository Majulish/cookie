import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProfile, ProfileData, Review } from '../../api/profileApi';
import useUserRole from '../../pages/home/hooks/useUserRole';

// MUI components
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  Grid,
  Paper,
  Rating,
  Skeleton,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  Chip,
  alpha
} from '@mui/material';
// MUI icons
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  LocationCity as LocationCityIcon,
  Cake as CakeIcon,
  EventNote as EventNoteIcon,
  FormatQuote as FormatQuoteIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';

// Define correct type for useParams
type ProfileParams = {
  userId?: string;
};

const ProfilePage: React.FC = () => {
  const params = useParams<ProfileParams>();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const userRole = useUserRole();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        // Determine the userId to fetch
        let profileId: number = 0; // Default to current user (id=0)
        
        // Check if we're on /profile/:userId route
        if (params.userId) {
          profileId = parseInt(params.userId, 10);
        } else if (location.pathname === '/profile') {
          // We're on the /profile route, use id=0 (current user)
          profileId = 0;
        }
        
        // Check access rights specifically for profile/0 (current user profile)
        if (profileId === 0 && userRole !== 'worker') {
          setError('Access denied: Only workers can view their own profile');
          setLoading(false);
          return;
        }
        
        console.log('Fetching profile with ID:', profileId);
        const profileData = await getProfile(profileId);
        setProfile(profileData);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load profile';
        setError(errorMessage);
        console.error('Error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.userId, location.pathname, userRole]);

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: alpha(theme.palette.error.light, 0.1),
            borderLeft: `4px solid ${theme.palette.error.main}`
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Error Loading Profile
          </Typography>
          <Typography>{error}</Typography>
        </Paper>
      </Container>
    );
  }

  if (!profile) {
    return null;
  }

  // Format the initials for the avatar
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate a color based on the user's name for the avatar
  const stringToColor = (string: string): string => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    return color;
  };

  // Format date for reviews
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box sx={{ 
      py: 4, 
      background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.light, 0.15)}, ${alpha(theme.palette.background.default, 0.9)} 500px)`,
      minHeight: '100vh'
    }}>
      <Container maxWidth="md">
        <Paper 
          elevation={4} 
          sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.dark, 0.15)}`
          }}
        >
          {/* Header background */}
          <Box 
            sx={{ 
              height: 150, 
              background: `linear-gradient(120deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
              position: 'relative'
            }} 
          />

          <Box sx={{ px: { xs: 2, sm: 4 }, pb: 4, mt: -8 }}>
            {/* Profile header with avatar */}
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: 42,
                    bgcolor: stringToColor(profile.full_name),
                    border: `5px solid ${theme.palette.background.paper}`,
                    boxShadow: `0 4px 12px ${alpha('#000', 0.2)}`
                  }}
                >
                  {getInitials(profile.full_name)}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Box sx={{ pl: { xs: 0, sm: 2 } }}>
                  <Typography 
                    variant="h4" 
                    component="h1" 
                    sx={{ 
                      mt: 2,
                      fontWeight: 700,
                      color: theme.palette.text.primary
                    }}
                  >
                    {profile.full_name}
                  </Typography>
                  <Stack 
                    direction={isMobile ? "column" : "row"} 
                    spacing={1}
                    alignItems={isMobile ? "flex-start" : "center"}
                  >
                    <Rating 
                      value={profile.rating} 
                      precision={0.5} 
                      readOnly 
                      size="large"
                    />
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      fontWeight="medium"
                    >
                      {profile.rating.toFixed(1)} • {profile.reviews.length} reviews
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            {/* Contact and personal information */}
            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} md={6}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    backgroundColor: alpha(theme.palette.primary.light, 0.05),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.light, 0.1),
                      transform: 'translateY(-4px)',
                      boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.1)}`
                    }
                  }}
                >
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        color: theme.palette.primary.dark,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      Contact Information
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.primary.main, 0.2) }} />
                    
                    <Stack spacing={2.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.dark
                          }}
                        >
                          <EmailIcon />
                        </Avatar>
                        <Typography sx={{ fontSize: '1.05rem' }}>{profile.email}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.dark
                          }}
                        >
                          <PhoneIcon />
                        </Avatar>
                        <Typography sx={{ fontSize: '1.05rem' }}>{profile.phone}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card 
                  variant="outlined" 
                  sx={{ 
                    height: '100%',
                    backgroundColor: alpha(theme.palette.secondary.light, 0.07),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.secondary.light, 0.12),
                      transform: 'translateY(-4px)',
                      boxShadow: `0 6px 12px ${alpha(theme.palette.secondary.main, 0.1)}`
                    }
                  }}
                >
                  <CardContent>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        color: theme.palette.secondary.dark,
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      Personal Information
                    </Typography>
                    <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.secondary.main, 0.2) }} />
                    
                    <Stack spacing={2.5}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.dark
                          }}
                        >
                          <CakeIcon />
                        </Avatar>
                        <Typography sx={{ fontSize: '1.05rem' }}>{profile.age} years old</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.dark
                          }}
                        >
                          <LocationCityIcon />
                        </Avatar>
                        <Typography sx={{ fontSize: '1.05rem' }}>{profile.city}</Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            mr: 2, 
                            bgcolor: alpha(theme.palette.secondary.main, 0.1),
                            color: theme.palette.secondary.dark
                          }}
                        >
                          <BusinessIcon />
                        </Avatar>
                        <Typography sx={{ fontSize: '1.05rem' }}>{profile.company_name}</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* HR Manager Information - Only display if HR manager info exists */}
              {(profile.hr_manager_name || profile.hr_manager_phone) && (
                <Grid item xs={12}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      backgroundColor: alpha(theme.palette.info.light, 0.05),
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.info.light, 0.1),
                        transform: 'translateY(-4px)',
                        boxShadow: `0 6px 12px ${alpha(theme.palette.info.main, 0.1)}`
                      }
                    }}
                  >
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ 
                          color: theme.palette.info.dark,
                          fontWeight: 600
                        }}
                      >
                        HR Manager Contact
                      </Typography>
                      <Divider sx={{ mb: 2, borderColor: alpha(theme.palette.info.main, 0.2) }} />
                      
                      <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }}>
                        {profile.hr_manager_name && (
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Avatar 
                              sx={{ 
                                mr: 2, 
                                bgcolor: alpha(theme.palette.info.main, 0.2),
                                color: theme.palette.info.dark
                              }}
                            >
                              {profile.hr_manager_name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography sx={{ fontSize: '1.05rem' }}>{profile.hr_manager_name}</Typography>
                          </Box>
                        )}
                        
                        {profile.hr_manager_phone && (
                          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                            <Avatar 
                              sx={{ 
                                mr: 2, 
                                bgcolor: alpha(theme.palette.info.main, 0.2),
                                color: theme.palette.info.dark
                              }}
                            >
                              <PhoneIcon />
                            </Avatar>
                            <Typography sx={{ fontSize: '1.05rem' }}>{profile.hr_manager_phone}</Typography>
                          </Box>
                        )}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>

            {/* Reviews Section - ENHANCED */}
            <Box sx={{ mt: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                backgroundColor: alpha(theme.palette.primary.light, 0.08),
                borderRadius: 1.5,
                p: 1.5,
                pl: 2
              }}>
                <Typography 
                  variant="h6" 
                  component="h2" 
                  sx={{ 
                    fontWeight: 700,
                    color: theme.palette.primary.dark
                  }}
                >
                  Reviews
                </Typography>
                <Chip 
                  label={profile.reviews.length} 
                  size="medium" 
                  color="primary" 
                  sx={{ 
                    ml: 1.5, 
                    fontWeight: 'bold',
                    minWidth: 32
                  }}
                />
              </Box>
              
              {profile.reviews.length === 0 ? (
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    bgcolor: alpha(theme.palette.grey[200], 0.5),
                    borderRadius: 2
                  }}
                >
                  <Typography 
                    color="text.secondary"
                    sx={{ fontSize: '1.1rem' }}
                  >
                    No reviews available yet.
                  </Typography>
                </Paper>
              ) : (
                <Card 
                  variant="outlined"
                  sx={{ 
                    borderRadius: 2,
                    boxShadow: `0 4px 12px ${alpha(theme.palette.grey[500], 0.1)}`,
                    backgroundColor: alpha(theme.palette.background.paper, 0.9)
                  }}
                >
                  {profile.reviews.map((review: Review, index: number) => (
                    <React.Fragment key={`${review.event_id}-${index}`}>
                      {index > 0 && (
                        <Divider sx={{ mx: 3 }} />
                      )}
                      <Box 
                        sx={{ 
                          p: 0,
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.light, 0.03)
                          }
                        }}
                      >
                        {/* Review Section */}
                        <Box sx={{ 
                          p: 3,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2
                        }}>
                          {/* Reviewer Info & Metadata */}
                          <Box sx={{ 
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            justifyContent: 'space-between',
                            gap: 1
                          }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  bgcolor: stringToColor(review.reviewer_name),
                                  mr: 1.5,
                                  width: 40,
                                  height: 40,
                                  boxShadow: `0 2px 8px ${alpha('#000', 0.15)}`
                                }}
                              >
                                {review.reviewer_name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography 
                                variant="subtitle1" 
                                fontWeight="bold"
                                sx={{ fontSize: '1.1rem' }}
                              >
                                {review.reviewer_name}
                              </Typography>
                            </Box>
                            
                            <Stack 
                              direction={{ xs: 'column', sm: 'row' }} 
                              spacing={2}
                              alignItems={{ xs: 'flex-start', sm: 'center' }}
                              sx={{ 
                                mt: { xs: 0.5, sm: 0 },
                                p: 1,
                                borderRadius: 1,
                                backgroundColor: alpha(theme.palette.grey[100], 0.7)
                              }}
                            >
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EventNoteIcon 
                                  fontSize="small" 
                                  sx={{ 
                                    mr: 0.8, 
                                    color: theme.palette.primary.main 
                                  }} 
                                />
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.primary.main
                                  }}
                                >
                                  {review.event_name}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarMonthIcon 
                                  fontSize="small" 
                                  sx={{ 
                                    mr: 0.8, 
                                    color: theme.palette.text.secondary 
                                  }} 
                                />
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary"
                                  fontWeight="medium"
                                >
                                  {formatDate(review.timestamp)}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                          
                          {/* Review Content */}
                          <Box 
                            sx={{ 
                              pl: { xs: 0, sm: 7 }, 
                              position: 'relative', 
                              mt: 0.5,
                              backgroundColor: alpha(theme.palette.grey[50], 0.5),
                              p: 2.5,
                              borderRadius: 2,
                              borderLeft: `4px solid ${alpha(theme.palette.primary.light, 0.4)}`
                            }}
                          >
                            <FormatQuoteIcon 
                              sx={{ 
                                position: 'absolute', 
                                top: 10, 
                                left: { xs: 10, sm: 16 }, 
                                fontSize: '1.5rem',
                                color: alpha(theme.palette.primary.main, 0.15),
                                zIndex: 0
                              }} 
                            />
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                position: 'relative',
                                zIndex: 1,
                                pl: { xs: 4, sm: 4 },
                                fontStyle: 'italic',
                                color: theme.palette.text.primary,
                                fontSize: '1.05rem',
                                lineHeight: 1.6
                              }}
                            >
                              {review.review_text}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </React.Fragment>
                  ))}
                </Card>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

// Loading skeleton
const ProfileSkeleton: React.FC = () => {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      py: 4, 
      background: `linear-gradient(to bottom, ${alpha(theme.palette.primary.light, 0.15)}, ${alpha(theme.palette.background.default, 0.9)} 500px)`,
      minHeight: '100vh'
    }}>
      <Container maxWidth="md">
        <Paper elevation={4} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ height: 150, background: `linear-gradient(120deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})` }} />
          
          <Box sx={{ px: { xs: 2, sm: 4 }, pb: 4, mt: -8 }}>
            <Grid container spacing={2} alignItems="flex-end">
              <Grid item>
                <Skeleton variant="circular" width={120} height={120} />
              </Grid>
              <Grid item xs>
                <Box sx={{ pl: { xs: 0, sm: 2 } }}>
                  <Skeleton variant="text" width="60%" height={48} sx={{ mt: 2 }} />
                  <Skeleton variant="text" width="40%" height={28} />
                </Box>
              </Grid>
            </Grid>

            <Grid container spacing={3} sx={{ mt: 3 }}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', backgroundColor: alpha(theme.palette.primary.light, 0.05) }}>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={35} />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="70%" />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', backgroundColor: alpha(theme.palette.secondary.light, 0.07) }}>
                  <CardContent>
                    <Skeleton variant="text" width="60%" height={35} />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="100%" />
                    <Skeleton variant="text" width="70%" />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 4 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 2,
                backgroundColor: alpha(theme.palette.primary.light, 0.08),
                borderRadius: 1.5,
                p: 1.5
              }}>
                <Skeleton variant="text" width="30%" height={35} />
              </Box>
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2, mt: 2 }} />
              <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2, mt: 2 }} />
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProfilePage;