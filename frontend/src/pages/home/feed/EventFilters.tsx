import React from 'react';
import {
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Stack,
    SelectChangeEvent
} from '@mui/material';
import { MyEventScheme } from '../create_event/eventScheme';

interface EventFiltersProps {
    events: MyEventScheme[];
    onFilterChange: (location: string, jobTitle: string) => void;
}

const EventFilters: React.FC<EventFiltersProps> = ({ events, onFilterChange }) => {
    const [selectedLocation, setSelectedLocation] = React.useState('');
    const [selectedJob, setSelectedJob] = React.useState('');

    // Get unique locations and jobs from events
    const locations = React.useMemo(() => {
        const uniqueLocations = new Set(events.map(event => event.location));
        return Array.from(uniqueLocations);
    }, [events]);

    const jobs = React.useMemo(() => {
        const uniqueJobs = new Set(
            events.flatMap(event => event.jobs.map(job => job.job_title))
        );
        return Array.from(uniqueJobs);
    }, [events]);

    const handleLocationChange = (event: SelectChangeEvent) => {
        setSelectedLocation(event.target.value);
        onFilterChange(event.target.value, selectedJob);
    };

    const handleJobChange = (event: SelectChangeEvent) => {
        setSelectedJob(event.target.value);
        onFilterChange(selectedLocation, event.target.value);
    };

    const handleClear = () => {
        setSelectedLocation('');
        setSelectedJob('');
        onFilterChange('', '');
    };

    return (
        <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Location</InputLabel>
                    <Select
                        value={selectedLocation}
                        onChange={handleLocationChange}
                        label="Location"
                    >
                        <MenuItem value="">All Locations</MenuItem>
                        {locations.map((location) => (
                            <MenuItem key={location} value={location}>
                                {location}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Job Title</InputLabel>
                    <Select
                        value={selectedJob}
                        onChange={handleJobChange}
                        label="Job Title"
                    >
                        <MenuItem value="">All Jobs</MenuItem>
                        {jobs.map((job) => (
                            <MenuItem key={job} value={job}>
                                {job}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button 
                    variant="outlined" 
                    onClick={handleClear}
                    sx={{ height: 56 }}
                >
                    Clear Filters
                </Button>
            </Stack>
        </Box>
    );
};

export default EventFilters;