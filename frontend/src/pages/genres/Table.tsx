import { BadgeNo, BadgeYes } from '../../components/Badge';
import * as React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import genreHttp from '../../util/http/models_http/genre_http';
import { format, parseISO } from "date-fns";
import { Genre, ListResponse } from '../../util/models';
import DefaultTable, { makeActionStyles, TableColumn } from "../../components/Table"
import { useSnackbar } from 'notistack';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import { Link } from 'react-router-dom';
import EditIcon from '@material-ui/icons/Edit';

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "25%",
        options: {
            sort: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "23%"
    },
    {
        name: "categories",
        label: "Categorias",
        width: "25%",
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
    {
        name: "actions",
        label: "Ações",
        width: "13%",
        options: {
            customBodyRender: (value, tableMeta) => {
                return (
                    <IconButton
                        color={"secondary"}
                        component={Link}
                        to={`/genres/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon />
                    </IconButton>
                )
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
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable
                title="Listagem de gêneros"
                columns={columnsDefinition}
                data={data}
                loading={loading}
                options={{
                    responsive: "simple"
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;