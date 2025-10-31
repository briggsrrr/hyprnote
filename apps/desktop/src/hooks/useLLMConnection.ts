import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { fetch as tauriFetch } from "@tauri-apps/plugin-http";
import type { LanguageModel } from "ai";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "../auth";
import {
  type ProviderId,
  PROVIDERS,
} from "../components/settings/ai/llm/shared";
import { env } from "../env";
import * as main from "../store/tinybase/main";
import { commands as authCommands } from "@hypr/plugin-auth";

export const useLanguageModel = (): LanguageModel | null => {
  const connection = useLLMConnection();

  return useMemo(() => {
    if (!connection) {
      return null;
    }

    if (connection.providerId === "hyprnote") {
      const hyprnoteProvider = createOpenAICompatible({
        fetch: tauriFetch,
        name: "hyprnote",
        baseURL: connection.baseUrl,
        apiKey: connection.apiKey,
        headers: {
          Authorization: `Bearer ${connection.apiKey}`,
        },
      });

      return hyprnoteProvider.chatModel(connection.modelId);
    }

    if (connection.providerId === "anthropic") {
      const anthropicProvider = createAnthropic({
        fetch: tauriFetch,
        apiKey: connection.apiKey,
      });

      return anthropicProvider(connection.modelId);
    }

    if (connection.providerId === "openrouter") {
      const openRouterProvider = createOpenRouter({
        fetch: tauriFetch,
        apiKey: connection.apiKey,
      });

      return openRouterProvider(connection.modelId);
    }

    if (connection.providerId === "openai") {
      const openAIProvider = createOpenAI({
        fetch: tauriFetch,
        apiKey: connection.apiKey,
      });

      return openAIProvider(connection.modelId);
    }

    const config: Parameters<typeof createOpenAICompatible>[0] = {
      fetch: tauriFetch,
      name: connection.providerId,
      baseURL: connection.baseUrl,
    };

    if (connection.apiKey) {
      config.apiKey = connection.apiKey;
    }

    const openAICompatibleProvider = createOpenAICompatible(config);

    return openAICompatibleProvider.chatModel(connection.modelId);
  }, [connection]);
};

const useLLMConnection = (): {
  providerId: ProviderId;
  modelId: string;
  baseUrl: string;
  apiKey: string;
} | null => {
  const auth = useAuth();
  const [vaultApiKey, setVaultApiKey] = useState<string>("");

  const { current_llm_provider, current_llm_model } = main.UI.useValues(
    main.STORE_ID
  );
  const providerConfig = main.UI.useRow(
    "ai_providers",
    current_llm_provider ?? "",
    main.STORE_ID
  ) as main.AIProviderStorage | undefined;

  useEffect(() => {
    const fetchKey = async () => {
      const fallbackProviderId = env.VITE_BYOM_BASE_URL
        ? ("custom" as ProviderId)
        : ("" as ProviderId);
      const effectiveProviderId =
        (current_llm_provider as ProviderId) || fallbackProviderId;
      const providerDefinition = PROVIDERS.find(
        (p) => p.id === effectiveProviderId
      );
      const hasApiKeyRequirement = providerDefinition?.apiKey ?? true;
      const hasApiKeyInStore = !!providerConfig?.api_key?.trim();
      if (
        effectiveProviderId &&
        effectiveProviderId !== "hyprnote" &&
        hasApiKeyRequirement &&
        !hasApiKeyInStore
      ) {
        try {
          const key = await authCommands.getFromVault("twenty-api-key" as any);
          setVaultApiKey(key || "");
        } catch {
          setVaultApiKey("");
        }
      }
    };
    fetchKey();
  }, [current_llm_provider, providerConfig]);

  return useMemo(() => {
    const fallbackProviderId = env.VITE_BYOM_BASE_URL
      ? ("custom" as ProviderId)
      : ("" as ProviderId);
    const providerId =
      (current_llm_provider as ProviderId) || fallbackProviderId;
    const modelId = current_llm_model || env.VITE_BYOM_MODEL || "";

    console.log("[useLLMConnection] Debug:", {
      env_base_url: env.VITE_BYOM_BASE_URL,
      env_model: env.VITE_BYOM_MODEL,
      env_api_key: env.VITE_BYOM_API_KEY ? "present" : "missing",
      current_llm_provider,
      current_llm_model,
      providerId,
      modelId,
    });

    if (!providerId || !modelId) {
      console.log("[useLLMConnection] Returning null - no provider or model");
      return null;
    }

    const providerDefinition = PROVIDERS.find(
      (provider) => provider.id === providerId
    );

    if (providerId === "hyprnote") {
      if (!auth?.session || !env.VITE_SUPABASE_URL) {
        return null;
      }

      const baseUrl = `${env.VITE_SUPABASE_URL}${
        providerDefinition?.baseUrl || ""
      }`;
      const apiKey = auth.session.access_token;

      return {
        providerId,
        modelId,
        baseUrl,
        apiKey,
      };
    }

    const envBaseUrl = env.VITE_BYOM_BASE_URL?.trim() || "";
    const envApiKey = env.VITE_BYOM_API_KEY?.trim() || "";
    const baseUrl =
      providerConfig?.base_url?.trim() ||
      providerDefinition?.baseUrl ||
      envBaseUrl;
    const apiKey =
      providerConfig?.api_key?.trim() || vaultApiKey || envApiKey || "";

    if (!baseUrl) {
      return null;
    }

    if ((providerDefinition?.apiKey ?? true) && !apiKey) {
      console.log("[useLLMConnection] Returning null - no API key");
      return null;
    }

    const result = {
      providerId,
      modelId,
      baseUrl,
      apiKey: apiKey ? "present" : "missing",
    };
    console.log("[useLLMConnection] Returning connection:", result);

    return {
      providerId,
      modelId,
      baseUrl,
      apiKey,
    };
  }, [
    current_llm_provider,
    current_llm_model,
    providerConfig,
    vaultApiKey,
    auth,
  ]);
};
