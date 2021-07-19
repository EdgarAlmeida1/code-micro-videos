import { Box, Button, makeStyles, MenuItem, TextField, Theme } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useForm, Controller } from "react-hook-form"
import categoryHttp from '../../util/http/models_http/category_http';
import genreHttp from '../../util/http/models_http/genre_http';
import * as yup from '../../util/vendor/yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useHistory, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Category, Genre } from '../../util/models';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
})

const validationSchema = yup.object().shape({
    name: yup.string()
        .label("Nome")
        .required()
        .max(255),
    categories_id: yup.array()
        .label("Categorias")
        .required()
        .min(1)
})

export const Form = () => {
    const {
        handleSubmit,
        getValues,
        control,
        formState: { errors },
        reset
    } = useForm({
        defaultValues: {
            name: "",
            categories_id: []
        },
        resolver: yupResolver(validationSchema)
    });
    const classes = useStyles();
    const snackbar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id }>();
    const [genre, setGenre] = useState<Genre | null>(null)
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let isSubscribed = true;

        (async function loadData() {
            setLoading(true);

            const promises = [categoryHttp.list()]
            if (id) promises.push(genreHttp.get(id))

            try {
                const [categoriesResponse, genreResponse] = await Promise.all(promises);

                if (isSubscribed) {
                    setCategories(categoriesResponse.data.data)
                    if (id) {
                        setGenre(genreResponse.data.data)

                        reset({
                            ...genreResponse.data.data,
                            categories_id: genreResponse.data.data.categories.map(category => category.id)
                        })
                    }
                }
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar(
                    "Não foi possível carregar as informações",
                    { variant: "error" }
                )
            } finally {
                setLoading(false);
            }
        })()

        return () => {
            isSubscribed = false;
        }

    }, [id, reset, snackbar])


    async function onSubmit(formData, event) {
        setLoading(true);

        try {
            const http = !id
                ? genreHttp.create(formData)
                : genreHttp.update(genre!.id, formData)
            const { data } = await http

            snackbar.enqueueSnackbar(
                "Gênero salvo com sucesso",
                { variant: "success" }
            )
            setTimeout(() => {
                event
                    ? (
                        id
                            ? history.replace(`/genres/${data.data.id}/edit`)
                            : history.push(`/genres/${data.data.id}/edit`)
                    )
                    : history.push("/genres")
            })

        } catch (error) {
            console.error(error)
            snackbar.enqueueSnackbar(
                "Não foi possível salvar a gênero",
                { variant: "error" }
            )
        } finally {
            setLoading(false);
        }
    }

    const buttonProps: ButtonProps = {
        variant: "contained",
        color: "secondary",
        className: classes.submit,
        disabled: loading
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
                name="name"
                control={control}
                render={({ field, formState }) => {
                    return (
                        <TextField
                            {...field}
                            label="Nome"
                            fullWidth
                            variant={"outlined"}
                            error={errors.name !== undefined}
                            helperText={errors.name?.message}
                            InputLabelProps={{ shrink: true }}
                            disabled={loading}
                        />
                    )
                }}
            />

            <Controller
                name="categories_id"
                control={control}
                render={({ field, formState }) => {
                    return (
                        <TextField
                            {...field}
                            label="Categorias"
                            fullWidth
                            select
                            variant={"outlined"}
                            SelectProps={{
                                multiple: true
                            }}
                            margin="normal"
                            error={errors.categories_id !== undefined}
                            helperText={
                                // @ts-ignore
                                errors.categories_id?.message
                            }
                            InputLabelProps={{ shrink: true }}
                            disabled={loading}
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
                    )
                }}
            />

            <Box dir={"rtl"}>
                <Button {...buttonProps} onClick={() => onSubmit(getValues(), null)}>Salvar</Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};