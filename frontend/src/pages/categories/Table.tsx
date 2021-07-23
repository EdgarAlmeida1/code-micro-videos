import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { format, parseISO } from "date-fns";
import categoryHttp from '../../util/http/models_http/category_http';
import { BadgeNo, BadgeYes } from '../../components/Badge';
import { Category, ListResponse } from '../../util/models';
import DefaultTable, { makeActionStyles, TableColumn } from "../../components/Table"
import { useSnackbar } from 'notistack';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { Link } from 'react-router-dom';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import useFilter from '../../hooks/useFilter';
import { Creators } from '../../store/filter';

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
        width: "41%",
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
            sort: false,
            customBodyRender: (value, tableMeta) => {
                return (
                    <IconButton
                        color={"secondary"}
                        component={Link}
                        to={`/categories/${tableMeta.rowData[0]}/edit`}
                    >
                        <EditIcon />
                    </IconButton>
                )
            }
        }
    },
];

const debounceTime = 300;
const debounceSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50]

const Table = () => {
    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Category[]>([])
    const [loading, setLoading] = useState(false)
    const {
        filterManager,
        filterState,
        debouncedFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions
    });

    useEffect(() => {
        subscribed.current = true;
        filterManager.pushHistory();
        getData()
        return () => {
            subscribed.current = false;
        }
    }, [debouncedFilterState])

    async function getData() {
        setLoading(true)
        try {
            const { data } = await categoryHttp.list<ListResponse<Category>>({
                queryParams: {
                    search: filterState.search,
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.name,
                    dir: filterState.order.direction
                }
            })
            if (subscribed.current) {
                setData(data.data)
                setTotalRecords(data.meta.total)
            }
        } catch (error) {
            if (categoryHttp.isCancelledRequest(error)) {
                return;
            }
            console.error(error);

            snackbar.enqueueSnackbar(
                "Não foi possível carregar as informações",
                { variant: "error" }
            )
        } finally {
            setLoading(false)
        }
    }

    return (
        <MuiThemeProvider theme={makeActionStyles(columnsDefinition.length - 1)}>
            <DefaultTable
                title=""
                columns={columnsDefinition}
                data={data}
                loading={loading}
                debouncedSearchTime={debounceSearchTime}
                options={{
                    customToolbar: () => (
                        <FilterResetButton
                            handleClick={() => dispatch(Creators.setReset())}
                        />
                    ),
                    serverSide: true,
                    responsive: "simple",
                    searchText: filterState.search as any,
                    page: filterState.pagination.page - 1,
                    rowsPerPage: filterState.pagination.per_page,
                    rowsPerPageOptions,
                    count: totalRecords,
                    sortOrder: filterState.order as any,
                    onSearchChange: (value) => filterManager.changeSearch(value),
                    onChangePage: (page) => filterManager.changePage(page),
                    onChangeRowsPerPage: (perPage) => filterManager.changeRowsPerPage(perPage),
                    onColumnSortChange: (changedColumn, direction) => filterManager.changeColumnSort(changedColumn, direction),
                }}
            />
        </MuiThemeProvider>
    );
};

export default Table;