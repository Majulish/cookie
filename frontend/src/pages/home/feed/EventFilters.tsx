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
    SelectChangeEvent
} from '@mui/material';
import { MyEventScheme } from '../create_event/eventScheme';

interface EventFiltersProps {
    events: MyEventScheme[];
    onFilterChange: (cities: string[], jobTitles: string[]) => void;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

const EventFilters: React.FC<EventFiltersProps> = ({ events, onFilterChange }) => {
    const [selectedCities, setSelectedCities] = React.useState<string[]>([]);
    const [selectedJobs, setSelectedJobs] = React.useState<string[]>([]);

    // Get unique cities and jobs from events
    const cities = React.useMemo(() => {
        const uniqueCities = new Set(events.map(event => event.city));
        return Array.from(uniqueCities);
    }, [events]);

    const jobs = React.useMemo(() => {
        const uniqueJobs = new Set(
            events.flatMap(event => event.jobs.map(job => job.job_title))
        );
        return Array.from(uniqueJobs);
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

    return (
        <Box sx={{ mb: 4 }}>
            <Stack direction="row" spacing={2} alignItems="center">
                <FormControl sx={{ minWidth: 200, flex: 1 }}>
                    <InputLabel id="city-select-label">Cities</InputLabel>
                    <Select
                        labelId="city-select-label"
                        id="city-select"
                        multiple
                        value={selectedCities}
                        onChange={handleCityChange}
                        input={<OutlinedInput id="select-multiple-cities" label="Cities" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} size="small" />
                                ))}
                            </Box>
                        )}
                        MenuProps={MenuProps}
                    >
                        {cities.map((city) => (
                            <MenuItem key={city} value={city}>
                                {city}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 200, flex: 1 }}>
                    <InputLabel id="job-select-label">Job Titles</InputLabel>
                    <Select
                        labelId="job-select-label"
                        id="job-select"
                        multiple
                        value={selectedJobs}
                        onChange={handleJobChange}
                        input={<OutlinedInput id="select-multiple-jobs" label="Job Titles" />}
                        renderValue={(selected) => (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                    <Chip key={value} label={value} size="small" />
                                ))}
                            </Box>
                        )}
                        MenuProps={MenuProps}
                    >
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
                    disabled={selectedCities.length === 0 && selectedJobs.length === 0}
                >
                    Clear Filters
                </Button>
            </Stack>
        </Box>
    );
};

export default EventFilters;