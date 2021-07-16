import MuiDataTable, { MUIDataTableColumn } from 'mui-datatables';
import * as React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import castMemberHttp from '../../util/http/models_http/cast_member_http';
import { format, parseISO } from "date-fns";

const CastMemberTypes = {
    1: "Diretor",
    2: "Ator",
}

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "type",
        label: "Tipo",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return CastMemberTypes[value];
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
        (async function getCastMembers() {
            const { data } = await castMemberHttp.list()
            setData(data.data)
        })()
    }, [])

    return (
        <MuiDataTable
            title="Listagem de membros do elenco"
            columns={columnsDefinition}
            data={data}
        />
    );
};

export default Table;