enum PackageMagic {
  /** Console signed */
  CON = 0x434f4e20,
  /** Xbox Live Server Signed */
  LIVE = 0x4c495645,
  /** Xbox Distribution Signed */
  PIRS = 0x50495253,
  /** Unknown Magic */
  Unknown = 0x0fffffff,
}

export default PackageMagic;
