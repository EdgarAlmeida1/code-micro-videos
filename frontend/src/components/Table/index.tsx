import MUIDataTable, { MUIDataTableColumn, MUIDataTableOptions, MUIDataTableProps } from 'mui-datatables';
import * as React from 'react';
import { merge, omit, cloneDeep } from "lodash"
import { useTheme, Theme, MuiThemeProvider, CircularProgress } from '@material-ui/core';
import DebouncedTableSearch from './DebouncedTableSearch';

export interface TableColumn extends MUIDataTableColumn {
    width?: string
}

const makeDefaultOptions = (debouncedSearchTime?) : MUIDataTableOptions => ({
    print: false,
    download: false,
    textLabels: {
        body: {
            noMatch: "Nenhum registro encontrado",
            toolTip: "Classificar",
        },
        pagination: {
            next: "Próxima página",
            previous: "Página anterior",
            rowsPerPage: "Por página:",
            displayRows: "de",
        },
        toolbar: {
            search: "Busca",
            downloadCsv: "Download CSV",
            print: "Imprimir",
            viewColumns: "Ver Colunas",
            filterTable: "Filtrar Tabelas",
        },
        filter: {
            all: "Todos",
            title: "FILTROS",
            reset: "LIMPAR",
        },
        viewColumns: {
            title: "Ver Colunas",
            titleAria: "Ver/Esconder Colunas da Tabela",
        },
        selectedRows: {
            text: "registros(s) selecionados",
            delete: "Excluir",
            deleteAria: "Excluir registros selecionados",
        },
    },
    customSearchRender: (searchText: any,
        handleSearch: (text: string) => void,
        hideSearch: () => void,
        options: any) => {
        return <DebouncedTableSearch
            searchText={searchText}
            onHide={hideSearch}
            onSearch={handleSearch}
            options={options}
            debounceTime={debouncedSearchTime}
        />
    }
})

export interface MuiDataTableRefComponent {
    changePage: (page: number) => void;
    changeRowsPerPage: (rowsPerPage: number) => void;
}

export interface TableProps extends MUIDataTableProps {
    columns: TableColumn[];
    loading?: boolean;
    debouncedSearchTime?: number;
}

const Table = (props: TableProps) => {

    function extractMUIDataTableColumns(columns: TableColumn[]): MUIDataTableColumn[] {
        setColumnsWidth(columns);
        return columns.map(column => omit(column, 'width'))
    }

    function setColumnsWidth(columns: TableColumn[]) {
        columns.forEach((column, key) => {
            if (column.width) {
                const overrides = theme.overrides as any;
                overrides.MUIDataTableHeadCell.fixedHeader[`&:nth-child(${key + 2})`] = {
                    width: column.width
                }
            }
        })
    }

    function applyLoading() {
        newProps.options!.textLabels!.body!.noMatch =
            newProps.loading ? <CircularProgress /> : newProps.options?.textLabels?.body?.noMatch
    }

    function getOriginalMuiDataTableProps() {
        return omit(newProps, "loading")
    }

    const theme = cloneDeep<Theme>(useTheme());

    const defaultOptions = makeDefaultOptions(props.debouncedSearchTime)

    const newProps = merge(
        { options: cloneDeep(defaultOptions) },
        props,
        { columns: extractMUIDataTableColumns(props.columns) }
    );
    applyLoading()

    const originalProps = getOriginalMuiDataTableProps();

    return (
        <MuiThemeProvider theme={theme}>
            <MUIDataTable {...originalProps} />
        </MuiThemeProvider>
    );
};

export default Table;

export function makeActionStyles(column) {
    return theme => {
        const copyTheme = cloneDeep(theme);
        const selector = `&[data-testid^="MuiDataTableBodyCell-${column}"]`;
        copyTheme!.overrides!.MUIDataTableBodyCell!.root![selector] = {
            paddingTop: "0px",
            paddingBottom: "0px",
        }
        return copyTheme;
    }
}