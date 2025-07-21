import HomeRoot from "@/components/home/HomeRoot";
import HomePage, { HomeQuery } from "@/pages/home";
import LoginPage from "@/pages/login";
import SignUpPage from "@/pages/sign-up";
import { AppEnvironment } from "@/relay/environment";
import { loadQuery } from "react-relay";
import type { RouteObject } from "react-router";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: <LoginPage />,
  },
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
