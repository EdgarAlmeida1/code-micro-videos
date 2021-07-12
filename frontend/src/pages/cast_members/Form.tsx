import { Box, Button, FormControl, FormControlLabel, FormLabel, makeStyles, Radio, RadioGroup, TextField, Theme } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import * as React from 'react';
import { useForm } from "react-hook-form"
import castMemberHttp from '../../util/http/models_http/cast_member_http';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
})

export const Form = () => {
    const classes = useStyles();

    const buttonProps: ButtonProps = {
        variant: "outlined",
        className: classes.submit
    };

    const { register, handleSubmit, getValues } = useForm();

    function onSubmit(formData, event) {
        castMemberHttp
            .create(formData)
            .then((response) => console.log(response))
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <TextField
                {...register("name")}
                label="Nome"
                fullWidth
                variant={"outlined"}
            />
           
            <FormControl margin="normal">
                <FormLabel component="legend">Tipo</FormLabel>
                <RadioGroup {...register("type")}>
                    <FormControlLabel value="1" control={<Radio />} label="Diretor" />
                    <FormControlLabel value="2" control={<Radio />} label="Ator" />
                </RadioGroup>
            </FormControl>

            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};