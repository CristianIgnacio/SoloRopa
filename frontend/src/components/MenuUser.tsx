import {Box, Menu, Tooltip, IconButton, Avatar, MenuItem, Typography, Button} from "@mui/material"
import React, { useState } from "react"
import {Link} from "react-router-dom"
import type { User } from "../Types/Types"

const settings = ['Profile','Admin', 'Account', 'Logout'];
const urls = ['/', '/admin', '/account', '/logout'];

const MenuUser = () => {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const [user, setUser] = useState<User | null>(null)
    
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    if(!user){
        return (
            <Box sx={{ flexGrow: 0, display: 'flex', gap: 1 }} >
                <Button variant="contained" color="success" component={Link} to="/login">
                    Login
                </Button>
                <Button  variant="contained" color="success" component={Link} to="/register">
                    Register
                </Button>
            </Box>
        )
    }

    return ( 
        <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                </IconButton>
            </Tooltip>
            <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
            >
                {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                    <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                </MenuItem>
                ))}
            </Menu>
        </Box>
    )
}

export default MenuUser