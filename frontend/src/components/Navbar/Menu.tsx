import { IconButton, Menu as MuiMenu, MenuItem } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu'
import * as React from 'react';

export const Menu = () => {
    const [ancholEl, setAncholEl] = React.useState(null);
    const open = Boolean(ancholEl);

    const handleOpen = (event: any) => setAncholEl(event.currentTarget);
    const handleClose = () => setAncholEl(null);

    return (
        <>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpen}
            >
                <MenuIcon />
            </IconButton>

            <MuiMenu
                id="menu-appbar"
                open={open}
                anchorEl={ancholEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                getContentAnchorEl={null}
            >
                <MenuItem onClick={handleClose}>
                    Categorias
                </MenuItem>
            </MuiMenu>
        </>
    );
};