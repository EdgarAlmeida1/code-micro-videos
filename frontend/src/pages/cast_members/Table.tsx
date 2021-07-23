import * as React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import castMemberHttp from '../../util/http/models_http/cast_member_http';
import { format, parseISO } from "date-fns";
import { CastMember, ListResponse } from '../../util/models';
import DefaultTable, { makeActionStyles, TableColumn } from "../../components/Table"
import { useSnackbar } from 'notistack';
import EditIcon from '@material-ui/icons/Edit';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import { Link } from 'react-router-dom';

const CastMemberTypes = {
    1: "Diretor",
    2: "Ator",
}

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
        width: "41%"
    },
    {
        name: "type",
        label: "Tipo",
        width: "4%",
        options: {
            customBodyRender(value, tableMeta, updateValue) {
                return CastMemberTypes[value];
            }
        }
    },
    {
        name: "created_at",
        label: "Criado em",
        width: "12%",
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
                        to={`/cast_members/${tableMeta.rowData[0]}/edit`}
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
    const [data, setData] = useState<CastMember[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        let isSubscribed = true;

        (async function getCastMembers() {
            setLoading(true);
            try {
                const { data } = await castMemberHttp.list<ListResponse<CastMember>>()
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
                title=""
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