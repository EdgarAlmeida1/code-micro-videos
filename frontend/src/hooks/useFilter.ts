import { MUIDataTableColumn } from "mui-datatables"
import React, { Dispatch, Reducer, useEffect, useReducer, useState } from "react"
import reducer, { Creators } from "../store/filter"
import { State as FilterState, Actions as FilterActions } from "../store/filter/types"
import { useDebounce } from "use-debounce"
import { useHistory } from "react-router"
import { History } from 'history'
import { isEqual } from 'lodash'
import * as yup from '../util/vendor/yup';
import { MuiDataTableRefComponent } from "../components/Table"

interface FilterManagerOptions {
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    debounceTime: number;
    history: History;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>;
    extraFilter?: ExtraFilter
}

interface ExtraFilter {
    getStateFromURL: (queryParams: URLSearchParams) => any,
    formatSearchParams: (debouncedState: FilterState) => any,
    createValidationSchema: () => any
}

interface UseFilterOptions extends Omit<FilterManagerOptions, "history"> { }

export default function useFilter(options: UseFilterOptions) {
    const history = useHistory();
    const filterManager = new FilterManager({ ...options, history })
    const INITIAL_STATE = filterManager.getStateFromURL()

    const [filterState, dispatch] = useReducer<Reducer<FilterState, FilterActions>>(reducer, INITIAL_STATE)
    const [debouncedFilterState] = useDebounce(filterState, options.debounceTime)
    const [totalRecords, setTotalRecords] = useState(0)

    filterManager.state = filterState;
    filterManager.dispatch = dispatch;

    useEffect(() => {
        filterManager.replaceHistory()
    }, [])

    return {
        filterManager,
        filterState,
        debouncedFilterState,
        dispatch,
        totalRecords,
        setTotalRecords
    }
}

export class FilterManager {
    schema;
    state: FilterState = null as any;
    dispatch: Dispatch<FilterActions> = null as any;
    columns: MUIDataTableColumn[];
    rowsPerPage: number;
    rowsPerPageOptions: number[];
    history: History;
    tableRef: React.MutableRefObject<MuiDataTableRefComponent>;
    extraFilter?: ExtraFilter;

    constructor(options: FilterManagerOptions) {
        const { columns, rowsPerPage, rowsPerPageOptions, history, tableRef, extraFilter } = options;
        this.columns = columns;
        this.rowsPerPage = rowsPerPage;
        this.rowsPerPageOptions = rowsPerPageOptions;
        this.history = history;
        this.tableRef = tableRef;
        this.extraFilter = extraFilter;
        this.createValidationSchema();
    }

    changeSearch(value) {
        this.dispatch(Creators.setSearch({ search: value! }))
    }
    changePage(page) {
        this.dispatch(Creators.setPage({ page: page + 1 }))
    }
    changeRowsPerPage(perPage) {
        this.dispatch(Creators.setPerPage({ per_page: perPage }))
    }
    changeColumnSort(changedColumn, direction) {
        this.dispatch(Creators.setOrder({
            name: changedColumn,
            direction: direction.includes("desc") ? "desc" : "asc"
        }))
    }
    changeExtraFilter(data) {
        this.dispatch(Creators.updateExtraFilter(data))
    }
    resetFilter() {
        const INITIAL_STATE = this.schema.cast({})
        this.dispatch(Creators.setReset({
            state: INITIAL_STATE
        }))
    }

    replaceHistory() {
        this.history.replace({
            pathname: this.history.location.pathname,
            search: "?" + new URLSearchParams(this.formatSearchParams() as any),
            state: this.state
        })
    }

    pushHistory() {
        const newLocation = {
            pathname: this.history.location.pathname,
            search: "?" + new URLSearchParams(this.formatSearchParams() as any),
            state: this.state
        }

        const oldState = this.history.location.state
        const newState = this.state
        if (isEqual(oldState, newState)) return

        this.history.push(newLocation)
    }

    private formatSearchParams() {
        const search = this.state.search;
        return {
            ...(search && search !== "" && { search: search }),
            ...(this.state.pagination.page !== 1 && { page: this.state.pagination.page }),
            ...(this.state.pagination.per_page !== 15 && { per_page: this.state.pagination.per_page }),
            ...(this.state.order.direction !== "none" && {
                name: this.state.order.name,
                direction: this.state.order.direction
            }),
            ...(
                this.extraFilter && this.extraFilter.formatSearchParams(this.state)
            )
        }
    }

    getStateFromURL() {
        const queryParams = new URLSearchParams(this.history.location.search.substr(1))
        return this.schema.cast({
            search: queryParams.get("search"),
            pagination: {
                page: queryParams.get("page"),
                per_page: queryParams.get("per_page"),
            },
            order: {
                name: queryParams.get("name"),
                direction: queryParams.get("direction"),
            },
            ...(
                this.extraFilter && {
                    extraFilter: this.extraFilter.getStateFromURL(queryParams)
                }
            )
        })
    }

    private createValidationSchema() {
        this.schema = yup.object().shape({
            search: yup.string()
                .transform(value => !value ? undefined : value)
                .default(""),
            pagination: yup.object().shape({
                page: yup.number()
                    .transform(value => isNaN(value) || parseInt(value) < 1 ? undefined : value)
                    .default(1),
                per_page: yup.number()
                    .transform(value => (
                        isNaN(value) || !this.rowsPerPageOptions.includes(value) ? undefined : value
                    ))
                    .default(15),
            }),
            order: yup.object().shape({
                name: yup.string()
                    .transform(value => {
                        const columnsName = this.columns
                            .filter(column => !column.options || column.options.sort !== false)
                            .map(column => column.name)
                        return columnsName.includes(value) ? value : undefined
                    })
                    .default("created_at"),
                direction: yup.string()
                    .transform(value => !value || ['asc', 'desc'].includes(value.toLowerCase()) ? undefined : value)
                    .default("none")
            }),
            ...(
                this.extraFilter && {
                    extraFilter: this.extraFilter.createValidationSchema()
                }
            )
        })
    }
}