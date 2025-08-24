import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';


const PublicRouter = () => {
    const token = localStorage.getItem('token');
    if (token) return <Navigate to="/login" />;
    return <Outlet />;
};

export default PublicRouter;