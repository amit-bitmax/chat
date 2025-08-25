import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import MuiDrawer from '@mui/material/Drawer';
import {  Box, Collapse, Typography, IconButton, Divider, List, ListItem, ListItemText, ListItemIcon, ListItemButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight,  ExpandMore } from '@mui/icons-material';

import { menuData } from './menuData';
import { PiDotOutlineFill, PiDotOutlineLight } from 'react-icons/pi';

const drawerWidth = 190;

const openedMixin = (theme) => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme) => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(9)} + 1px)`,
    },
});

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    })
);

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',

    ...theme.mixins.toolbar,
}));

const Sidebar = ({ open, handleDrawerClose,role }) => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [openMenus, setOpenMenus] = useState({});
    const [activeItem, setActiveItem] = useState(null);

    const handleToggle = (menuName, level) => {
        setOpenMenus((prev) => {
            const newState = { ...prev };
            Object.keys(newState).forEach((key) => {
                if (key.startsWith(`${level}-`) && key !== `${level}-${menuName}`) {
                    newState[key] = false;
                }
            });

            newState[`${level}-${menuName}`] = !newState[`${level}-${menuName}`];
            return newState;
        });

        setActiveItem(menuName);
    };

    const getLevelIcon = (item, level) => {
        if (item.icon) return <item.icon sx={{ fontSize: level === 0 ? 44 : level === 1 ? 40 : 45 }} />;
        if (level === 1) return <PiDotOutlineFill sx={{ fontSize: 30 }} />;
        if (level >= 2) return <PiDotOutlineLight sx={{ fontSize: 15 }} />;
        return null;
    };

    const renderMenuItems = (items, level = 0) => {
        return items.map((item) => {
            const isOpen = openMenus[`${level}-${item.name}`];
            const isActive = activeItem === item.name;
            return (
                <React.Fragment key={item.name}>
                    <ListItem disablePadding sx={{ display: 'flex',background:isActive? "#eceff1":"none",  pl: level * 0 }}>
                        {/* Left border indicator */}
                        <Box
                            sx={{
                                background: isActive ?  ' #455a64':'none' ,
                                borderRadius: '50px',
                                height: '20px',
                                width: '5px',
                            }}
                        />

                        <Box
                            sx={{
                                my: 0.2,
                                background: isActive ? 'rgba(255, 255, 255, 0.68)' : 'none',
                                borderRadius: '5px 50px 50px 5px',
                                width: '100%',
                            }}
                        >
                            <ListItemButton
                                sx={{
                                    justifyContent: open ? 'initial' : 'center',
                                    color: isActive ? '#455a64' : '#333',
                                }}
                                onClick={() => {
                                    if (item.route) {
                                        navigate(item.route);
                                        setActiveItem(item.name);
                                    }
                                    if (item.subMenu || item.nestedSubMenu) {
                                        handleToggle(item.name, level);
                                    }
                                }}
                            >
                                <ListItemIcon sx={{ justifyContent: 'center', minWidth: 0, mr: open ? 1 : 'auto' }}>
                                    {getLevelIcon(item, level)}
                                </ListItemIcon>

                                {/* Hide text when sidebar is closed */}
                                <ListItemText
                                    primary={item.name}
                                    sx={{
                                        opacity: open ? 1 : 0,
                                        display: open ? 'block' : 'none',
                                    }}
                                />
                                {(item.subMenu || item.nestedSubMenu) &&
                                    open &&
                                    (isOpen ? <ExpandMore /> : <ChevronRight />)}
                            </ListItemButton>
                        </Box>
                    </ListItem>

                    {/* Render Submenu only when sidebar is open */}
                    {(item.subMenu || item.nestedSubMenu) && open && (
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding>
                                {renderMenuItems(item.subMenu || item.nestedSubMenu, level + 1)}
                            </List>
                        </Collapse>
                    )}
                </React.Fragment>
            );
        });
    };

    return (
        <Drawer variant="permanent" open={open} >
            <DrawerHeader open={open} sx={{background:'#ebececf4'}}>
                <Typography textAlign={'center'} sx={{ p: 1.5 }} variant="h6" noWrap component="div">
                    Live Chats
                </Typography>
                <IconButton variant="none" onClick={handleDrawerClose} sx={{ '&:hover': { background: 'none' }, color: '#827717' }}>
                    {theme.direction === 'rtl' ? <ChevronRight /> : <ChevronLeft />}
                </IconButton>
            </DrawerHeader>
            <Divider />
            <Box sx={{background:'#ebececf4',height:'100%'}}>
                <List>
                    {menuData[role]?.map((section) => (
                        <React.Fragment key={section.label}>
                            {open && <ListItemText sx={{color:'#cbc6c6be',ml:1, textTransform: 'uppercase' }}>{section.label}</ListItemText>}
                            {renderMenuItems(section.items)}
                        </React.Fragment>
                    ))}
                </List>
            </Box>
        </Drawer>
    );
};

export default Sidebar;
