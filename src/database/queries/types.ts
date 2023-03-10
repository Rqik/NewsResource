type Query = `${string};`;

type BaseQuery = {
  create: Query;
  remove: Query;
};

export type { Query, BaseQuery };
