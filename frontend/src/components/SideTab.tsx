import React, {useState} from 'react';
import {Drawer, List, ListItem, ListItemText, IconButton, ButtonBase} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const SideTab = () => {
    const [isOpen, setOpen] = useState(false);

    const toggleDrawer = (open: boolean) => (event: React.KeyboardEvent | React.MouseEvent) => {
        // Check if it's a keyboard event and prevent toggle on certain keys
        if (event.type === 'keydown' && (['Tab', 'Shift'].includes((event as React.KeyboardEvent).key))) {
            return;
        }
        setOpen(open);
    };

    return (
        <>
            <IconButton onClick={() => toggleDrawer(true)}>
                <MenuIcon/>
            </IconButton>
            <Drawer anchor="left" open={isOpen} onClose={() => toggleDrawer(false)}>
                <List>
                    {['Profile', 'Settings', 'Logout'].map((text) => (
                        <ButtonBase key={text} style={{width: '100%', textAlign: 'left'}}>
                            <ListItem onClick={() => toggleDrawer(false)}>
                                <ListItemText primary={text}/>
                            </ListItem>
                        </ButtonBase>
                    ))}
                </List>
            </Drawer>
        </>
    );
};

export default SideTab;
