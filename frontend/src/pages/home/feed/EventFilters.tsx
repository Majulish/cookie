import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Stack,
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

const ITEM_HEIGHT = 56; // Increased from 48
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 280, // Increased from 250
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
                mb: 4.5, // Increased from 4
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
                overflow: 'hidden'
            }}
        >
            <Box 
                sx={{ 
                    px: 3.5, // Increased from 3
                    py: 2.5, // Increased from 2
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
                            mr: 1.8, // Increased from 1.5
                            color: 'primary.main',
                            fontSize: '1.5rem' // Increased icon size
                        }} 
                    />
                    <Typography 
                        variant="h6" // Upgraded from subtitle1
                        fontWeight={600}
                        sx={{ fontSize: '1.3rem' }}
                    >
                        Filter Events
                    </Typography>
                    
                    {hasActiveFilters && (
                        <Chip 
                            label={`${selectedCities.length + selectedJobs.length} active`}
                            size="medium" // Changed from small to medium
                            color="primary"
                            sx={{ 
                                ml: 1.8, // Increased from 1.5
                                fontSize: '0.95rem', // Larger text
                                height: '32px' // Taller chip
                            }}
                        />
                    )}
                </Box>
                
                <Box>
                    {hasActiveFilters && (
                        <Tooltip title="Clear all filters">
                            <IconButton 
                                size="medium" // Changed from small to medium
                                onClick={handleClear}
                                sx={{ mr: 1.5 }} // Increased from 1
                            >
                                <ClearIcon sx={{ fontSize: '1.3rem' }} /> {/* Increased icon size */}
                            </IconButton>
                        </Tooltip>
                    )}
                    
                    <IconButton
                        onClick={() => setExpanded(!expanded)}
                        size="medium" // Changed from small to medium
                    >
                        {expanded ? (
                            <ExpandLessIcon sx={{ fontSize: '1.3rem' }} /> // Increased icon size
                        ) : (
                            <ExpandMoreIcon sx={{ fontSize: '1.3rem' }} /> // Increased icon size
                        )}
                    </IconButton>
                </Box>
            </Box>
            
            <Collapse in={expanded}>
                <Box sx={{ p: 3.5 }}> {/* Increased from 3 */}
                    <Grid container spacing={3.5}> {/* Increased from 3 */}
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.8 }}> {/* Increased from 1.5 */}
                                <LocationOnIcon 
                                    sx={{ 
                                        color: 'primary.main',
                                        mr: 1.3, // Increased from 1
                                        fontSize: '1.35rem' // Increased from 1.1rem
                                    }} 
                                />
                                <Typography 
                                    variant="subtitle1" // Upgraded from subtitle2
                                    sx={{ fontSize: '1.1rem', fontWeight: 500 }}
                                >
                                    Locations
                                </Typography>
                            </Box>
                            
                            <FormControl fullWidth size="medium"> {/* Changed from small to medium */}
                                <Select
                                    multiple
                                    value={selectedCities}
                                    onChange={handleCityChange}
                                    input={<OutlinedInput placeholder="Select cities" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}> {/* Increased from 0.5 */}
                                            {selected.length === 0 ? (
                                                <Typography 
                                                    variant="body1" // Upgraded from body2
                                                    color="text.secondary"
                                                    sx={{ fontSize: '1.05rem' }}
                                                >
                                                    Select cities...
                                                </Typography>
                                            ) : (
                                                selected.map((value) => (
                                                    <Chip 
                                                        key={value} 
                                                        label={value} 
                                                        size="medium" // Changed from small to medium
                                                        sx={{ 
                                                            fontSize: '0.95rem', // Larger text
                                                            height: '32px' // Taller chip
                                                        }}
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
                                            py: 1.8, // Increased padding
                                            fontSize: '1.05rem' // Larger text
                                        }
                                    }}
                                >
                                    {cities.map((city) => (
                                        <MenuItem 
                                            key={city} 
                                            value={city}
                                            sx={{ fontSize: '1.05rem' }} // Larger text
                                        >
                                            {city}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.8 }}> {/* Increased from 1.5 */}
                                <WorkOutlineIcon 
                                    sx={{ 
                                        color: 'primary.main',
                                        mr: 1.3, // Increased from 1
                                        fontSize: '1.35rem' // Increased from 1.1rem
                                    }} 
                                />
                                <Typography 
                                    variant="subtitle1" // Upgraded from subtitle2
                                    sx={{ fontSize: '1.1rem', fontWeight: 500 }}
                                >
                                    Job Positions
                                </Typography>
                            </Box>
                            
                            <FormControl fullWidth size="medium"> {/* Changed from small to medium */}
                                <Select
                                    multiple
                                    value={selectedJobs}
                                    onChange={handleJobChange}
                                    input={<OutlinedInput placeholder="Select job positions" />}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8 }}> {/* Increased from 0.5 */}
                                            {selected.length === 0 ? (
                                                <Typography 
                                                    variant="body1" // Upgraded from body2
                                                    color="text.secondary"
                                                    sx={{ fontSize: '1.05rem' }}
                                                >
                                                    Select positions...
                                                </Typography>
                                            ) : (
                                                selected.map((value) => (
                                                    <Chip 
                                                        key={value} 
                                                        label={value} 
                                                        size="medium" // Changed from small to medium
                                                        sx={{ 
                                                            fontSize: '0.95rem', // Larger text
                                                            height: '32px' // Taller chip
                                                        }}
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
                                            py: 1.8, // Increased padding
                                            fontSize: '1.05rem' // Larger text
                                        }
                                    }}
                                >
                                    {jobs.map((job) => (
                                        <MenuItem 
                                            key={job} 
                                            value={job}
                                            sx={{ fontSize: '1.05rem' }} // Larger text
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
                                mt: 2.5 // Increased from 2
                            }}
                        >
                            <Button
                                variant="outlined"
                                size="medium" // Changed from small to medium
                                startIcon={<ClearIcon />}
                                onClick={handleClear}
                                sx={{ 
                                    py: 1, // Added vertical padding
                                    px: 2, // Added horizontal padding
                                    fontSize: '1rem' // Larger text
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
                        px: 3.5, // Increased from 3
                        py: 1.8, // Increased from 1.5
                        display: 'flex', 
                        flexWrap: 'wrap', 
                        gap: 1.3 // Increased from 1
                    }}
                >
                    {selectedCities.map(city => (
                        <Chip
                            key={`city-${city}`}
                            label={city}
                            size="medium" // Changed from small to medium
                            onDelete={() => handleRemoveCity(city)}
                            deleteIcon={<ClearIcon sx={{ fontSize: '1.2rem' }} />} // Larger icon
                            sx={{ 
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                fontSize: '0.95rem', // Larger text
                                height: '32px', // Taller chip
                                '& .MuiChip-label': {
                                    px: 1.5 // More horizontal padding
                                }
                            }}
                        />
                    ))}
                    
                    {selectedJobs.map(job => (
                        <Chip
                            key={`job-${job}`}
                            label={job}
                            size="medium" // Changed from small to medium
                            onDelete={() => handleRemoveJob(job)}
                            deleteIcon={<ClearIcon sx={{ fontSize: '1.2rem' }} />} // Larger icon
                            sx={{ 
                                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                fontSize: '0.95rem', // Larger text
                                height: '32px', // Taller chip
                                '& .MuiChip-label': {
                                    px: 1.5 // More horizontal padding
                                }
                            }}
                        />
                    ))}
                </Box>
            )}
        </Paper>
    );
};

export default EventFilters;