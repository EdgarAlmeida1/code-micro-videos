import { FormControl, FormControlLabel, FormHelperText, FormLabel, Radio, RadioGroup, TextField } from '@material-ui/core';
import * as React from 'react';
import { useForm, Controller } from "react-hook-form"
import castMemberHttp from '../../util/http/models_http/cast_member_http';
import * as yup from '../../util/vendor/yup';
import { yupResolver } from '@hookform/resolvers/yup'
import { useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { CastMember } from '../../util/models';
import SubmitActions from '../../components/SubmitActions';
import { DefaultForm } from '../../components/DefaultForm';


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
    const {
        control,
        handleSubmit,
        getValues,
        formState: { errors },
        reset,
        trigger
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
    const [castMember, setCastMember] = useState<CastMember | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!id) return

        let isSubscribed = true;
        (async function getCastMember() {
            setLoading(true);
            try {
                const { data } = await castMemberHttp.get(id)

                if (isSubscribed) {
                    setCastMember(data.data)
                    // The type attribute is a number, so I change it to string to use on the form
                    data.data.type = data.data.type.toString()
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
            console.error(error)
            snackbar.enqueueSnackbar(
                "Não foi possível salvar o membro de elenco",
                { variant: "error" }
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <DefaultForm
            GridItemProps={{ xs: 12, md: 6 }}
            onSubmit={handleSubmit(onSubmit)}
        >
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

            <SubmitActions
                disabledButtons={loading}
                handleSave={() => trigger().then(isValid => {
                    isValid && onSubmit(getValues, null)
                })}
            />
        </DefaultForm>
    );
};