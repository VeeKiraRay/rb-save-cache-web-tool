/**
 * Advances a Park-Miller (Lehmer) PRNG state by one step.
 *
 * Generates the next value in a Park–Miller (MINSTD) linear congruential
 * pseudo‑random sequence. This is used as the keystream for XOR decryption.
 *
 * @param data - Current PRNG state (must be in range [1, 2^31 − 2])
 * @returns Next PRNG state as an unsigned 32-bit integer
 */
const advanceSeed = (data: number): number => {
  // Constants for the Park–Miller LCG
  const Q = 127773;
  const R = 2836;
  // Split into high/low parts to avoid overflow
  const hi = Math.floor(data / Q);
  const lo = data - hi * Q;
  // Compute next state
  let num = lo * 16807 - hi * R;
  // Wrap if negative
  if (num <= 0) num += 2147483647;
  // Force unsigned 32‑bit
  return num >>> 0;
};

/**
 * Decrypts a byte array using a simple XOR stream cipher.
 * The first 4 bytes contain the initial seed for the LCG.
 * Each subsequent byte is XORed with the low 8 bits of the
 * next LCG output value.
 *
 * @param bytes - Encrypted data, starting with a 4‑byte seed
 * @returns The decrypted payload (all bytes after the seed)
 */
const streamDecrypt = (bytes: Uint8Array): Uint8Array => {
  // Read 32‑bit little‑endian seed
  let seed = bytes[0] | (bytes[1] << 8) | (bytes[2] << 16) | (bytes[3] << 24);
  seed >>>= 0; // ensure unsigned

  const out = new Uint8Array(bytes.length - 4);
  let state = seed;

  // XOR each byte with the LCG-generated keystream
  for (let i = 0; i < out.length; i++) {
    state = advanceSeed(state);
    out[i] = bytes[i + 4] ^ (state & 0xff); // use lowest byte of state
  }
  return out;
};

const SaveFileCryptUtil = {
  streamDecrypt,
};

export default SaveFileCryptUtil;
