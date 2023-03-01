import { NextFunction, Response } from 'express';
import path from 'path';
import { v4 } from 'uuid';

import { PostsDraftService } from '../service/index';
import paginator from '../shared/paginator';
import {
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAnQuery,
} from './types';

class PostsDraftsController {
  static async create(
    req: RequestWithParamsAndBody<
      { id: string },
      {
        body: string;
        title: string;
        categoryId: number;
      }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;
      const main = req.files;
      const mainNameImg = `${v4()}.jpg`;
      const otherNameImgs: string[] = [];
      const { mainImg, otherImgs } = main || {};

      if (mainImg && !(mainImg instanceof Array)) {
        mainImg.mv(
          path.resolve(
            __dirname,
            '../../static',
            'images',
            'posts',
            mainNameImg,
          ),
        );
      }
      if (otherImgs && otherImgs instanceof Array) {
        otherImgs.forEach((file) => {
          const nameImg = `${v4()}.jpg`;

          otherNameImgs.push(nameImg);
          file.mv(
            path.resolve(__dirname, '../../static', 'images', 'posts', nameImg),
          );
        });
      }

      const draft = await PostsDraftService.create({
        ...req.body,
        postId: Number(id),
        userId: req.user.id,
        mainImg: mainNameImg,
        otherImgs: otherNameImgs,
      });

      res.send(draft);
    } catch (e) {
      next(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string; did: string },
      { body: string; title: string; categoryId: number }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id, did } = req.params;
      const main = req.files;
      const mainNameImg = `${v4()}.jpg`;
      const otherNameImgs: string[] = [];
      const { mainImg, otherImgs } = main || {};

      if (mainImg && !(mainImg instanceof Array)) {
        mainImg.mv(
          path.resolve(
            __dirname,
            '../../static',
            'images',
            'posts',
            mainNameImg,
          ),
        );
      }
      if (otherImgs && otherImgs instanceof Array) {
        otherImgs.forEach((file) => {
          const nameImg = `${v4()}.jpg`;

          otherNameImgs.push(nameImg);
          file.mv(
            path.resolve(__dirname, '../../static', 'images', 'posts', nameImg),
          );
        });
      }
      const result = await PostsDraftService.update({
        ...req.body,
        postId: Number(id),
        draftId: Number(did),
        userId: req.user.id,
        mainImg: mainNameImg,
        otherImgs: otherNameImgs,
      });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }

  static async getAll(
    req: RequestWithParamsAnQuery<
      { id: string },
      { per_page: string; page: string }
    >,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { per_page: perPage = 10, page = 0 } = req.query;
      const { id } = req.params;

      const { totalCount, count, drafts } =
        await PostsDraftService.getDraftsPost(
          {
            postId: Number(id),
            userId: req.user.id,
          },
          {
            page: Number(page),
            perPage: Number(perPage),
          },
        );
      const pagination = paginator({
        totalCount,
        count,
        req,
        route: `/posts/${id}/drafts`,
        page: Number(page),
        perPage: Number(perPage),
      });
      res.send({ ...pagination, drafts });
    } catch (e) {
      next(e);
    }
  }

  static async getOne(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id, did } = req.params;
      const result = await PostsDraftService.getOne({
        postId: Number(id),
        draftId: Number(did),
        userId: req.user.id,
      });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }

  static async delete(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id, did } = req.params;
      const result = await PostsDraftService.delete({
        postId: Number(id),
        draftId: Number(did),
      });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }

  static async publish(
    req: RequestWithParams<{ id: string; did: string }>,
    res: Response,
    next: NextFunction,
  ) {
    // TODO:FIX
    console.log('publish');
    try {
      const { id, did } = req.params;
      const result = await PostsDraftService.publish({
        postId: Number(id),
        draftId: Number(did),
        userId: req.user.id,
      });

      res.send(result);
    } catch (e) {
      next(e);
    }
  }
}

export default PostsDraftsController;
