import { FieldsMap, PointCloudDataFieldValues } from "./pointCloudTypes";

export const getFieldsMap = (
  fields: PointCloudDataFieldValues[]
): FieldsMap => {
  return fields.reduce((acc, { name, ...rest }) => {
    acc[name as keyof FieldsMap] = { ...rest };
    return acc;
  }, {} as FieldsMap);
};
