import { Chip } from '@material-ui/core';
import MuiDataTable, { MUIDataTableColumn } from 'mui-datatables';
import * as React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { httpVideo } from '../../util/http';
import { format, parseISO } from "date-fns";

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "categories",
        label: "Categorias",
        options: {
            customBodyRender(value: [], tableMeta, updateValue) {
                let categories = value.map((category, index) => {
                    return category['name']
                })
                return <span>{categories.join(", ")}</span>
            }
        }
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <Chip label="Sim" color="primary" /> : <Chip label="Não" color="secondary" />
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), "dd/MM/yyyy")}</span>
            }
        }
    },
];

type Props = {};
const Table = (props: Props) => {
    const [data, setData] = useState([])
    useEffect(() => {
        httpVideo.get('genres').then(
            response => setData(response.data.data)
        )
    }, [])

    return (
        <MuiDataTable
            title="Listagem de gêneros"
            columns={columnsDefinition}
            data={data}
        />
    );
};

export default Table;