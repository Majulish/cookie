import React from 'react';
import { Stack } from '@mui/material';
import EventFeed from '../feed/EvenFeed';
import { MyEventScheme } from '../create_event/eventScheme';

interface FeedListProps {
    events: MyEventScheme[];
}

const FeedList: React.FC<FeedListProps> = ({ events }) => {
    return (
        <Stack spacing={2}>
            {events.map((event) => (
                <EventFeed key={event.id} event={event} />
            ))}
        </Stack>
    );
};

export default FeedList;