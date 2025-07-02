import type {
  UserRegisterWithEmailMutation,
  UserRegisterWithEmailMutation$data,
} from "@/__generated__/UserRegisterWithEmailMutation.graphql";
import { UserRegisterWithEmail } from "@/components/sign-up/UserRegisterWithEmailMutation";
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
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BadgeDollarSign,
  CircleCheckIcon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "react-relay";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const registerFormSchema = z.object({
  name: z
    .string({ message: "O nome é obrigatório." })
    .min(3, { message: "O nome deve ter no mínimo 3 caracteres." })
    .max(50, { message: "O nome deve ter no máximo 50 caracteres." }),

  email: z
    .string({ message: "O e-mail é obrigatório." })
    .email({ message: "Por favor, insira um e-mail válido." }),

  password: z
    .string({ message: "A senha é obrigatória." })
    .min(8, { message: "A senha deve ter no mínimo 8 caracteres." }),
});

export default function SignUpPage() {
  const navigate = useNavigate();
  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const toggleVisibility = () => setIsPasswordVisible((prev) => !prev);

  const [commitMutation, isMutationInFlight] =
    useMutation<UserRegisterWithEmailMutation>(UserRegisterWithEmail);

  function onSubmit(values: z.infer<typeof registerFormSchema>) {
    commitMutation({
      variables: {
        input: {
          name: values.name,
          email: values.email,
          password: values.password,
        },
      },
      onCompleted: ({
        UserRegisterWithEmail,
      }: UserRegisterWithEmailMutation$data) => {
        if (UserRegisterWithEmail?.error) {
          toast.error(UserRegisterWithEmail?.error);
          return;
        }

        toast.success("Sua conta foi criada!", {
          onAutoClose: () => {
            navigate("/home");
          },
          description: "Você será redirecionado para o sistema automaticamente",
          icon: <CircleCheckIcon size={16} />,
          action: {
            label: "Cancelar",
            onClick: () => {},
          },
        });
      },
    });
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
            <CardTitle className="text-xl">Crie sua conta</CardTitle>
            <CardDescription></CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...registerForm}>
              <form
                className="grid gap-4"
                onSubmit={registerForm.handleSubmit(onSubmit)}
              >
                <FormField
                  control={registerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Como devemos lhe chamar?"
                          required
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
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
                  control={registerForm.control}
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
                  Criar conta
                </Button>
                <div className="text-center text-sm">
                  Já possui uma conta?{" "}
                  <a href="#" className="underline underline-offset-4">
                    Entrar
                  </a>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
