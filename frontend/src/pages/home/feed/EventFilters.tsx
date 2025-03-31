import React from 'react';
import {
    Box,
    FormControl,
    Select,
    MenuItem,
    Button,
    Chip,
    OutlinedInput,
    SelectChangeEvent,
    Typography,
    Paper,
    useTheme,
    alpha,
    Collapse,
    IconButton,
    Tooltip,
    Grid
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { MyEventScheme } from '../create_event/eventScheme';

interface EventFiltersProps {
    events: MyEventScheme[];
    onFilterChange: (cities: string[], jobTitles: string[]) => void;
}

const ITEM_HEIGHT = 48; // Reduced from 56
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250, // Reduced from 280
        },
        elevation: 3,
    },
    anchorOrigin: {
        vertical: 'bottom' as const,
        horizontal: 'left' as const,
    },
};

const EventFilters: React.FC<EventFiltersProps> = ({ events, onFilterChange }) => {
    const theme = useTheme();
    const [selectedCities, setSelectedCities] = React.useState<string[]>([]);
    const [selectedJobs, setSelectedJobs] = React.useState<string[]>([]);
    const [expanded, setExpanded] = React.useState(true);

    // Get unique cities and jobs from events
    const cities = React.useMemo(() => {
        const uniqueCities = new Set(events.map(event => event.city));
        return Array.from(uniqueCities).sort();
    }, [events]);

    const jobs = React.useMemo(() => {
        const uniqueJobs = new Set(
            events.flatMap(event => event.jobs.map(job => job.job_title))
        );
        return Array.from(uniqueJobs).sort();
    }, [events]);

    const handleCityChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        const newSelectedCities = typeof value === 'string' ? value.split(',') : value;
        setSelectedCities(newSelectedCities);
        onFilterChange(newSelectedCities, selectedJobs);
    };

    const handleJobChange = (event: SelectChangeEvent<string[]>) => {
        const value = event.target.value;
        const newSelectedJobs = typeof value === 'string' ? value.split(',') : value;
        setSelectedJobs(newSelectedJobs);
        onFilterChange(selectedCities, newSelectedJobs);
    };

    const handleClear = () => {
        setSelectedCities([]);
        setSelectedJobs([]);
        onFilterChange([], []);
    };

    const handleRemoveCity = (cityToRemove: string) => {
        const updatedCities = selectedCities.filter(city => city !== cityToRemove);
        setSelectedCities(updatedCities);
        onFilterChange(updatedCities, selectedJobs);
    };

    const handleRemoveJob = (jobToRemove: string) => {
        const updatedJobs = selectedJobs.filter(job => job !== jobToRemove);
        setSelectedJobs(updatedJobs);
        onFilterChange(selectedCities, updatedJobs);
    };

    const hasActiveFilters = selectedCities.length > 0 || selectedJobs.length > 0;

    return (
        <Paper 
            elevation={0}
            sx={{ 
                mb: 3, // Reduced from 4.5
                borderRadius: 1, // Reduced from 2
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
            }}
        >
            <Box 
                sx={{ 
                    px: 2.5, // Reduced from 3.5
                    py: 1.5, // Reduced from 2.5
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    bgcolor: alpha(theme.palette.primary.main, 0.05),
                    borderBottom: hasActiveFilters || expanded ? '1px solid' : 'none',
                    borderColor: 'divider'
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FilterAltIcon 
                        sx={{ 
                            mr: 1.5, 
                            color: 'primary.main',
                            fontSize: '1.2rem' // Reduced from 1.7rem
                        }} 
                    />
                    <Typography 
                        variant="subtitle1" // Changed from h6 to subtitle1
                        fontWeight={600}
                        sx={{ fontSize: '1rem' }} // Reduced from 1.7rem
                    >
                        Filter Events
                    </Typography>
                    
                    {hasActiveFilters && (
                        <Chip 
                            label={`${selectedCities.length + selectedJobs.length} active`}
                            size="small" // Changed from medium to small
                            color="primary"
                            sx={{ 
                                ml: 1.5, 
                                fontSize: '0.75rem', // Reduced from 1.2rem
                            }}
                        />
                    )}
                </Box>
                
                <Box>
                    {hasActiveFilters && (
                        <Tooltip title="Clear all filters">
                            <IconButton 
                                size="small" 
                                onClick={handleClear}
                                sx={{ mr: 1 }} 
                            >
                                <ClearIcon sx={{ fontSize: '1rem' }} /> 
                            </IconButton>
                        </Tooltip>
                    )}
                    
                    <IconButton
                        onClick={() => setExpanded(!expanded)}
                        size="small" 
                    >
                        {expanded ? (
                            <ExpandLessIcon sx={{ fontSize: '1rem' }} /> 
                        ) : (
                            <ExpandMoreIcon sx={{ fontSize: '1rem' }} />
                        )}
                    </IconButton>
                </Box>
            </Box>
            
            <Collapse in={expanded}>
                <Box sx={{ p: 2.5 }}> {/* Reduced from 3.5 */}
                    <Grid container spacing={2}> {/* Reduced from 3.5 */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> 
                                <LocationOnIcon 
                                    sx={{ 
                                        color: 'primary.main',
                                        mr: 1, 
                                        fontSize: '1rem' // Reduced from 1.5rem
                                    }} 
                                />
                                <Typography 
                                    variant="subtitle2" // Changed from subtitle1 to subtitle2
                                    sx={{ fontSize: '0.875rem', fontWeight: 500 }} // Reduced from 1.3rem
                                >
                                    Locations
                                </Typography>
                            </Box>
                            
                            <FormControl fullWidth size="small"> 
                                <Select
                                    multiple
                                    value={selectedCities}
                                    onChange={handleCityChange}
                                    input={<OutlinedInput placeholder="Select cities" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}> 
                                            {selected.length === 0 ? (
                                                <Typography 
                                                    variant="body2" // Changed from body1 to body2
                                                    color="text.secondary"
                                                    sx={{ fontSize: '0.75rem' }} // Reduced from 1.2rem
                                                >
                                                    Select cities...
                                                </Typography>
                                            ) : (
                                                selected.map((value) => (
                                                    <Chip 
                                                        key={value} 
                                                        label={value} 
                                                        size="small" 
                                                        sx={{ fontSize: '0.75rem' }}
                                                        onDelete={() => handleRemoveCity(value)}
                                                        onMouseDown={(event) => {
                                                            event.stopPropagation();
                                                        }}
                                                    />
                                                ))
                                            )}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: selectedCities.length > 0 ? 'primary.light' : 'inherit'
                                        },
                                        '& .MuiSelect-select': { 
                                            fontSize: '0.875rem' // Reduced from 1.2rem
                                        }
                                    }}
                                >
                                    {cities.map((city) => (
                                        <MenuItem 
                                            key={city} 
                                            value={city}
                                            sx={{ fontSize: '0.875rem' }} // Reduced from 1.2rem
                                        >
                                            {city}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}> 
                                <WorkOutlineIcon 
                                    sx={{ 
                                        color: 'primary.main',
                                        mr: 1, 
                                        fontSize: '1rem' // Reduced from 1.5rem
                                    }} 
                                />
                                <Typography 
                                    variant="subtitle2" // Changed from subtitle1 to subtitle2
                                    sx={{ fontSize: '0.875rem', fontWeight: 500 }} // Reduced from 1.3rem
                                >
                                    Job Positions
                                </Typography>
                            </Box>
                            
                            <FormControl fullWidth size="small"> 
                                <Select
                                    multiple
                                    value={selectedJobs}
                                    onChange={handleJobChange}
                                    input={<OutlinedInput placeholder="Select job positions" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}> 
                                            {selected.length === 0 ? (
                                                <Typography 
                                                    variant="body2" // Changed from body1 to body2
                                                    color="text.secondary"
                                                    sx={{ fontSize: '0.75rem' }} // Reduced from 1.2rem
                                                >
                                                    Select positions...
                                                </Typography>
                                            ) : (
                                                selected.map((value) => (
                                                    <Chip 
                                                        key={value} 
                                                        label={value} 
                                                        size="small" 
                                                        sx={{ fontSize: '0.75rem' }}
                                                        onDelete={() => handleRemoveJob(value)}
                                                        onMouseDown={(event) => {
                                                            event.stopPropagation();
                                                        }}
                                                    />
                                                ))
                                            )}
                                        </Box>
                                    )}
                                    MenuProps={MenuProps}
                                    sx={{
                                        '& .MuiOutlinedInput-notchedOutline': {
                                            borderColor: selectedJobs.length > 0 ? 'primary.light' : 'inherit'
                                        },
                                        '& .MuiSelect-select': { 
                                            fontSize: '0.875rem' // Reduced from 1.2rem
                                        }
                                    }}
                                >
                                    {jobs.map((job) => (
                                        <MenuItem 
                                            key={job} 
                                            value={job}
                                            sx={{ fontSize: '0.875rem' }} // Reduced from 1.2rem
                                        >
                                            {job}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    
                    {hasActiveFilters && (
                        <Box 
                            sx={{ 
                                display: 'flex', 
                                justifyContent: 'flex-end',
                                mt: 2
                            }}
                        >
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ClearIcon />}
                                onClick={handleClear}
                                sx={{ 
                                    fontSize: '0.875rem' // Reduced from 1.2rem
                                }}
                            >
                                Clear All Filters
                            </Button>
                        </Box>
                    )}
                </Box>
            </Collapse>
            
            {hasActiveFilters && !expanded && (
                <Box 
                    sx={{ 
                        px: 2.5, // Reduced from 3.5
                        py: 1, // Reduced from 1.8
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 0.8 // Reduced from 1.3
                    }}
                >
                    {selectedCities.map(city => (
                        <Chip
                            key={`city-${city}`}
                            label={city}
                            size="small"
                            onDelete={() => handleRemoveCity(city)}
                            deleteIcon={<ClearIcon sx={{ fontSize: '0.75rem' }} />}
                            sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                fontSize: '0.75rem', // Reduced from 1.2rem
                            }}
                        />
                    ))}
                    
                    {selectedJobs.map(job => (
                        <Chip
                            key={`job-${job}`}
                            label={job}
                            size="small"
                            onDelete={() => handleRemoveJob(job)}
                            deleteIcon={<ClearIcon sx={{ fontSize: '0.75rem' }} />}
                            sx={{ 
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                fontSize: '0.75rem', // Reduced from 1.2rem
                            }}
                        />
                    ))}
                </Box>
            )}
        </Paper>
    );
};

export default EventFilters;