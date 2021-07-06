import { RouteProps } from "react-router-dom"
import CategoryList from "../pages/categories/PageList";
import GenreList from "../pages/genres/PageList";
import CastMemberList from "../pages/cast_members/PageList";
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

    // Generos
    {
        name: 'genres.list',
        label: "Listar Gêneros",
        path: "/genres",
        component: GenreList,
        exact: true
    },

    // Membros do elenco
    {
        name: 'cast_members.list',
        label: "Listar Membros do Elenco",
        path: "/cast_members",
        component: CastMemberList,
        exact: true
    },
];

export default routes;