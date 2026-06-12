const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Maps an application property identifier to the numeric ID used by the
 * on-chain Escrow / Governance contracts.
 *
 * Properties are stored in Postgres with a text UUID primary key, but the
 * smart contracts key everything off a uint256 property ID. A UUID is a
 * 128-bit value, so we deterministically derive the on-chain ID by parsing
 * the UUID's hex digits as a big integer. Plain numeric IDs (or numeric
 * strings) are passed through unchanged.
 *
 * Returns `null` when the value can't be mapped to a numeric ID.
 */
export function toOnChainPropertyId(id: string | number | null | undefined): bigint | null {
  if (id === null || id === undefined) {
    return null;
  }

  if (typeof id === "number") {
    return Number.isInteger(id) && id >= 0 ? BigInt(id) : null;
  }

  const trimmed = id.trim();
  if (trimmed === "") {
    return null;
  }

  try {
    if (/^\d+$/.test(trimmed)) {
      return BigInt(trimmed);
    }

    if (UUID_PATTERN.test(trimmed)) {
      return BigInt(`0x${trimmed.replace(/-/g, "")}`);
    }
  } catch {
    return null;
  }

  return null;
}
