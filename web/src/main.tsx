import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { Toaster } from "sonner";
import "./index.css";
import { RelayEnvironment } from "./relay/RelayEnvironmentProvider.tsx";
import { routes } from "@/routes.tsx";

const router = createBrowserRouter(routes);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RelayEnvironment>
      <RouterProvider router={router} />
      <Toaster richColors={true} theme="light" />
    </RelayEnvironment>
  </StrictMode>
);
