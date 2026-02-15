export interface DtaObject {
  [key: string]: DtaValue;
}

export type DtaValue = string | number | boolean | DtaValue[] | DtaObject;
