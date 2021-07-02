import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import routes from '.';

const AppRouter = () => {
    return (
        <Switch>
            {
                routes.map((route, key) => (
                    <Route 
                        key={key}
                        path={route.path}
                        component={route.component}
                        exact={route.exact === true}
                    />
                ))
            }
        </Switch>       
    );
};

export default AppRouter;