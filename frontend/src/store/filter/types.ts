import { AnyAction } from "redux"

export interface Pagination {
    page: number;
    per_page: number;
}

export interface Order {
    name: string;
    direction: "asc" | "desc" | "none";
}

export interface State {
    search: string | { value, [key: string]: any } | null;
    pagination: Pagination;
    order: Order;
    extraFilter?: { [key: string]: any }
}

export interface SetSearchAction extends AnyAction {
    payload: {
        search: string | { value, [key: string]: any } | null
    }
}

export interface SetPageAction extends AnyAction {
    payload: {
        page: number
    }
}

export interface SetPerPageAction extends AnyAction {
    payload: {
        per_page: number
    }
}

export interface SetOrderAction extends AnyAction {
    payload: {
        name: string,
        direction: 'asc' | 'desc' | 'none'
    }
}

export interface UpdateExtraFilterAction extends AnyAction {
    payload: {
        [key: string]: any
    }
}

export interface SetResetAction extends AnyAction {
    payload: {
        state: State
    }
}

export type Actions = SetSearchAction | SetPageAction | SetPerPageAction | SetOrderAction | SetResetAction | UpdateExtraFilterAction