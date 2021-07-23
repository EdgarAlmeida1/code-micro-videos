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
    search: string | {value, [key: string]: any} | null;
    pagination: Pagination;
    order: Order;
}

export interface SetSearchAction extends AnyAction {
    payload: {
        search: string | {value, [key: string]: any} | null
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

export interface SetResetAction extends AnyAction {
    
}

export type Actions = SetSearchAction | SetPageAction | SetPerPageAction | SetOrderAction | SetResetAction