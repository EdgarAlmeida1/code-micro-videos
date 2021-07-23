import { createActions, createReducer } from "reduxsauce";
import * as Typings from "./types";

export const {Types, Creators} = createActions<{
    SET_SEARCH: string,
    SET_PAGE: string,   
    SET_PER_PAGE: string,
    SET_ORDER: string,
    SET_RESET: string,
}, {
    setSearch(payload: Typings.SetSearchAction['payload']) : Typings.SetSearchAction
    setPage(payload: Typings.SetPageAction['payload']) : Typings.SetPageAction
    setPerPage(payload: Typings.SetPerPageAction['payload']) : Typings.SetPerPageAction
    setOrder(payload: Typings.SetOrderAction['payload']) : Typings.SetOrderAction
    setReset() : Typings.SetResetAction,
}>
({
    setSearch: ['payload'],
    setPage: ['payload'],
    setPerPage: ['payload'],
    setOrder: ['payload'],
    setReset: []
})

export const INITIAL_STATE : Typings.State = {
    search: "",
    pagination: {
        page: 1,
        per_page: 15
    },
    order: {
        name: "created_at",
        direction: 'none' as any // This will disable the arrows
    }
};

const reducer = createReducer(INITIAL_STATE, {
    [Types.SET_SEARCH]: setSearch,
    [Types.SET_PAGE]: setPage,
    [Types.SET_PER_PAGE]: setPerPage,
    [Types.SET_ORDER]: setOrder,
    [Types.SET_RESET]: setReset,
})

export default reducer;

function setSearch(state = INITIAL_STATE, action: Typings.SetSearchAction): Typings.State {
    return {
        ...state,
        search: action.payload.search,
        pagination: {
            ...state.pagination,
            page: 1
        }
    }
}
function setPage(state = INITIAL_STATE, action: Typings.SetPageAction): Typings.State {
    return {
        ...state,
        pagination: {
            ...state.pagination,
            page: action.payload.page
        }
    }
}
function setPerPage(state = INITIAL_STATE, action: Typings.SetPerPageAction): Typings.State {
    return {
        ...state,
        pagination: {
            ...state.pagination,
            page: 1,
            per_page: action.payload.per_page
        }
    }
}
function setOrder(state = INITIAL_STATE, action: Typings.SetOrderAction): Typings.State {
    return {
        ...state,
        pagination: {
            ...state.pagination,
            page: 1,
        },
        order: {
            name: action.payload.name,
            direction: action.payload.direction
        }
    }
}
function setReset(state = INITIAL_STATE, action: Typings.SetOrderAction): Typings.State {
    return {
        ...INITIAL_STATE,
    }
}