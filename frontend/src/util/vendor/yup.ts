import { setLocale } from "yup";

/* eslint-disable no-template-curly-in-string */
const ptBR = {
    mixed: {
        required: '${path} é requerido'
    },
    string: {
        max: '${path} precisa ter no máximo ${max} caracteres',
        min: '${path} precisa ter no mínimo ${min} caracteres'
    },
    array: {
        min: '${path} precisa ter no mínimo ${min} elemento(s)'
    }

}

setLocale(ptBR);

export * from 'yup'