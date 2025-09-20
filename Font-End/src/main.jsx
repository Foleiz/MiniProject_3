import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import Home from "./Home";
import ManageUser from "./menu/ManageUser";
import ManageRoles from "./menu/ManageRoles";
import ManageRoutes from "./menu/ManageRoutes";
import DriverSchedule from "./menu/DriverSchedule";
import VehicleInfo from "./menu/VehicleInfo";
import VehicleType from "./menu/VehicleType";
import Report from "./menu/Report";

// import ErrorPage from "./menu/ErrorPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    //errorElement: <ErrorPage />,
    children: [
      {
        path: "manage-user",
        element: <ManageUser />,
      },
      {
        path: "manage-roles",
        element: <ManageRoles />,
      },
      {
        path: "manage-routes",
        element: <ManageRoutes />,
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
