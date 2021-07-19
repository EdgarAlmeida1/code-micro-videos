import { Box, Button, makeStyles, Theme } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import * as React from 'react';


const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

type SubmitActionsProps = {
    disabledButtons?: boolean;
    handleSave: () => void;
};

const SubmitActions = (props: SubmitActionsProps) => {
    const classes = useStyles();

    const buttonProps: ButtonProps = {
        variant: "contained",
        color: "secondary",
        className: classes.submit,
        disabled: props.disabledButtons === undefined ? false : props.disabledButtons,
    };

    return (
        <Box dir={"rtl"}>
            <Button
                color={"primary"}
                {...buttonProps}
                onClick={props.handleSave}
            >
                Salvar
            </Button>

            <Button
                {...buttonProps}
                type="submit"
            >
                Salvar e continuar editando
            </Button>
        </Box>
    );
};

export default SubmitActions;