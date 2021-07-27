export const filters = {
  findAllNewBook: {
    query: [
      {
        $lookup: {
          from: 'user',
          let: { createdBy: '$createdBy' },
          pipeline: [
            { $match: { $expr: { $eq: ['$uuid', '$$createdBy'] } } },
            { $project: { _id: 0, password: 0 } },
          ],
          as: 'createdBy',
        },
      },
      { $skip: 'skip' },
      { $limit: 'limit' },
    ],
    countQuery: [{ $group: { _id: null, count: { $sum: 1 } } }],
    orderBy: 'asc',
    isPrivate: false,
    selector: 'FIND_ALL',
  },
  findAllNewBookByCategoryNovel: {
    query: [
      { $match: { $and: [{ $or: [{ book_category: { $in: ['Novel'] } }] }] } },
      {
        $lookup: {
          from: 'user',
          let: { createdBy: '$createdBy' },
          pipeline: [
            { $match: { $expr: { $eq: ['$uuid', '$$createdBy'] } } },
            { $project: { _id: 0, password: 0 } },
          ],
          as: 'createdBy',
        },
      },
      { $skip: 'skip' },
      { $limit: 'limit' },
    ],
    countQuery: [
      { $match: { $and: [{ $or: [{ book_category: { $in: ['Novel'] } }] }] } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ],
    orderBy: 'desc',
    sortBy: 'book_title',
    isPrivate: false,
    selector: 'FIND_ALL',
  },
  findAllNewBookByCategoryActionAndAdventure: {
    query: [
      { $match: { $and: [{ $or: [{ book_category: { $in: ['Action and Adventure'] } }] }] } },
      {
        $lookup: {
          from: 'user',
          let: { createdBy: '$createdBy' },
          pipeline: [
            { $match: { $expr: { $eq: ['$uuid', '$$createdBy'] } } },
            { $project: { _id: 0, password: 0 } },
          ],
          as: 'createdBy',
        },
      },
      { $skip: 'skip' },
      { $limit: 'limit' },
    ],
    countQuery: [
      { $match: { $and: [{ $or: [{ book_category: { $in: ['Action and Adventure'] } }] }] } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ],
    orderBy: 'desc',
    sortBy: 'book_title',
    isPrivate: false,
    selector: 'FIND_ALL',
  },
  findAllNewBookByCategoryComicBook: {
    query: [
      { $match: { $and: [{ $or: [{ book_category: { $in: ['Comic Book'] } }] }] } },
      {
        $lookup: {
          from: 'user',
          let: { createdBy: '$createdBy' },
          pipeline: [
            { $match: { $expr: { $eq: ['$uuid', '$$createdBy'] } } },
            { $project: { _id: 0, password: 0 } },
          ],
          as: 'createdBy',
        },
      },
      { $skip: 'skip' },
      { $limit: 'limit' },
    ],
    countQuery: [
      { $match: { $and: [{ $or: [{ book_category: { $in: ['Comic Book'] } }] }] } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ],
    sortBy: 'book_title',
    orderBy: 'desc',
    isPrivate: false,
    selector: 'FIND_ALL',
  },
  findAllNewBookByCategoryHistoricalFiction: {
    query: [
      { $match: { $and: [{ $or: [{ book_category: { $in: ['Historical Fiction'] } }] }] } },
      {
        $lookup: {
          from: 'user',
          let: { createdBy: '$createdBy' },
          pipeline: [
            { $match: { $expr: { $eq: ['$uuid', '$$createdBy'] } } },
            { $project: { _id: 0, password: 0 } },
          ],
          as: 'createdBy',
        },
      },
      { $skip: 'skip' },
      { $limit: 'limit' },
    ],
    countQuery: [
      { $match: { $and: [{ $or: [{ book_category: { $in: ['Historical Fiction'] } }] }] } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ],
    sortBy: 'book_title',
    orderBy: 'desc',
    selector: 'FIND_ALL',
  },
};

export const fields = [
  {
    required: false,
    staticOptions: [],
    unique: false,
    isMultiSelect: false,
    isPluginField: false,
    type: 'createdAt',
    fieldTitle: {
      en: 'Created At',
    },
    placeholder: {
      en: '',
    },
    fieldName: 'createdAt',
  },
  {
    required: false,
    staticOptions: [],
    unique: false,
    isMultiSelect: false,
    isPluginField: false,
    type: 'updatedAt',
    fieldTitle: {
      en: 'Updated At',
    },
    placeholder: {
      en: '',
    },
    fieldName: 'updatedAt',
  },
  {
    required: false,
    staticOptions: [],
    unique: false,
    isMultiSelect: false,
    isPluginField: false,
    type: 'createdBy',
    fieldTitle: {
      en: 'Created By',
    },
    placeholder: {
      en: '',
    },
    fieldName: 'createdBy',
    refCollection: {
      collectionName: 'user',
      collectionField: 'userName',
      displayType: 'dropdown',
    },
  },
  {
    required: false,
    staticOptions: [],
    unique: false,
    isMultiSelect: false,
    isPluginField: false,
    type: 'uuid',
    fieldTitle: {
      en: 'Id',
    },
    placeholder: {
      en: '',
    },
    fieldName: 'uuid',
  },
  {
    required: false,
    staticOptions: [],
    unique: false,
    isMultiSelect: false,
    isPluginField: false,
    type: 'isDeleted',
    fieldTitle: {
      en: 'Is Deleted',
    },
    placeholder: {
      en: '',
    },
    fieldName: 'isDeleted',
  },
  {
    required: true,
    staticOptions: [],
    unique: true,
    isMultiSelect: false,
    isPluginField: false,
    fieldTitle: {
      en: 'Book Title',
    },
    type: 'text',
    placeholder: {
      en: 'Book Title',
    },
    validation: {
      min: 1,
      max: 200,
      regex: '',
      allowedFileTypes: [],
      noAllowedFiles: 1,
    },
    refCollection: {
      collectionName: '',
      collectionField: '',
      displayType: 'dropdown',
      parentCollectionField: '',
      isShowAsText: false,
    },
    extraFieldSetting: {
      dateDisplayType: 'date',
      textareaDisplayType: 'text-area',
    },
    fieldName: 'book_title',
  },
  {
    required: false,
    staticOptions: [],
    unique: false,
    isMultiSelect: false,
    isPluginField: false,
    fieldTitle: {
      en: 'Book publisher',
    },
    type: 'text',
    placeholder: {
      en: 'Book publisher',
    },
    validation: {
      min: 1,
      max: 200,
      regex: '',
      allowedFileTypes: [],
      noAllowedFiles: 1,
    },
    refCollection: {
      collectionName: '',
      collectionField: '',
      displayType: 'dropdown',
      parentCollectionField: '',
      isShowAsText: false,
    },
    extraFieldSetting: {
      dateDisplayType: 'date',
      textareaDisplayType: 'text-area',
    },
    fieldName: 'book_publisher',
  },
  {
    required: false,
    staticOptions: [],
    unique: false,
    isMultiSelect: false,
    isPluginField: false,
    fieldTitle: {
      en: 'Book Author',
    },
    type: 'text',
    placeholder: {
      en: 'Book Author',
    },
    validation: {
      min: 1,
      max: 100,
      regex: '',
      allowedFileTypes: [],
      noAllowedFiles: 1,
    },
    refCollection: {
      collectionName: '',
      collectionField: '',
      displayType: 'dropdown',
      parentCollectionField: '',
      isShowAsText: false,
    },
    extraFieldSetting: {
      dateDisplayType: 'date',
      textareaDisplayType: 'text-area',
    },
    fieldName: 'book_author',
  },
  {
    required: false,
    staticOptions: [
      'Action and Adventure',
      'Classics',
      'Comic Book',
      'Novel',
      'Historical Fiction',
    ],
    unique: false,
    isMultiSelect: false,
    isPluginField: false,
    fieldTitle: {
      en: 'Book Category',
    },
    type: 'static_option',
    placeholder: {
      en: 'Book Category',
    },
    validation: {
      min: '',
      max: '',
      regex: '',
      allowedFileTypes: [],
      noAllowedFiles: 1,
    },
    refCollection: {
      collectionName: '',
      collectionField: '',
      displayType: 'dropdown',
      parentCollectionField: '',
      isShowAsText: false,
    },
    extraFieldSetting: {
      dateDisplayType: 'date',
      textareaDisplayType: 'text-area',
    },
    fieldName: 'book_category',
  },
  {
    required: false,
    staticOptions: [
      'Action and Adventure',
      'Classics',
      'Comic Book',
      'Novel',
      'Historical Fiction',
    ],
    unique: false,
    isMultiSelect: false,
    isPluginField: false,
    fieldTitle: {
      en: 'Quantity',
    },
    type: 'number',
    placeholder: {
      en: 'Quantity',
    },
    validation: {
      min: 1,
      max: 300,
      regex: '',
      allowedFileTypes: [],
      noAllowedFiles: 1,
    },
    refCollection: {
      collectionName: '',
      collectionField: '',
      displayType: 'dropdown',
      parentCollectionField: '',
      isShowAsText: false,
    },
    extraFieldSetting: {
      dateDisplayType: 'date',
      textareaDisplayType: 'text-area',
    },
    fieldName: 'quantity',
  },
];

export const constructors = [
  {
    customConstructorName: 'Default Constructor',
    constructorData: {},
    uuid: '1f3b777c-8c05-41f3-813c-b53d72bd24a4',
  },
];

export const COLLECTION_NAME = 'new_books';
