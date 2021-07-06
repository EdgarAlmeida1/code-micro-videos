import { Box, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../../components/Page';
import Table from './Table';

const List = () => {
    return (
        <Page title={"Listagem de categorias"}>
            <Box dir={'rtl'}>
                <Fab
                    title="Adicionar categoria"
                    size="small"
                    component={Link}
                    to="/categories/create"
                >
                    <AddIcon />
                </Fab>
            </Box>
            <Box>
                <Table />
            </Box>
        </Page>
    );
};

export default List;