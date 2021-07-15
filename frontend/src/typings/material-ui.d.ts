import { ComponentNameToClassKey } from '@material-ui/core/styles/overrides';
import { PaletteOptions, Palette, PaletteColor } from "@material-ui/core/styles/createPalette"

declare module '@material-ui/core/styles/overrides' {
    interface ComponentNameToClassKey {
        MUIDataTable: any;
        MUIDataTableToolbar: any;
        MUIDataTableHeadCell: any;
        MUIDataTableLabel: any;
        MUIDataTableSelectCell: any;
        MUIDataTableBodyCell: any;
        MUIDataTableToolbarSelect: any;
        MUIDataTableBodyRow: any;
        MUIDataTablePagination: any;
    }
}

declare module '@material-ui/core/styles/createPalette' {
    interface Palette {
        success: PaletteColor
    }

    interface PaletteOptions {
        success?: PaletteColorOptions
    }
}