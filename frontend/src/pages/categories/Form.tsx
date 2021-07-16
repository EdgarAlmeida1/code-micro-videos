import { Box, Button, Checkbox, FormControlLabel, makeStyles, TextField, Theme } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import * as React from 'react';
import { useForm, Controller } from "react-hook-form"
import categoryHttp from '../../util/http/models_http/category_http';
import * as yup from '../../util/vendor/yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

const useStyles = makeStyles((theme: Theme) => {
    return {
        submit: {
            margin: theme.spacing(1)
        }
    }
});

const validationSchema = yup.object().shape({
    name: yup.string()
        .label("Nome")
        .required()
        .max(255)
})

export const Form = () => {
    const classes = useStyles();
    const {
        handleSubmit,
        getValues,
        control,
        formState: { errors },
        reset,
        watch
    } = useForm({
        defaultValues: {
            name: "",
            description: "",
            is_active: true
        },
        resolver: yupResolver(validationSchema)
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id }>();
    const [category, setCategory] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!id) return

        async function getCategory() {
            setLoading(true);
            try {
                const { data } = await categoryHttp.get(id)
                setCategory(data.data)
                reset(data.data)
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar(
                    "Não foi possível carregar as informações",
                    { variant: "error" }
                )
            } finally {
                setLoading(false)
            }
        }

        getCategory();

    }, [id, reset, snackbar])

    async function onSubmit(formData, event) {
        setLoading(true);

        try {
            const http = !id
                ? categoryHttp.create(formData)
                : categoryHttp.update(category!.id, formData)
            const { data } = await http

            snackbar.enqueueSnackbar(
                "Categoria salva com sucesso",
                { variant: "success" }
            )
            setTimeout(() => {
                event
                    ? (
                        id
                            ? history.replace(`/categories/${data.data.id}/edit`)
                            : history.push(`/categories/${data.data.id}/edit`)
                    )
                    : history.push("/categories")
            })

        } catch (error) {
            console.error(error)
            snackbar.enqueueSnackbar(
                "Não foi possível salvar a categoria",
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
                name="description"
                control={control}
                render={({ field }) => {
                    return (
                        <TextField
                            {...field}
                            label="Descrição"
                            multiline
                            rows={"4"}
                            fullWidth
                            variant={"outlined"}
                            margin={"normal"}
                            InputLabelProps={{ shrink: true }}
                            disabled={loading}
                        />
                    )
                }}
            />

            <Controller
                name="is_active"
                control={control}
                render={({ field }) => {
                    return (
                        <FormControlLabel
                            control={
                                <Checkbox
                                    {...field}
                                    color={"primary"}
                                    checked={watch("is_active")}
                                />}
                            label="Ativo?"
                            disabled={loading}
                        />
                    )
                }}
            />

            <Box dir={"rtl"}>
                <Button
                    color={"primary"}
                    {...buttonProps}
                    onClick={() => onSubmit(getValues(), null)}
                >
                    Salvar
                </Button>
                <Button {...buttonProps} type="submit">Salvar e continuar editando</Button>
            </Box>
        </form>
    );
};