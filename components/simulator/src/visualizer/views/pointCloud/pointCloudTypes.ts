export interface PointCloudDataFieldValues {
  name: string;
  count: number;
  datatype: number;
  offset: number;
}

export interface PointCloudData {
  data: Uint8Array;
  point_step: number;
  fields: PointCloudDataFieldValues[];
  is_bigendian: boolean;
}

export interface FieldsMapFieldValues {
  count: number;
  datatype: number;
  offset: number;
}

export interface FieldsMap {
  x: FieldsMapFieldValues;
  y: FieldsMapFieldValues;
  z: FieldsMapFieldValues;
  time: FieldsMapFieldValues;
  ring: FieldsMapFieldValues;
  intensity: FieldsMapFieldValues;
  rgb: FieldsMapFieldValues;
}
