import { createBrowserRouter, RouterProvider } from "react-router-dom";

import PublicRouter from "./router/PublicRouter";
import ProtectedRouter from "./router/ProtectedRouter";

import Login from "../pages/public/Login";
import AdminDashboard from "../pages/private/admin/AdminDashboard";
import AgentDashboard from "../pages/private/agent/AgentDashboard";
import QaDashboard from "../pages/private/qa/QaDashboard";
import Home from "../pages/private/customer/Home";
import CustomerRouter from "./router/CustomerRouter";

const routers = createBrowserRouter([
  {
    path: "/login",
    element: <PublicRouter />,
    children: [{ path: "", index: true, element: <Login /> }],
  },
  {
    path: "/admin",
    element: <ProtectedRouter allowedRoles={["Admin"]} />,
    children: [{ path: "", index: true, element: <AdminDashboard /> }],
  },
  {
    path: "/qa",
    element: <ProtectedRouter allowedRoles={["QA"]} />,
    children: [{ path: "", index: true, element: <QaDashboard /> }],
  },
  {
    path: "/agent",
    element: <ProtectedRouter allowedRoles={["Agent"]} />,
    children: [{ path: "", index: true, element: <AgentDashboard /> }],
  },
  {
    path: "/customer",
    element: <CustomerRouter allowedRoles={["Customer"]} />,
    children: [{ path: "", index: true, element: <Home /> }],
  },
]);

export default function MainRoutes() {
  return <RouterProvider router={routers} />;
}
