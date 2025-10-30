import React, { createContext, useContext, useEffect, useRef } from "react";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";

import { events as detectEvents } from "@hypr/plugin-detect";
import { commands as localSttCommands, type SupportedSttModel } from "@hypr/plugin-local-stt";
import { commands as notificationCommands } from "@hypr/plugin-notification";
import * as main from "../store/tinybase/main";
import { createListenerStore, type ListenerStore } from "../store/zustand/listener";

const ListenerContext = createContext<ListenerStore | null>(null);

export const ListenerProvider = ({
  children,
  store,
}: {
  children: React.ReactNode;
  store: ListenerStore;
}) => {
  useAutoStartSTT();
  useHandleMuteAndStop(store);

  const storeRef = useRef<ListenerStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = store;
  }

  return (
    <ListenerContext.Provider value={storeRef.current}>
      {children}
    </ListenerContext.Provider>
  );
};

export const useListener = <T,>(
  selector: Parameters<
    typeof useStore<ReturnType<typeof createListenerStore>, T>
  >[1],
) => {
  const store = useContext(ListenerContext);

  if (!store) {
    throw new Error(
      "'useListener' must be used within a 'ListenerProvider'",
    );
  }

  return useStore(store, useShallow(selector));
};

function useAutoStartSTT() {
  const currentSttProvider = main.UI.useValue("current_stt_provider", main.STORE_ID);
  const currentSttModel = main.UI.useValue("current_stt_model", main.STORE_ID);

  useEffect(() => {
    if (currentSttProvider !== "hyprnote") {
      localSttCommands.stopServer("external");
      return;
    }

    const model = currentSttModel as SupportedSttModel | undefined;
    if (model && model.startsWith("am-")) {
      localSttCommands
        .stopServer("external")
        .then(() => new Promise((resolve) => setTimeout(resolve, 500)))
        .then(() => localSttCommands.startServer(model))
        .then(console.log)
        .catch(console.error);
    }
  }, [currentSttProvider, currentSttModel]);
}

const useHandleMuteAndStop = (store: ListenerStore) => {
  const stop = useStore(store, (state) => state.stop);
  const setMuted = useStore(store, (state) => state.setMuted);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let cancelled = false;
    let notificationTimerId: ReturnType<typeof setTimeout>;

    detectEvents.detectEvent.listen(({ payload }) => {
      if (payload.type === "micStarted") {
        notificationTimerId = setTimeout(() => {
          notificationCommands.showNotification({
            key: payload.key,
            title: "Mic Started",
            message: "Mic started",
            url: null,
            timeout: { secs: 8, nanos: 0 },
          });
        }, 2000);
      } else if (payload.type === "micStopped") {
        stop();
      } else if (payload.type === "micMuted") {
        setMuted(payload.value);
      }
    }).then((fn) => {
      if (cancelled) {
        fn();
      } else {
        unlisten = fn;
      }
    }).catch((err) => {
      console.error("Failed to setup detect event listener:", err);
    });

    return () => {
      cancelled = true;
      unlisten?.();
      if (notificationTimerId) {
        clearTimeout(notificationTimerId);
      }
    };
  }, [stop, setMuted]);
};
