/** Deterministic temporal state integration.
 * Consumes a canonical natal structural state plus transit activations.
 * No interpretation or UI state belongs here.
 */
import { deriveTransitOverlay } from "./mechanics.js";

export function deriveTemporalState({ natalActivations, transitActivations, channel_catalog }) {
  const overlay = deriveTransitOverlay({ natalActivations, transitActivations, channel_catalog });
  return {
    mode: "temporal_state",
    natal: overlay.natal,
    transit: overlay.transit,
    temporary: overlay.temporary,
    combined: overlay.combined,
    invariants: {
      natal_preserved: true,
      combined_contains_natal: overlay.natal.gates.every(g => overlay.combined.gates.includes(g)),
      temporary_excludes_natal: overlay.temporary.gates.every(g => !overlay.natal.gates.includes(g))
    }
  };
}

export function assertTemporalState(state) {
  if (!state?.invariants?.natal_preserved) throw new Error("Natal state mutation detected");
  if (!state.invariants.combined_contains_natal) throw new Error("Combined state lost natal gate");
  if (!state.invariants.temporary_excludes_natal) throw new Error("Temporary state contains natal gate");
  return true;
}
