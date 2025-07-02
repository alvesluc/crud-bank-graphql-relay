import { type homeQuery as HomeQueryType } from "@/__generated__/homeQuery.graphql";
import AccountSummary from "@/components/home/AccountSummary";
import HomeHeader from "@/components/home/HomeHeader";
import TransactionForm from "@/components/home/TransactionForm";
import { graphql, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { useOutletContext } from "react-router";

export const HomeQuery = graphql`
  query homeQuery {
    me {
      ...AccountSummaryFragment
      ...TransactionFormFragment
    }
  }
`;

type OutletContextType = {
  homeQueryRef: PreloadedQuery<HomeQueryType>;
};

export default function HomePage() {
  const { homeQueryRef } = useOutletContext<OutletContextType>();
  const data = usePreloadedQuery<HomeQueryType>(HomeQuery, homeQueryRef);

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="mx-auto max-w-4xl space-y-6">
          <AccountSummary user={data.me!} />
          <TransactionForm user={data.me!} />
        </div>
      </div>
    </div>
  );
}
