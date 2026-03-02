const STFSConstants = {
  /** Sentinel value for end-of-chain */
  STFSEnd: 0xffffff,
  /** Block levels: [L0 entries, L1 entries, L2 max] */
  BlockLevel: [0xaa, 0x70e4, 0x4af768] as readonly [number, number, number],
};

export default STFSConstants;
