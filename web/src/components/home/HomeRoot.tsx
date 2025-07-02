import type { homeQuery as HomeQueryType } from "@/__generated__/homeQuery.graphql";
import { HomeQuery } from "@/pages/home";
import { usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { Outlet, useLoaderData, useNavigate } from "react-router";

type HomeRootLoaderData = {
  homeQueryRef: PreloadedQuery<HomeQueryType>;
};

export default function HomeRoot() {
  const { homeQueryRef } = useLoaderData<HomeRootLoaderData>();
  const data = usePreloadedQuery<HomeQueryType>(HomeQuery, homeQueryRef);
  const navigate = useNavigate();

  if (data.me === null) {
    navigate("/sign-up", { replace: true });
    return;
  }

  return <Outlet context={{ homeQueryRef }} />;
}
