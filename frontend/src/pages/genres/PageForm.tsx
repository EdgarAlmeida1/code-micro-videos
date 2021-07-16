import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Page } from '../../components/Page';
import { Form } from './Form';

const PageForm = () => {
    const { id } = useParams<{ id }>();

    return (
        <Page title={id ? "Editar gênero" : "Criar gênero"}>
            <Form />
        </Page>
    );
};

export default PageForm;