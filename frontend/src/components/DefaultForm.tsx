import { Grid, GridProps, makeStyles } from '@material-ui/core';
import * as React from 'react';

const useStyles = makeStyles(theme => ({
    gridItem: {
        padding: theme.spacing(1, 0)
    }
}))

interface DefaultFormProps extends React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> {
    GridContainerProps?: GridProps
    GridItemProps?: GridProps
};

export const DefaultForm = (props: DefaultFormProps) => {
    const classes = useStyles();
    const {GridContainerProps, GridItemProps, ...other} = props;

    return (
        <form {...other}>
            <Grid container {...GridContainerProps}>
                <Grid className={classes.gridItem} item {...GridItemProps}>
                    {props.children}
                </Grid>
            </Grid>
        </form>
    );
};