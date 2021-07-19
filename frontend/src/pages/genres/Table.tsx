import { BadgeNo, BadgeYes } from '../../components/Badge';
import * as React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import genreHttp from '../../util/http/models_http/genre_http';
import { format, parseISO } from "date-fns";
import { Genre, ListResponse } from '../../util/models';
import DefaultTable, { TableColumn } from "../../components/Table"
import { useSnackbar } from 'notistack';

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "30%",
        options: {
            sort: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "26%"
    },
    {
        name: "categories",
        label: "Categorias",
        width: "30%",
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
        width: "4%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return value ? <BadgeYes /> : <BadgeNo />
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        width: "10%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return <span>{format(parseISO(value), "dd/MM/yyyy")}</span>
            }
        }
    },
];

type Props = {};
const Table = (props: Props) => {
    const snackbar = useSnackbar();
    const [data, setData] = useState<Genre[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let isSubscribed = true;

        (async function getGenres() {
            setLoading(true);
            try {
                const { data } = await genreHttp.list<ListResponse<Genre>>()
                if (isSubscribed) {
                    setData(data.data)
                }
            } catch (error) {
                console.error(error)
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
    }, [snackbar])

    return (
        <DefaultTable
            title="Listagem de categorias"
            columns={columnsDefinition}
            data={data}
            loading={loading}
            options={{
                responsive: "simple"
            }}
        />
    );
};

export default Table;