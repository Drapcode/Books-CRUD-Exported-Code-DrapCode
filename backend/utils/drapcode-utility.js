import stringify from 'stringify-object';

export const queryParser = async (collectionName, selectedFilter, count, externalParams = {}) => {
  let { orderBy, sortBy, externalKey, selector, query, countQuery } = selectedFilter;
  let finalQuery = query;
  if (count) {
    finalQuery = countQuery;
  }
  finalQuery = JSON.stringify(finalQuery);

  if (!collectionName) return '';
  if (!finalQuery) return '';
  let queryStr = `.aggregate([])`;

  finalQuery = replaceExternalParams(finalQuery, externalKey, externalParams);

  let { offset, limit } = externalParams;

  offset = offset ? offset : 0;
  limit = limit ? limit : 10;

  finalQuery = finalQuery.replace(`"skip"`, offset);
  finalQuery = finalQuery.replace(`"limit"`, limit);

  queryStr = `.aggregate(${finalQuery})`;
  let str = `db.collection('${collectionName}')${queryStr}`;

  if (selector === 'COUNT') {
    str += `.toArray()`;
    return str;
  }

  if (sortBy) {
    let direction = orderBy && orderBy == 'asc' ? 1 : -1;
    str += `.collation({'locale':'en'})`;
    str += `.sort(${stringify({ [sortBy]: direction })})`;
  }

  str += `.toArray()`;
  return str;
};

const replaceExternalParams = (query, externalKey, externalParams) => {
  if (externalKey) {
    externalKey.forEach((externKey) => {
      if (externKey.type === 'number') {
        query = query.replaceAll(`"${externKey.key}"`, externalParams[externKey.key]);
      } else {
        query = query.replaceAll(externKey.key, externalParams[externKey.key]);
      }
    });
  }

  return query;
};
