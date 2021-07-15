import { IconButton, Menu as MuiMenu, MenuItem } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu'
import * as React from 'react';
import { Link } from 'react-router-dom';
import routes, { MyRouteProps } from '../../routes';

const listRoutes = {
    'dashboard': "Dashboard",
    'categories.list': "Categorias",
    'genres.list': "Gêneros",
    'cast_members.list': "Membros de elenco",
};
const menuRoutes = routes.filter(route => Object.keys(listRoutes).includes(route.name));

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
                {
                    Object.keys(listRoutes).map(
                        (routeName, key) => {
                            const route = menuRoutes.find(route => route.name === routeName) as MyRouteProps;
                            return (
                                <MenuItem key={key} component={Link} to={route.path as string} onClick={handleClose}>
                                    {listRoutes[routeName]}
                                </MenuItem>
                            )
                        }
                    )
                }

            </MuiMenu>
        </>
    );
};