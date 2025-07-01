import { ReactRelayContext } from "react-relay";
import { AppEnvironment } from "./environment";
import { Suspense } from "react";

type ReactRelayProviderProps = {
  children: React.ReactNode;
};

export function RelayEnvironment({ children }: ReactRelayProviderProps) {
  return (
    <ReactRelayContext.Provider value={{ environment: AppEnvironment }}>
      <Suspense fallback={null}>{children}</Suspense>
    </ReactRelayContext.Provider>
  );
}
