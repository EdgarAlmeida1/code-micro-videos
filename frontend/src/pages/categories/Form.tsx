import { Box, Button, Checkbox, FormControlLabel, makeStyles, TextField, Theme } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import * as React from 'react';
import { useForm, Controller } from "react-hook-form"
import categoryHttp from '../../util/http/category_http';

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

    const { register, handleSubmit, getValues, control } = useForm();

    function onSubmit(formData, event) {
        categoryHttp
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
            <TextField
                {...register("description")}
                label="Descrição"
                multiline
                rows={"4"}
                fullWidth
                variant={"outlined"}
                margin={"normal"}
            />
            <Controller
                name="is_active"
                control={control}
                defaultValue={true}
                render={({ field }) => {
                    return <FormControlLabel
                        control={<Checkbox {...field} defaultChecked/>}
                        label="Ativo?"
                    />
                }}
            />

            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};