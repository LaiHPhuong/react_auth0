import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Outlet } from 'react-router-dom';

export const AuthMiddleware = () => {
    const Component = withAuthenticationRequired(Outlet, {
        onRedirecting: () => {
            return <h3>Loading</h3>;
        },
    });
    return <Component />;
};
