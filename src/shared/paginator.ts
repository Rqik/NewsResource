import querystring from 'querystring';
import { Request } from 'express';
import config from '../config';

const paginator = ({
  totalCount,
  count,
  req,
  route,
  page,
  perPage,
}: {
  totalCount: number | null;
  count: number;
  req: Request<unknown, unknown, unknown, { per_page?: string; page?: string }>;
  route: string;
  page: number;
  perPage: number;
}) => {
  const pagination: {
    nextPage?: string;
    totalCount: number | null;
    count: number;
  } = {
    totalCount,
    count,
  };

  const addNextPageUrl =
    totalCount !== null && totalCount > (Number(page) + 1) * Number(perPage);

  if (addNextPageUrl) {
    pagination.nextPage = `${config.apiUrl}${route}?${querystring.stringify({
      ...req.query,
      page: Number(page) + 1,
    })}`;
  }

  return pagination;
};

export default paginator;
