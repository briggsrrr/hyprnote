import "@hypr/ui/globals.css";
import "./styles/globals.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode, useMemo } from "react";
import ReactDOM from "react-dom/client";
import { Provider as TinyBaseProvider, useStores } from "tinybase/ui-react";
import { createManager } from "tinytick";
import { Provider as TinyTickProvider, useCreateManager } from "tinytick/ui-react";

import { TaskManager } from "./components/task-manager";
import { type Store, STORE_ID, StoreComponent } from "./store/tinybase/main";

import { createToolRegistry } from "./contexts/tool-registry/core";
import { routeTree } from "./routeTree.gen";
import { createAITaskStore } from "./store/zustand/ai-task";
import { createListenerStore } from "./store/zustand/listener";

const toolRegistry = createToolRegistry();
const listenerStore = createListenerStore();
const queryClient = new QueryClient();

const router = createRouter({ routeTree, context: undefined });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

function App() {
  const stores = useStores();

  const store = stores[STORE_ID] as unknown as Store;

  const aiTaskStore = useMemo(() => {
    if (!store) {
      return null;
    }
    return createAITaskStore({ toolRegistry, persistedStore: store });
  }, [store]);

  if (!store || !aiTaskStore) {
    return null;
  }

  return (
    <RouterProvider
      router={router}
      context={{
        persistedStore: store,
        internalStore: store,
        listenerStore,
        aiTaskStore,
        toolRegistry,
      }}
    />
  );
}

function AppWithTiny() {
  const manager = useCreateManager(() => {
    return createManager().start();
  });

  return (
    <QueryClientProvider client={queryClient}>
      <TinyTickProvider manager={manager}>
        <TinyBaseProvider>
          <App />
          <StoreComponent />
          <TaskManager />
        </TinyBaseProvider>
      </TinyTickProvider>
    </QueryClientProvider>
  );
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <AppWithTiny />
    </StrictMode>,
  );
}
