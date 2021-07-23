import { IconButton, makeStyles, Tooltip } from '@material-ui/core';
import * as React from 'react';
import ClearAllIcon from "@material-ui/icons/ClearAll"

const useStyles = makeStyles(theme => ({
    iconButton: (theme as any).overrides.MUIDataTableToolbar.icon
}));

interface FilterResetButtonProps {
    handleClick: () => void
}

export const FilterResetButton = (props: FilterResetButtonProps) => {
    const classes = useStyles();
    return (
        <Tooltip title={"Limpar busca"}>
            <IconButton 
                className={classes.iconButton} 
                onClick={props.handleClick}
            >
                <ClearAllIcon />
            </IconButton>
        </Tooltip>
    );
};