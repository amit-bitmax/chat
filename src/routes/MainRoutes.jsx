import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Suspense, lazy } from "react";
import InboxDetail from "../main/email/InboxDetail";


// ✅ Lazy load pages
const Login = lazy(() => import("../pages/public/Login"));
const AdminDashboard = lazy(() => import("../pages/private/admin/AdminDashboard"));
const AgentDashboard = lazy(() => import("../pages/private/agent/Dashboard"));
const QaDashboard = lazy(() => import("../pages/private/qa/QaDashboard"));
const Home = lazy(() => import("../pages/private/customer/Home"));
const Inbox = lazy(() => import("../main/email/Inbox"));
const Chat = lazy(() => import("../main/chat/Chat"));
// ✅ Lazy load routers
const PublicRouter = lazy(() => import("./router/PublicRouter"));
const ProtectedRouter = lazy(() => import("./router/ProtectedRouter"));
const CustomerRouter = lazy(() => import("./router/CustomerRouter"));

// ✅ Route children configs
const adminChildren = [{ path: "", index: true, element: <AdminDashboard /> }];
const qaChildren = [
  { path: "", index: true, element: <QaDashboard /> },

];
const agentChildren = [
  {path:"dashboard", index: true, element: <AgentDashboard /> },
  { path: "chat", element: <Chat /> }, 
  { path: "inbox", element: <Inbox /> },
  { path: "inbox/:ticketId", element: <InboxDetail /> },
  // { path: "analytics/customers", element: <Customers /> }, 
  // { path: "reports/performance", element: <Performance /> }, 
  // { path: "reports/activity", element: <Activity /> }, 
];
const customerChildren = [{ path: "", index: true, element: <Home /> }];

// ✅ Main Router
const routers = createBrowserRouter([
  {
    path: "/login",
    element: <PublicRouter />,
    children: [{ path: "", index: true, element: <Login /> }],
  },
  {
    path: "/admin",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRouter allowedRoles={["Admin"]} />
      </Suspense>
    ),
    children: adminChildren,
  },
  {
    path: "/qa",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRouter allowedRoles={["QA"]} />
      </Suspense>
    ),
    children: qaChildren,
  },
  {
    path: "/agent",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <ProtectedRouter allowedRoles={["Agent"]} />
      </Suspense>
    ),
    children: agentChildren,
  },
  {
    path: "/customer",
    element: (
      <Suspense fallback={<div>Loading...</div>}>
        <CustomerRouter allowedRoles={["Customer"]} />
      </Suspense>
    ),
    children: customerChildren,
  },
]);

export default function MainRoutes() {
  return (
    <Suspense fallback={<div>Loading app...</div>}>
      <RouterProvider router={routers} />
    </Suspense>
  );
}
