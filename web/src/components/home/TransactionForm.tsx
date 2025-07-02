import type { TransactionFormFragment$key } from "@/__generated__/TransactionFormFragment.graphql";
import type {
  TransactionFormMutation,
  TransactionFormMutation$data,
} from "@/__generated__/TransactionFormMutation.graphql";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { createIdempotencyKey } from "@/lib/createIdempotencyKey";
import { formatCurrency } from "@/lib/formatCurrency";
import { zodResolver } from "@hookform/resolvers/zod";
import { BanknoteArrowUp, Send } from "lucide-react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { graphql, useFragment, useMutation } from "react-relay";
import { ROOT_ID } from "relay-runtime";
import { toast } from "sonner";
import { z } from "zod";

type TransactionFormProps = {
  user: TransactionFormFragment$key;
};

const TransactionFormFragment = graphql`
  fragment TransactionFormFragment on User {
    _id
  }
`;

const transactionFormSchema = z.object({
  receiverId: z
    .string({ message: "O ID do destinatário é obrigatório." })
    .min(1, { message: "O ID do destinatário não pode ser vazio." }),
  amount: z
    .string({ message: "O valor é obrigatório." })
    .min(1, { message: "O valor não pode ser vazio." })
    .refine(
      (val) => {
        const regex = /^\d+(,\d{2})?$/;
        if (!regex.test(val)) {
          return false;
        }

        const cleanedVal = val.replace(",", ".");
        const num = parseFloat(cleanedVal);

        return !isNaN(num) && num > 0;
      },
      {
        message: "Por favor, insira um valor válido (ex: 250,00).",
      }
    ),
});

export const TransactionTransfer = graphql`
  mutation TransactionFormMutation($input: TransactionTransferInput!) {
    TransactionTransfer(input: $input) {
      transaction {
        _id
        receiver {
          _id
        }
        amount
      }
      success
      error
      clientMutationId
    }
  }
`;

export default function TransactionForm({ user }: TransactionFormProps) {
  const data = useFragment<TransactionFormFragment$key>(
    TransactionFormFragment,
    user
  );

  const transactionForm = useForm<z.infer<typeof transactionFormSchema>>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      receiverId: "",
      amount: "",
    },
  });

  const [commitMutation, isMutationInFlight] =
    useMutation<TransactionFormMutation>(TransactionTransfer);

  async function onSubmit(values: z.infer<typeof transactionFormSchema>) {
    const { _id: senderId } = data;
    const { receiverId } = values;
    const amount = sanitizeAmount(values.amount);
    const idempotencyKey = await createIdempotencyKey(
      senderId,
      receiverId,
      amount
    );

    commitMutation({
      variables: {
        input: {
          senderId,
          receiverId,
          amount,
          idempotencyKey,
        },
      },
      onCompleted: ({ TransactionTransfer }: TransactionFormMutation$data) => {
        if (TransactionTransfer?.error) {
          toast.error(TransactionTransfer?.error);
          return;
        }

        transactionForm.reset();

        toast.success(`Transferência enviada com sucesso!`, {
          description: `Transferência para ${
            TransactionTransfer?.transaction?.receiver?._id
          } no valor de ${formatCurrency(
            TransactionTransfer!.transaction!.amount!
          )}`,
          icon: <BanknoteArrowUp size={16} />,
        });
      },
      updater: (store, response) => {
        if (response?.TransactionTransfer?.success) {
          const meRecord = store.get(ROOT_ID)?.getLinkedRecord("me");

          if (!meRecord) return;

          const currentBalance = meRecord.getValue("balance") as number;
          const newBalance = currentBalance - amount;

          meRecord.setValue(newBalance, "balance");
        }
      },
    });
  }

  function sanitizeAmount(amount: string): number {
    const sanitized = amount.replace(",", ".");
    const amountToTransfer = parseFloat(sanitized);

    return Math.round(amountToTransfer * 100);
  }

  const cleanAndFormatValue = (
    event: React.ChangeEvent<HTMLInputElement>,
    field: ControllerRenderProps<
      {
        receiverId: string;
        amount: string;
      },
      "amount"
    >
  ) => {
    let value = event.target.value;
    value = removeNonNumeric(value);
    value = handleMultipleCommas(value);
    value = limitDecimalPlaces(value);
    value = addLeadingZeroIfComma(value);
    field.onChange(value);
  };

  const removeNonNumeric = (value: string) => {
    return value.replace(/[^0-9,]/g, "");
  };

  const handleMultipleCommas = (value: string) => {
    const parts = value.split(",");
    if (parts.length > 2) {
      return parts[0] + "," + parts.slice(1).join("");
    }
    return value;
  };

  const limitDecimalPlaces = (value: string) => {
    const parts = value.split(",");
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + "," + parts[1].substring(0, 2);
    }
    return value;
  };

  const addLeadingZeroIfComma = (value: string) => {
    if (value.startsWith(",")) {
      return "0" + value;
    }
    return value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Nova Transferência ${data._id}</span>
        </CardTitle>
        <CardDescription>
          Realize transferências de forma rápida e segura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...transactionForm}>
          <form
            className="space-y-4"
            onSubmit={transactionForm.handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={transactionForm.control}
                name="receiverId"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="recipient-id">
                      ID do Destinatário
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="recipient-id"
                        placeholder="Digite o ID do destinatário"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={transactionForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel htmlFor="amount">Valor (R$)</FormLabel>
                    <FormControl>
                      <Input
                        id="amount"
                        placeholder="0,00"
                        {...field}
                        type="text"
                        onChange={(e) => cleanAndFormatValue(e, field)}
                        value={field.value}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                className="flex-1"
                disabled={isMutationInFlight}
              >
                <Send className="mr-2 h-4 w-4" />
                Confirmar Transferência
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 bg-transparent"
                onClick={() => transactionForm.reset()}
                disabled={isMutationInFlight}
              >
                Limpar Campos
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
