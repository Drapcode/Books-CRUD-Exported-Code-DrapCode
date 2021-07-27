export const FieldTypes = {
  text: {
    id: 'text',
    validation: { min: 1, max: 20 },
  },
  large_text: {
    id: 'large_text',
    validation: { min: 20, max: 140 },
  },
  number: {
    id: 'number',
    validation: { min: 20, max: 140 },
  },
  date: {
    id: 'date',
  },
  password: {
    id: 'password',
  },
  color: {
    id: 'color',
  },
  file: {
    id: 'file',
  },
  reference: {
    id: 'reference',
  },
  belongsTo: {
    id: 'belongsTo',
  },
  multi_reference: {
    id: 'multi_reference',
  },
  image: {
    id: 'image',
  },
  multi_image: {
    id: 'multi_image',
  },
  video_link: {
    id: 'video_link',
  },
  boolean: {
    id: 'boolean',
  },
  createdAt: {
    id: 'createdAt',
  },
  updatedAt: {
    id: 'updatedAt',
  },
  createdBy: {
    id: 'createdBy',
  },
  isDeleted: {
    id: 'isDeleted',
  },
  dynamic_option: {
    id: 'dynamic_option',
  },
  static_option: {
    id: 'static_option',
  },
  uuid: {
    id: 'uuid',
  },
};

export const filterFieldsForForm = (fields) => {
  return fields.filter((field) => {
    return (
      field.type !== FieldTypes.createdBy.id &&
      field.type !== FieldTypes.uuid.id &&
      field.type !== FieldTypes.updatedAt.id &&
      field.type !== FieldTypes.createdAt.id &&
      field.type !== FieldTypes.isDeleted.id
    );
  });
};
export const filterFieldsForItemList = (fields) => {
  return fields.filter((field) => {
    return (
      field.type !== FieldTypes.createdBy.id &&
      field.type !== FieldTypes.uuid.id &&
      field.type !== FieldTypes.isDeleted.id
    );
  });
};
