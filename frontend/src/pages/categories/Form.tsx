import { Checkbox, FormControlLabel, TextField } from '@material-ui/core';
import * as React from 'react';
import { useForm, Controller } from "react-hook-form"
import categoryHttp from '../../util/http/models_http/category_http';
import * as yup from '../../util/vendor/yup';
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Category } from '../../util/models';
import SubmitActions from '../../components/SubmitActions';

const validationSchema = yup.object().shape({
    name: yup.string()
        .label("Nome")
        .required()
        .max(255)
})

export const Form = () => {
    const {
        handleSubmit,
        getValues,
        control,
        formState: { errors },
        reset,
        watch,
        trigger
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
    const [category, setCategory] = useState<Category | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!id) return
        let isSubscribed = true;

        (async function getCategory() {
            setLoading(true);
            try {
                const { data } = await categoryHttp.get(id)
                if (isSubscribed) {
                    setCategory(data.data)
                    reset(data.data)
                }
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar(
                    "Não foi possível carregar as informações",
                    { variant: "error" }
                )
            } finally {
                setLoading(false)
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

            <SubmitActions
                disabledButtons={loading}
                handleSave={() => trigger().then(isValid => {
                    isValid && onSubmit(getValues, null)
                })}
            />
        </form>
    );
};