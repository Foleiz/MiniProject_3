import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./Home";
import Show from "./Show";
import ManageRoles from "./ManageRoles";
import RoutesManage from "./RoutesManage";
import DriverSchedule from "./DriverSchedule";
import VehicleInfo from "./VehicleInfo";
import VehicleType from "./VehicleType";
import Report from "./report";

import ErrorPage from "./ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "show",
        element: <Show />,
      },
      {
        path: "manage-roles",
        element: <ManageRoles />,
      },
      {
        path: "routes-manage",
        element: <RoutesManage />,
      },
      {
        path: "driver-schedule",
        element: <DriverSchedule />,
      },
      {
        path: "vehicle-info",
        element: <VehicleInfo />,
      },
      {
        path: "vehicle-type",
        element: <VehicleType />,
      },
      {
        path: "report",
        element: <Report />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
