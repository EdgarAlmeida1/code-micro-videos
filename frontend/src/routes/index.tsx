import { RouteProps } from "react-router-dom"
import CategoryList from "../pages/categories/PageList";
import CategoryCreate from "../pages/categories/PageForm";
import GenreList from "../pages/genres/PageList";
import GenreCreate from "../pages/genres/PageForm";
import CastMemberList from "../pages/cast_members/PageList";
import CastMemberCreate from "../pages/cast_members/PageForm";
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
        label: "Criar categorias",
        path: "/categories/create",
        component: CategoryCreate,
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
        component: GenreCreate,
        exact: true
    },

    // Membros do elenco
    {
        name: 'cast_members.list',
        label: "Listar membros do elenco",
        path: "/cast_members",
        component: CastMemberList,
        exact: true
    },
    {
        name: 'cast_members.create',
        label: "Criar membros do elenco",
        path: "/cast_members/create",
        component: CastMemberCreate,
        exact: true
    },
];

export default routes;