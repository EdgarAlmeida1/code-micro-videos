import * as React from 'react';
import { useRef, useState } from 'react';
import { useEffect } from 'react';
import castMemberHttp from '../../util/http/models_http/cast_member_http';
import { format, parseISO } from "date-fns";
import { CastMember, ListResponse } from '../../util/models';
import DefaultTable, { makeActionStyles, MuiDataTableRefComponent, TableColumn } from "../../components/Table"
import { useSnackbar } from 'notistack';
import EditIcon from '@material-ui/icons/Edit';
import { IconButton, MuiThemeProvider } from '@material-ui/core';
import { Link } from 'react-router-dom';
import useFilter from '../../hooks/useFilter';
import { FilterResetButton } from '../../components/Table/FilterResetButton';
import * as yup from '../../util/vendor/yup';
import { invert } from 'lodash';

const CastMemberTypes = {
    1: "Diretor",
    2: "Ator",
}
const debounceTime = 300;
const debounceSearchTime = 300;
const rowsPerPage = 15;
const rowsPerPageOptions = [15, 25, 50]
const castMemberNames = ["Diretor", "Ator"]

const columnsDefinition: TableColumn[] = [
    {
        name: "id",
        label: "ID",
        width: "30%",
        options: {
            filter: false,
            sort: false
        }
    },
    {
        name: "name",
        label: "Nome",
        width: "41%",
        options: {
            filter: false,
        }
    },
    {
        name: "type",
        label: "Tipo",
        width: "4%",
        options: {
            filterOptions: {
                names: castMemberNames,
                fullWidth: true
            },
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
    const subscribed = useRef(true);
    const [data, setData] = useState<CastMember[]>([])
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
                    type: yup.string()
                        .nullable()
                        .transform(value => {
                            return !value || !castMemberNames.includes(value) ? undefined : value
                        })
                        .default(null)
                })
            },
            formatSearchParams: (debouncedState) => {
                return debouncedState.extraFilter
                    ? {
                        ...(
                            debouncedState.extraFilter.type &&
                            { type: debouncedState.extraFilter.type }
                        )
                    }
                    : undefined
            },
            getStateFromURL: (queryParams) => {
                return {
                    type: queryParams.get("type")
                }
            }
        }
    });

    const indexColumnType = columnsDefinition.findIndex(c => c.name === "type");
    const columnType = columnsDefinition[indexColumnType];
    const typeFilterValue = filterState.extraFilter?.type;
    columnType.options!.filterList = typeFilterValue ? [typeFilterValue] : []

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
            const { data } = await castMemberHttp.list<ListResponse<CastMember>>({
                queryParams: {
                    search: filterState.search,
                    page: filterState.pagination.page,
                    per_page: filterState.pagination.per_page,
                    sort: filterState.order.name,
                    dir: filterState.order.direction,
                    ...(
                        filterState.extraFilter &&
                        filterState.extraFilter.type &&
                        { type: invert(CastMemberTypes)[filterState.extraFilter.type] }
                    )
                }
            })
            if (subscribed.current) {
                setData(data.data)
                setTotalRecords(data.meta.total)
            }
        } catch (error) {
            if (castMemberHttp.isCancelledRequest(error)) {
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
                            [changedColumn as string]: filterList[columnIndex].length ? filterList[columnIndex][0] : null
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