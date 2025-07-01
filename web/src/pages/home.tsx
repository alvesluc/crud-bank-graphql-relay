"use client";

import type { homeQuery as HomeQueryType } from "@/__generated__/homeQuery.graphql";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeDollarSign, CreditCard, Eye, EyeOff, Send } from "lucide-react";
import { useState } from "react";
import { graphql, usePreloadedQuery, type PreloadedQuery } from "react-relay";
import { useOutletContext } from "react-router";

export const HomeQuery = graphql`
  query homeQuery {
    me {
      id
      name
      balance
    }
  }
`;

type OutletContextType = {
  homeQueryRef: PreloadedQuery<HomeQueryType>;
};

export default function HomePage() {
  const { homeQueryRef } = useOutletContext<OutletContextType>();
  const data = usePreloadedQuery<HomeQueryType>(HomeQuery, homeQueryRef);

  const [showBalance, setShowBalance] = useState(true);

  const handleTransaction = async () => {};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <BadgeDollarSign className="h-8 w-8 text-emerald-600" />
              <h1 className="text-xl font-bold text-gray-900">Replica Woovi</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Bem-vindo, {data.me?.name}
              </span>
              <Button variant="outline" size="sm">
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Card do Saldo */}
          <Card className="lg:col-span-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Saldo da Conta
                </CardTitle>
                <CardDescription>Conta {data.me?.id}</CardDescription>
              </div>
              <CreditCard className="h-6 w-6 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {showBalance ? (
                      <p className="text-4xl font-bold text-emerald-600">
                        R${" "}
                        {data.me?.balance?.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    ) : (
                      <p className="text-4xl font-bold text-gray-400">••••••</p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowBalance(!showBalance)}
                      className="h-8 w-8 p-0"
                    >
                      {showBalance ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">Saldo Disponível</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card Enviar Dinheiro */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Send className="h-5 w-5 text-emerald-600" />
                <CardTitle>Enviar Dinheiro</CardTitle>
              </div>
              <CardDescription>
                Transfira dinheiro para outra conta instantaneamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransaction} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">ID do Destinatário</Label>
                  <Input
                    id="recipient"
                    type="text"
                    placeholder="Digite o ID da conta do destinatário"
                    value={""}
                    onChange={() => {}}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor (R$)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0,00"
                    value={""}
                    onChange={() => {}}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Dinheiro
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
