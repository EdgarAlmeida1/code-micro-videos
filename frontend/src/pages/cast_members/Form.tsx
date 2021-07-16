import { Box, Button, FormControl, FormControlLabel, FormHelperText, FormLabel, makeStyles, Radio, RadioGroup, TextField, Theme } from '@material-ui/core';
import { ButtonProps } from '@material-ui/core/Button';
import * as React from 'react';
import { useForm, Controller } from "react-hook-form"
import castMemberHttp from '../../util/http/models_http/cast_member_http';
import * as yup from '../../util/vendor/yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';

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
    type: yup
        .number()
        .required()
})

export const Form = () => {
    const classes = useStyles();
    const {
        control,
        handleSubmit,
        getValues,
        formState: { errors },
        reset,
    } = useForm({
        defaultValues: {
            name: "",
            type: "2"
        },
        resolver: yupResolver(validationSchema)
    });

    const snackbar = useSnackbar();
    const history = useHistory();
    const { id } = useParams<{ id }>();
    const [castMember, setCastMember] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!id) return

        async function getCastMember() {
            setLoading(true);
            try {
                const { data } = await castMemberHttp.get(id)
                setCastMember(data.data)
                // The type attribute is a number, so I change it to string to use on the form
                data.data.type = data.data.type.toString()
                reset(data.data)
            } catch (error) {
                console.log(error);
                snackbar.enqueueSnackbar(
                    "Não foi possível carregar as informações",
                    { variant: "error" }
                )

            } finally {
                setLoading(false)
            }
        }

        getCastMember()

    }, [id, reset, snackbar])

    async function onSubmit(formData, event) {
        setLoading(true);

        try {
            const http = !id
                ? castMemberHttp.create(formData)
                : castMemberHttp.update(castMember!.id, formData)
            const { data } = await http

            snackbar.enqueueSnackbar(
                "Membro de elenco salvo com sucesso",
                { variant: "success" }
            )
            setTimeout(() => {
                event
                    ? (
                        id
                            ? history.replace(`/cast_members/${data.data.id}/edit`)
                            : history.push(`/cast_members/${data.data.id}/edit`)
                    )
                    : history.push("/cast_members")
            })
        } catch (error) {
            console.log(error)
            snackbar.enqueueSnackbar(
                "Não foi possível salvar o membro de elenco",
                { variant: "error" }
            )
        } finally {
            setLoading(false)
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

            <FormControl margin="normal">
                <FormLabel component="legend">Tipo</FormLabel>
                <Controller
                    name="type"
                    control={control}
                    render={({ field, formState }) => {
                        return (
                            <>
                                <RadioGroup {...field}>
                                    <FormControlLabel
                                        value="1"
                                        control={<Radio color={"primary"} />}
                                        label="Diretor"
                                    />
                                    <FormControlLabel
                                        value="2"
                                        control={<Radio color={"primary"} />}
                                        label="Ator"
                                    />
                                </RadioGroup>
                                {errors.type && <FormHelperText>{errors.type?.message}</FormHelperText>}
                            </>
                        )
                    }}
                />
            </FormControl>

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