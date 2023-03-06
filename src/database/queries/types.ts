type Query = `${string};`;

type BaseQuery = {
  create: Query;
  remove: Query;
};

// eslint-disable-next-line import/prefer-default-export
export type { BaseQuery };
