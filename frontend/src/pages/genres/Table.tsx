import { BadgeNo, BadgeYes } from '../../components/Badge';
import * as React from 'react';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import genreHttp from '../../util/http/models_http/genre_http';
import { format, parseISO } from "date-fns";
import { Genre, ListResponse } from '../../util/models';
import DefaultTable, { makeActionStyles, MuiDataTableRefComponent, TableColumn } from "../../components/Table"
import { useSnackbar } from 'notistack';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import { Link } from 'react-router-dom';
import EditIcon from '@material-ui/icons/Edit';
import useFilter from '../../hooks/useFilter';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import * as yup from '../../util/vendor/yup';
import categoryHttp from '../../util/http/models_http/cast_member_http';

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "25%",
        options: {
            sort: false,
            filter: false,
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "21%",
        options: {
            filter: false,
        }
    },
    {
        name: "categories",
        label: "Categorias",
        width: "25%",
        options: {
            filterType: 'multiselect',
            filterOptions: {
                names: [],
                fullWidth: true,
            },
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
            filter: false,
            filterOptions: {
                names: ["Sim", "Não"],
                fullWidth: true
            },
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
            filter: false,
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
            filter: false,
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

const debounceTime = 300;
const debounceSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50]

type Props = {};
const Table = (props: Props) => {
    const snackbar = useSnackbar();
    const subscribed = useRef(true);
    const [data, setData] = useState<Genre[]>([])
    const [loading, setLoading] = useState(false)
    const tableRef = useRef() as React.MutableRefObject<MuiDataTableRefComponent>
    const {
        filterManager,
        filterState,
        debouncedFilterState,
        totalRecords,
        setTotalRecords
    } = useFilter({
        columns: columnsDefinition,
        debounceTime: debounceTime,
        rowsPerPage,
        rowsPerPageOptions,
        tableRef,
        extraFilter: {
            createValidationSchema: () => {
                return yup.object().shape({
                    categories: yup.mixed()
                        .nullable()
                        .transform(value => {
                            return !value || value === '' ? undefined : value.split(",")
                        })
                        .default(null),
                })
            },
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter
                    ? {
                        ...(
                            debouncedState.extraFilter.categories &&
                            { categories: debouncedState.extraFilter.categories.join(",") }
                        ),
                    }
                    : undefined
            },
            getStateFromURL: (queryParams) => {
                return {
                    type: queryParams.get("categories"),
                }
            }
        }
    });

    const indexColumnCategories = columnsDefinition.findIndex(c => c.name === "categories");
    const columnCategories = columnsDefinition[indexColumnCategories];
    const categoriesFilterValue = filterState.extraFilter?.categories;
    columnCategories.options!.filterList = categoriesFilterValue ? categoriesFilterValue : []

    useEffect(() => {
        let isSubscribed = true;
        (async () => {
            try {
                const { data } = await categoryHttp.list({ queryParams: { all: '' } });
                if (isSubscribed) {
                    columnCategories.options!.filterOptions!.names = data.data.map(category => category.name)
                }
            } catch (error) {
                console.error(error);
                snackbar.enqueueSnackbar(
                    "Não foi possível carregar as informações",
                    { variant: 'error' }
                )
            }
        })()
    }, [])

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
            const { data } = await genreHttp.list<ListResponse<Genre>>({
                queryParams: {
                    search: filterState.search,
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.name,
                    dir: filterState.order.direction,
                    ...(
                        filterState.extraFilter &&
                        filterState.extraFilter.categories &&
                        { categories: filterState.extraFilter.categories.join(',') }
                    ),
                }
            })
            if (subscribed.current) {
                setData(data.data)
                setTotalRecords(data.meta.total)
            }
        } catch (error) {
            if (genreHttp.isCancelledRequest(error)) {
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
                            handleClick={() => filterManager.resetFilter()}
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
                    onFilterChange: (changedColumn, filterList, type) => {
                        const columnIndex = columnsDefinition.findIndex(c => c.name === changedColumn);
                        filterManager.changeExtraFilter({
                            [changedColumn as string]: filterList[columnIndex].length ? filterList[columnIndex] : null
                        })
                    },
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