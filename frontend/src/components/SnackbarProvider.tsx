import * as React from 'react';
import { SnackbarProvider as NotistackProvider, SnackbarProviderProps} from 'notistack';
import { IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close'


export const SnackbarProvider: React.FC<SnackbarProviderProps> = (props) => {
    let snackbarProviderRef;

    const defaultProps: SnackbarProviderProps = {
        autoHideDuration: 3000,
        maxSnack: 3,
        anchorOrigin: {
            horizontal: 'right',
            vertical: 'top'
        },
        children: props.children,
        ref: (element) => snackbarProviderRef = element,
        action: (key) => (
            <IconButton 
                color={"inherit"} 
                style={{fontSize: 20}}
                onClick={() => snackbarProviderRef.closeSnackbar(key)}
            >
                <CloseIcon />
            </IconButton>
        )
    }

    const newProps = {...defaultProps, ...props}

    return (
        <NotistackProvider {...newProps}>
            {props.children}
        </NotistackProvider>
    );
};