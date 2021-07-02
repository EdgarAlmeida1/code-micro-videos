import { RouteProps } from "react-router-dom"
import CategoryList from "../pages/category/List";
import Dashboard from "../pages/Dashboard";

interface MyRouteProps extends RouteProps{
    label: string
}

const routes: MyRouteProps[] = [
    {
        label: "Dashboard",
        path: "/",
        component: Dashboard,
        exact: true
    },
    {
        label: "Listar categorias",
        path: "/categories",
        component: CategoryList,
        exact: true
    }
];

export default routes;
