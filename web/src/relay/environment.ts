import {
  Environment,
  type IEnvironment,
  Network,
  RecordSource,
  Store,
} from "relay-runtime";
import { fetchGraphQl } from "./fetchGraphQL";

function createEnvironmentInternal(): IEnvironment {
  const network = Network.create(fetchGraphQl);
  const store = new Store(new RecordSource());
  return new Environment({ store, network });
}

export const AppEnvironment = createEnvironmentInternal();
