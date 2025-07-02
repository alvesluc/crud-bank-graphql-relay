import { BadgeDollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HomeHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <BadgeDollarSign className="size-8" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Replica Woovi</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
