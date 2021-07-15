import { Box, Button, makeStyles, MenuItem, TextField, Theme } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form"
import categoryHttp from '../../util/http/models_http/category_http';
import genreHttp from '../../util/http/models_http/genre_http';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
})

export const Form = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const classes = useStyles();

    const buttonProps: ButtonProps = {
        variant: "contained",
        color: "secondary",
        className: classes.submit
    };

    useEffect(() => {
        categoryHttp
            .list()
            .then(({ data }) => setCategories(data.data))
    }, [])

    const { register, handleSubmit, getValues, setValue, watch } = useForm({
        defaultValues: {
            name: "",
            categories_id: []
        }
    });

    function onSubmit(formData, event) {
        genreHttp
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
                onChange={(event) => setValue("name", event.target.value)}
            />

            <TextField
                {...register("categories_id")}
                label="Categorias"
                value={watch("categories_id")}
                fullWidth
                select
                variant={"outlined"}
                SelectProps={{
                    multiple: true
                }}
                margin="normal"
            >
                <MenuItem value="" disabled>
                    <em>Selecione categorias:</em>
                </MenuItem>
                {
                    categories.map((category, key) => (
                        <MenuItem key={key} value={category.id}>
                            {category.name}
                        </MenuItem>
                    ))
                }
            </TextField>

            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};