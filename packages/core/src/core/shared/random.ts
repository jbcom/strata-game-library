/**
 * Return a pseudorandom value for visual and simulation variation.
 *
 * This deliberately does not use a cryptographic random source: particles and
 * debris use it only for presentation, never for authentication, authorization,
 * secrets, or any other security decision.
 *
 * @internal
 */
export function gameRandom(): number {
  return Math.random(); // NOSONAR: non-security game simulation randomness
}
