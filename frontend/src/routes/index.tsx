import { RouteProps } from "react-router-dom"
import CategoryList from "../pages/category/List";
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
        component: CategoryList,
        exact: true
    },
    {
        name: 'categories.edit',
        label: "Editar categoria",
        path: "/categories/:id/edit",
        component: CategoryList,
        exact: true
    }
];

export default routes;