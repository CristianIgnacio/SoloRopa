import {Box, Menu, Tooltip, IconButton, Avatar, MenuItem, Typography} from "@mui/material"
import { useNavigate } from 'react-router-dom'
import React from "react"
import { useUserStore } from "../Hooks/useStore"
import loginServices from "../services/login"

const settings = ['Profile','Admin', 'Favorites','Account', 'Logout'];
const urls = ['/', '/admin', '/favorites', '/account', '/logout'];

const MenuUser = () => {
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
    const {user, logout : logoutState} = useUserStore();

    const UrlBaseServer = "http://localhost:3001" + (user?.avatarUrl || "");
    const navigate = useNavigate();
    
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleMenuClick = async (setting: string) => {
        handleCloseUserMenu();

        if (setting === "Logout") {
            await loginServices.logout();
            logoutState(); // Zustand
            // Opcional: llamar backend → /logout
            // await fetch("/logout", { method: "POST", credentials: "include" });

            // window.location.href = "/login"; // redirigir
            navigate("/login");
            return;
        }

        // Para los demás items, redirige con React Router
        const index = settings.indexOf(setting);
        const url = urls[index];
        window.location.href = url;
    };


    return ( 
        <Box sx={{ flexGrow: 0 }}>
            <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar alt="Remy Sharp" src={UrlBaseServer} />
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
                    <MenuItem key={setting} onClick={() => handleMenuClick(setting)}>
                        <Typography sx={{ textAlign: 'center' }}>{setting}</Typography>
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    )
}

export default MenuUser