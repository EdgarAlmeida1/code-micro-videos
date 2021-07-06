import { Box, Fab } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { Page } from '../../components/Page';
import Table from './Table';

const List = () => {
    return (
        <Page title={"Listagem de membros do elenco"}>
            <Box dir={'rtl'}>
                <Fab
                    title="Adicionar membro do elenco"
                    size="small"
                    component={Link}
                    to="/cast_members/create"
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