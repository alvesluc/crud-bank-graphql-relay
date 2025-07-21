import type { UserLoginWithEmailMutation } from "@/__generated__/UserLoginWithEmailMutation.graphql";
import { UserLoginWithEmail } from "@/components/login/UserLoginWithEmailMutation.tsx";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { BadgeDollarSign, EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-relay";
import { Link, useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const loginFormSchema = z.object({
  email: z
    .string({ message: "O e-mail é obrigatório." })
    .email({ message: "Por favor, insira um e-mail válido." }),
  password: z
    .string({ message: "A senha é obrigatória." })
    .min(1, { message: "A senha é obrigatória." }),
});

const defaultAccounts = [
  { email: "user1@mail.com", label: "User 1" },
  { email: "user2@mail.com", label: "User 2" },
];

export default function LoginPage() {
  const navigate = useNavigate();

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const toggleVisibility = () => setIsPasswordVisible((prev) => !prev);

  const [commitMutation, isMutationInFlight] =
    useMutation<UserLoginWithEmailMutation>(UserLoginWithEmail);

  function onSubmit(values: z.infer<typeof loginFormSchema>) {
    commitMutation({
      variables: {
        input: {
          email: values.email,
          password: values.password,
        },
      },
      onCompleted: ({ UserLoginWithEmail }) => {
        if (UserLoginWithEmail?.error) {
          toast.error(UserLoginWithEmail?.error);
          return;
        }

        navigate("/home");
      },
    });
  }

  function handleAccountSelect(selectedEmail: string) {
    loginForm.setValue("email", selectedEmail);
    loginForm.setValue("password", "password");
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <BadgeDollarSign className="size-4" />
          </div>
          Replica Woovi
        </a>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Entre na sua conta</CardTitle>
            <CardDescription>
              Digite suas credenciais ou selecione uma conta padrão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...loginForm}>
              <form
                className="grid gap-4"
                onSubmit={loginForm.handleSubmit(onSubmit)}
              >
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Contas Padrão</label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Essas contas funcionam apenas quando o servidor foi
                    previamente{" "}
                    <a
                    target="_blank"
                      href="https://github.com/alvesluc/crud-bank-graphql-relay/blob/main/README.md#3-start-the-development-server"
                      className="underline underline-offset-4 text-green-500"
                    >
                      configurado com dados de teste
                    </a>
                    .
                  </p>
                  <Select onValueChange={handleAccountSelect}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma conta padrão" />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultAccounts.map((account) => (
                        <SelectItem key={account.email} value={account.email}>
                          {account.label} - {account.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Ex.: joao@mail.com"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="password"
                            type={isPasswordVisible ? "text" : "password"}
                            placeholder="Senha"
                            required
                            {...field}
                          />
                          <button
                            className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
                            type="button"
                            onClick={toggleVisibility}
                          >
                            {isPasswordVisible ? (
                              <EyeOffIcon size={16} aria-hidden="true" />
                            ) : (
                              <EyeIcon size={16} aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isMutationInFlight}
                >
                  {isMutationInFlight ? "Entrando..." : "Entrar"}
                </Button>

                <div className="text-center text-sm">
                  Não possui uma conta?{" "}
                  <Link to="/sign-up" className="underline underline-offset-4">
                    Criar conta
                  </Link>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
