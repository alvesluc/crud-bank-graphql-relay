import { Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { graphql, useFragment } from "react-relay";
import type { AccountSummaryFragment$key } from "@/__generated__/AccountSummaryFragment.graphql";
import { formatCurrency } from "@/lib/formatCurrency";

type AccountSummaryProps = {
  user: AccountSummaryFragment$key;
};

const AccountSummaryFragment = graphql`
  fragment AccountSummaryFragment on User {
    email
    name
    balance
  }
`;

export default function AccountSummary({ user }: AccountSummaryProps) {
  const data = useFragment<AccountSummaryFragment$key>(
    AccountSummaryFragment,
    user
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5" />
          <span>Resumo da Conta</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">
              Nome Completo
            </Label>
            <p className="font-medium">{data.name}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">Email</Label>
            <p className="font-medium">{data.email}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-sm text-muted-foreground">
              Saldo Disponível
            </Label>
            <p className="text-2xl font-bold">
              {formatCurrency(data.balance!)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
