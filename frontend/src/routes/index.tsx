import { RouteProps } from "react-router-dom"
import CategoryList from "../pages/categories/PageList";
import CategoryForm from "../pages/categories/PageForm";
import GenreList from "../pages/genres/PageList";
import GenreForm from "../pages/genres/PageForm";
import CastMemberList from "../pages/cast_members/PageList";
import CastMemberForm from "../pages/cast_members/PageForm";
import Dashboard from "../pages/Dashboard";

export interface MyRouteProps extends RouteProps{
    name: string,
    label: string
}

const routes: MyRouteProps[] = [
    {
        name: 'dashboard',
        label: "Dashboard",
        path: "/",
        component: Dashboard,
        exact: true
    },

    // Categorias
    {
        name: 'categories.list',
        label: "Listar categorias",
        path: "/categories",
        component: CategoryList,
        exact: true
    },
    {
        name: 'categories.create',
        label: "Criar categoria",
        path: "/categories/create",
        component: CategoryForm,
        exact: true
    },
    {
        name: 'categories.edit',
        label: "Editar categoria",
        path: "/categories/:id/edit",
        component: CategoryForm,
        exact: true
    },

    // Generos
    {
        name: 'genres.list',
        label: "Listar gêneros",
        path: "/genres",
        component: GenreList,
        exact: true
    },
    {
        name: 'genres.create',
        label: "Criar gênero",
        path: "/genres/create",
        component: GenreForm,
        exact: true
    },
    {
        name: 'genres.edit',
        label: "Editar gênero",
        path: "/genres/:id/edit",
        component: GenreForm,
        exact: true
    },

    // Membros do elenco
    {
        name: 'cast_members.list',
        label: "Listar membros de elenco",
        path: "/cast_members",
        component: CastMemberList,
        exact: true
    },
    {
        name: 'cast_members.create',
        label: "Criar membro de elenco",
        path: "/cast_members/create",
        component: CastMemberForm,
        exact: true
    },
    {
        name: 'cast_members.edit',
        label: "Editar membro de elenco",
        path: "/cast_members/:id/edit",
        component: CastMemberForm,
        exact: true
    },
];

export default routes;