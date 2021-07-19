import MuiDataTable, { MUIDataTableColumn } from 'mui-datatables';
import * as React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { format, parseISO } from "date-fns";
import categoryHttp from '../../util/http/models_http/category_http';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from '../../util/models';

const columnsDefinition: MUIDataTableColumn[] = [
    {
        name: "name",
        label: "Nome"
    },
    {
        name: "is_active",
        label: "Ativo?",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes /> : <BadgeNo />
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
    const [data, setData] = useState<Category[]>([])

    useEffect(() => {
        let isSubscribed = true;

        (async function getCategories() {
            const { data } = await categoryHttp.list<ListResponse<Category>>()
            if (isSubscribed) {
                setData(data.data)
            }
        })()

        return () => {
            isSubscribed = false;
        }
    }, [])

    return (
        <MuiDataTable
            title="Listagem de categorias"
            columns={columnsDefinition}
            data={data}
        />
    );
};

export default Table;