import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Content-Type": "application/json; charset=utf-8",
  "Vary": "Origin"
};

const allowedMemoryCategories = new Set(["preference", "goal", "personal_context", "communication_style"]);
const allowedLanguages = new Set(["en", "vi", "nl", "ms"]);
const allowedDepths = new Set(["introductory", "intermediate", "advanced"]);
const allowedTones = new Set(["concise", "conversational", "reflective", "technical", "supportive"]);

function respond(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}
function parseJson(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
function hasOwn(o: Record<string, unknown>, key: string) {
  return Object.prototype.hasOwnProperty.call(o, key);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders });
  if (!["GET", "POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
    return respond(405, { error: "method_not_allowed" });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return respond(401, { error: "authentication_required" });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const publishableKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!supabaseUrl || !publishableKey) return respond(500, { error: "server_configuration_missing" });

  const supabase = createClient(supabaseUrl, publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } }
  });

  const token = authHeader.slice("Bearer ".length);
  const { data: userData, error: authError } = await supabase.auth.getUser(token);
  const user = userData?.user;
  if (authError || !user) return respond(401, { error: "invalid_session" });

  const url = new URL(req.url);
  const segments = url.pathname.split("/").filter(Boolean);
  const functionIndex = segments.lastIndexOf("user-data-api");
  const routeSegments = functionIndex >= 0 ? segments.slice(functionIndex + 1) : segments;
  const resource = routeSegments[0] ?? "";
  const resourceId = routeSegments[1] ?? null;

  try {
    if (resource === "profile") {
      if (req.method === "GET") {
        const { data, error } = await supabase.from("ky_profiles").select("user_id,display_name,created_at,updated_at").eq("user_id", user.id).maybeSingle();
        if (error) throw error;
        return respond(200, { data });
      }
      if (req.method === "PUT") {
        const body = parseJson(await req.json());
        const displayName = body.display_name;
        if (displayName !== undefined && (typeof displayName !== "string" || displayName.trim().length > 120)) {
          return respond(400, { error: "invalid_display_name" });
        }
        const { data: currentProfile, error: currentProfileError } = await supabase.from("ky_profiles")
          .select("display_name").eq("user_id", user.id).maybeSingle();
        if (currentProfileError) throw currentProfileError;
        const { data, error } = await supabase.from("ky_profiles").upsert({
          user_id: user.id,
          display_name: displayName !== undefined ? (displayName.trim() || null) : (currentProfile?.display_name ?? null),
          updated_at: new Date().toISOString()
        }, { onConflict: "user_id" }).select("user_id,display_name,created_at,updated_at").single();
        if (error) throw error;
        return respond(200, { data });
      }
      return respond(405, { error: "method_not_allowed_for_profile" });
    }

    if (resource === "preferences") {
      if (req.method === "GET") {
        const { data, error } = await supabase.from("ky_user_preferences").select("*").eq("user_id", user.id).maybeSingle();
        if (error) throw error;
        return respond(200, { data });
      }
      if (req.method === "PUT") {
        const body = parseJson(await req.json());
        const allowed = ["personalization_enabled", "personal_context_enabled", "language", "knowledge_level", "tone"];
        for (const key of allowed) {
          if (!hasOwn(body, key)) continue;
          const value = body[key];
          if (key.endsWith("_enabled") && typeof value !== "boolean") return respond(400, { error: "invalid_" + key });
          if (key === "language" && (typeof value !== "string" || !allowedLanguages.has(value))) return respond(400, { error: "invalid_language" });
          if (key === "knowledge_level" && (typeof value !== "string" || !allowedDepths.has(value))) return respond(400, { error: "invalid_knowledge_level" });
          if (key === "tone" && (typeof value !== "string" || !allowedTones.has(value))) return respond(400, { error: "invalid_tone" });
        }
        const { data: currentPreferences, error: currentPreferencesError } = await supabase.from("ky_user_preferences")
          .select("*").eq("user_id", user.id).maybeSingle();
        if (currentPreferencesError) throw currentPreferencesError;
        const patch: Record<string, unknown> = {
          user_id: user.id,
          personalization_enabled: currentPreferences?.personalization_enabled ?? false,
          personal_context_enabled: currentPreferences?.personal_context_enabled ?? false,
          language: currentPreferences?.language ?? "en",
          knowledge_level: currentPreferences?.knowledge_level ?? "intermediate",
          tone: currentPreferences?.tone ?? "conversational",
          language_confirmed: currentPreferences?.language_confirmed ?? false,
          knowledge_level_confirmed: currentPreferences?.knowledge_level_confirmed ?? false,
          tone_confirmed: currentPreferences?.tone_confirmed ?? false,
          preferences_version: currentPreferences?.preferences_version ?? 1,
          updated_at: new Date().toISOString()
        };
        for (const key of allowed) if (hasOwn(body, key)) patch[key] = body[key];
        if (hasOwn(body, "language")) patch.language_confirmed = true;
        if (hasOwn(body, "knowledge_level")) patch.knowledge_level_confirmed = true;
        if (hasOwn(body, "tone")) patch.tone_confirmed = true;
        const { data, error } = await supabase.from("ky_user_preferences").upsert(patch, { onConflict: "user_id" }).select("*").single();
        if (error) throw error;
        return respond(200, { data });
      }
      return respond(405, { error: "method_not_allowed_for_preferences" });
    }

    if (resource === "charts") {
      if (req.method === "GET" && !resourceId) {
        const { data, error } = await supabase.from("ky_charts")
          .select("id,user_id,label,engine_name,engine_version,chart_fingerprint,is_primary,created_at,updated_at")
          .eq("user_id", user.id).order("created_at", { ascending: true });
        if (error) throw error;
        return respond(200, { data, creation_requires_deterministic_engine: true });
      }
      if (req.method === "GET" && resourceId) {
        const { data, error } = await supabase.from("ky_charts")
          .select("id,user_id,label,engine_name,engine_version,chart_fingerprint,is_primary,created_at,updated_at")
          .eq("user_id", user.id).eq("id", resourceId).maybeSingle();
        if (error) throw error;
        if (!data) return respond(404, { error: "chart_not_found" });
        return respond(200, { data });
      }
      if (req.method === "PATCH" && resourceId) {
        const body = parseJson(await req.json());
        const patch: Record<string, unknown> = {};
        if (hasOwn(body, "label")) {
          if (typeof body.label !== "string" || !body.label.trim() || body.label.trim().length > 120) return respond(400, { error: "invalid_chart_label" });
          patch.label = body.label.trim();
        }
        if (hasOwn(body, "is_primary")) {
          if (typeof body.is_primary !== "boolean") return respond(400, { error: "invalid_primary_flag" });
          patch.is_primary = body.is_primary;
        }
        if (!Object.keys(patch).length) return respond(400, { error: "no_supported_chart_fields" });
        const { data, error } = await supabase.from("ky_charts").update(patch)
          .eq("user_id", user.id).eq("id", resourceId)
          .select("id,user_id,label,engine_name,engine_version,chart_fingerprint,is_primary,created_at,updated_at").maybeSingle();
        if (error) throw error;
        if (!data) return respond(404, { error: "chart_not_found" });
        return respond(200, { data });
      }
      if (req.method === "DELETE" && resourceId) {
        const { data, error } = await supabase.from("ky_charts").delete()
          .eq("user_id", user.id).eq("id", resourceId).select("id").maybeSingle();
        if (error) throw error;
        if (!data) return respond(404, { error: "chart_not_found" });
        return respond(200, { deleted: true, id: data.id });
      }
      return respond(405, { error: "method_not_allowed_for_charts" });
    }

    if (resource === "conversations") {
      const conversationId = resourceId;
      const subresource = routeSegments[2] ?? null;
      if (req.method === "GET" && !conversationId) {
        const { data, error } = await supabase.from("ky_conversations")
          .select("id,user_id,chart_id,title,status,created_at,updated_at")
          .eq("user_id", user.id).neq("status", "deleted").order("updated_at", { ascending: false });
        if (error) throw error;
        return respond(200, { data });
      }
      if (req.method === "POST" && !conversationId) {
        const body = parseJson(await req.json());
        if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim().length > 200)) return respond(400, { error: "invalid_conversation_title" });
        if (body.chart_id !== undefined && body.chart_id !== null && (typeof body.chart_id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.chart_id))) return respond(400, { error: "invalid_chart_id" });
        const { data, error } = await supabase.from("ky_conversations").insert({
          user_id: user.id,
          chart_id: body.chart_id ?? null,
          title: typeof body.title === "string" && body.title.trim() ? body.title.trim() : null,
          status: "active"
        }).select("id,user_id,chart_id,title,status,created_at,updated_at").single();
        if (error) throw error;
        return respond(201, { data });
      }
      if (conversationId && subresource === "turns") {
        if (req.method === "GET") {
          const { data, error } = await supabase.from("ky_conversation_turns")
            .select("id,user_id,conversation_id,sequence_number,role,question,answer,factual_basis,knowledge_basis,relationship_basis,critic_result,reasoning_model,prompt_version,created_at")
            .eq("user_id", user.id).eq("conversation_id", conversationId).order("sequence_number", { ascending: true });
          if (error) throw error;
          return respond(200, { data });
        }
        if (req.method === "POST") {
          const body = parseJson(await req.json());
          if (typeof body.question !== "string" || !body.question.trim() || body.question.length > 12000) return respond(400, { error: "invalid_question" });
          const { data, error } = await supabase.rpc("ky_append_user_turn", {
            p_conversation_id: conversationId,
            p_question: body.question.trim()
          });
          if (error) {
            if (error.code === "P0002") return respond(404, { error: "conversation_not_found_or_inactive" });
            if (error.code === "42501") return respond(403, { error: "conversation_access_denied" });
            if (error.code === "22023") return respond(400, { error: "invalid_question" });
            throw error;
          }
          return respond(201, { data });
        }
        return respond(405, { error: "method_not_allowed_for_turns" });
      }
      if (conversationId && !subresource && req.method === "GET") {
        const { data, error } = await supabase.from("ky_conversations")
          .select("id,user_id,chart_id,title,status,created_at,updated_at")
          .eq("user_id", user.id).eq("id", conversationId).maybeSingle();
        if (error) throw error;
        if (!data) return respond(404, { error: "conversation_not_found" });
        return respond(200, { data });
      }
      if (conversationId && !subresource && req.method === "PATCH") {
        const body = parseJson(await req.json());
        const patch: Record<string, unknown> = {};
        if (hasOwn(body, "title")) {
          if (body.title !== null && (typeof body.title !== "string" || body.title.trim().length > 200)) return respond(400, { error: "invalid_conversation_title" });
          patch.title = typeof body.title === "string" && body.title.trim() ? body.title.trim() : null;
        }
        if (hasOwn(body, "status")) {
          if (!["active","archived","deleted"].includes(String(body.status))) return respond(400, { error: "invalid_conversation_status" });
          patch.status = body.status;
        }
        if (!Object.keys(patch).length) return respond(400, { error: "no_supported_conversation_fields" });
        const { data, error } = await supabase.from("ky_conversations").update(patch)
          .eq("user_id", user.id).eq("id", conversationId)
          .select("id,user_id,chart_id,title,status,created_at,updated_at").maybeSingle();
        if (error) throw error;
        if (!data) return respond(404, { error: "conversation_not_found" });
        return respond(200, { data });
      }
      if (conversationId && !subresource && req.method === "DELETE") {
        const { data, error } = await supabase.from("ky_conversations").delete()
          .eq("user_id", user.id).eq("id", conversationId).select("id").maybeSingle();
        if (error) throw error;
        if (!data) return respond(404, { error: "conversation_not_found" });
        return respond(200, { deleted: true, id: data.id });
      }
      return respond(405, { error: "method_not_allowed_for_conversations" });
    }

    if (resource === "memories") {
      if (req.method === "GET") {
        const { data, error } = await supabase.from("ky_user_memories")
          .select("id,category,value,origin,status,confidence,user_consent,user_confirmed,source_turn_id,created_at,confirmed_at,expires_at,updated_at")
          .eq("user_id", user.id).order("created_at", { ascending: false });
        if (error) throw error;
        return respond(200, { data });
      }
      if (req.method === "POST") {
        const body = parseJson(await req.json());
        if (typeof body.category !== "string" || !allowedMemoryCategories.has(body.category)) return respond(400, { error: "invalid_memory_category" });
        if (typeof body.value !== "string" || !body.value.trim() || body.value.trim().length > 2000) return respond(400, { error: "invalid_memory_value" });
        if (body.origin !== "explicit" && body.origin !== "inferred") return respond(400, { error: "invalid_memory_origin" });
        if (body.user_consent !== true) return respond(400, { error: "memory_consent_required" });
        if (body.origin === "explicit" && body.user_confirmed !== true) return respond(400, { error: "explicit_memory_confirmation_required" });
        if (typeof body.source_turn_id !== "string" || !/^[0-9a-f-]{36}$/i.test(body.source_turn_id)) return respond(400, { error: "memory_source_turn_required" });
        if (body.origin === "inferred" && (!Number.isFinite(body.confidence) || Number(body.confidence) < 0.8 || Number(body.confidence) > 1)) {
          return respond(400, { error: "inferred_memory_confidence_invalid" });
        }
        const confirmed = body.user_confirmed === true;
        const expiresAt = body.expires_at ?? null;
        if (expiresAt !== null && (typeof expiresAt !== "string" || !Number.isFinite(Date.parse(expiresAt)))) return respond(400, { error: "invalid_expiry" });
        const row = {
          user_id: user.id,
          category: body.category,
          value: body.value.trim(),
          origin: body.origin,
          confidence: body.origin === "explicit" ? 1 : Number(body.confidence),
          status: confirmed ? "active" : "proposed",
          user_consent: true,
          user_confirmed: confirmed,
          confirmed_at: confirmed ? new Date().toISOString() : null,
          source_turn_id: typeof body.source_turn_id === "string" ? body.source_turn_id : null,
          expires_at: expiresAt
        };
        const { data, error } = await supabase.from("ky_user_memories").insert(row)
          .select("id,category,value,origin,status,confidence,user_consent,user_confirmed,source_turn_id,created_at,confirmed_at,expires_at,updated_at").single();
        if (error) throw error;
        return respond(201, { data });
      }
      if (req.method === "DELETE" && !resourceId) {
        const { error } = await supabase.from("ky_user_memories").delete().eq("user_id", user.id);
        if (error) throw error;
        return respond(200, { deleted: true, scope: "all_user_memories" });
      }
      if (req.method === "PATCH" && resourceId) {
        const body = parseJson(await req.json());
        const { data: currentMemory, error: currentMemoryError } = await supabase.from("ky_user_memories")
          .select("user_consent,user_confirmed,origin").eq("user_id", user.id).eq("id", resourceId).maybeSingle();
        if (currentMemoryError) throw currentMemoryError;
        if (!currentMemory) return respond(404, { error: "memory_not_found" });
        const nextConsent = hasOwn(body, "user_consent") ? body.user_consent : currentMemory.user_consent;
        const nextConfirmed = hasOwn(body, "user_confirmed") ? body.user_confirmed : currentMemory.user_confirmed;
        const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (hasOwn(body, "value")) {
          if (typeof body.value !== "string" || !body.value.trim() || body.value.trim().length > 2000) return respond(400, { error: "invalid_memory_value" });
          patch.value = body.value.trim();
        }
        if (hasOwn(body, "category")) {
          if (typeof body.category !== "string" || !allowedMemoryCategories.has(body.category)) return respond(400, { error: "invalid_memory_category" });
          patch.category = body.category;
        }
        if (hasOwn(body, "expires_at")) {
          if (body.expires_at !== null && (typeof body.expires_at !== "string" || !Number.isFinite(Date.parse(body.expires_at)))) return respond(400, { error: "invalid_expiry" });
          patch.expires_at = body.expires_at;
        }
        if (hasOwn(body, "user_consent")) {
          if (body.user_consent !== true && body.user_consent !== false) return respond(400, { error: "invalid_user_consent" });
          patch.user_consent = body.user_consent;
          if (body.user_consent === false) patch.status = "superseded";
        }
        if (hasOwn(body, "user_confirmed")) {
          if (body.user_confirmed !== true && body.user_confirmed !== false) return respond(400, { error: "invalid_user_confirmation" });
          patch.user_confirmed = body.user_confirmed;
          patch.confirmed_at = body.user_confirmed ? new Date().toISOString() : null;
          if (body.user_confirmed === false) patch.status = "proposed";
          if (body.user_confirmed === true && nextConsent === true) patch.status = "active";
        }
        if (hasOwn(body, "status")) {
          if (!["proposed","active","superseded","deleted"].includes(String(body.status))) return respond(400, { error: "invalid_memory_status" });
          if (body.status === "active" && (nextConfirmed !== true || nextConsent !== true)) return respond(400, { error: "memory_confirmation_and_consent_required" });
          patch.status = body.status;
        }
        const { data, error } = await supabase.from("ky_user_memories").update(patch).eq("user_id", user.id).eq("id", resourceId)
          .select("id,category,value,origin,status,confidence,user_consent,user_confirmed,source_turn_id,created_at,confirmed_at,expires_at,updated_at").maybeSingle();
        if (error) throw error;
        if (!data) return respond(404, { error: "memory_not_found" });
        return respond(200, { data });
      }
      if (req.method === "DELETE" && resourceId && resourceId !== "memories") {
        const { data, error } = await supabase.from("ky_user_memories").delete().eq("user_id", user.id).eq("id", resourceId).select("id").maybeSingle();
        if (error) throw error;
        if (!data) return respond(404, { error: "memory_not_found" });
        return respond(200, { deleted: true, id: data.id });
      }
      return respond(405, { error: "method_not_allowed_for_memories" });
    }

    return respond(404, { error: "unknown_resource", supported_resources: ["profile","preferences","charts","conversations","memories"] });
  } catch (error) {
    // Do not return raw database errors, which can disclose schema details.
    console.error("user-data-api request failed", error instanceof Error ? error.message : "unknown_error");
    return respond(500, { error: "request_failed" });
  }
});
