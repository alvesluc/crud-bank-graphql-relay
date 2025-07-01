import type { RouteObject } from "react-router";
import SignUpPage from "@/pages/sign-up";
import HomeRoot from "./components/home/HomeRoot";
import { loadQuery } from "react-relay";
import { AppEnvironment } from "./relay/environment";
import HomePage, { HomeQuery } from "./pages/home";

export const routes: RouteObject[] = [
  {
    path: "/sign-up",
    element: <SignUpPage />,
  },
  {
    path: "/home",
    element: <HomeRoot />,
    loader: () => {
      const homeQueryRef = loadQuery(
        AppEnvironment,
        HomeQuery,
        {},
        { fetchPolicy: "store-or-network" }
      );

      return { homeQueryRef };
    },
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
];
