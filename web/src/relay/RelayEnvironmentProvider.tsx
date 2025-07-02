import { ReactRelayContext } from "react-relay";
import { AppEnvironment } from "./environment";
import { Suspense } from "react";

type ReactRelayProviderProps = {
  children: React.ReactNode;
};

export function RelayEnvironmentProvider({ children }: ReactRelayProviderProps) {
  return (
    <ReactRelayContext.Provider value={{ environment: AppEnvironment }}>
      <Suspense fallback={null}>{children}</Suspense>
    </ReactRelayContext.Provider>
  );
}
