import { Request, Response } from 'express';

import { NewsService } from '../service';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from './types';

class NewsController {
  static async create(
    req: RequestWithBody<{
      title: string;
      authorId: number;
      categoryId: number;
      body: string;
      mainImg: string;
      otherImgs: string[];
    }>,
    res: Response,
  ) {
    try {
      const {
        title,
        authorId,
        categoryId,
        body,
        mainImg,
        otherImgs = [],
      } = req.body;
      const result = await NewsService.create({
        title,
        authorId,
        categoryId,
        body,
        mainImg,
        otherImgs,
      });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async update(
    req: RequestWithParamsAndBody<
      { id: string },
      {
        title: string;
        authorId: number;
        categoryId: number;
        body: string;
        mainImg: string;
        otherImgs: string[];
      }
    >,
    res: Response,
  ) {
    try {
      const { id } = req.params;
      const {
        title,
        authorId,
        categoryId,
        body,
        mainImg,
        otherImgs = [],
      } = req.body;
      const result = await NewsService.update({
        title,
        authorId,
        categoryId,
        body,
        mainImg,
        otherImgs,
        id,
      });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async partialUpdate(
    req: RequestWithParamsAndBody<
      { id: string },
      {
        title: string;
        authorId: number;
        categoryId: number;
        body: string;
        mainImg: string;
        otherImgs: string[];
      }
    >,
    res: Response,
  ) {
    try {
      const { id } = req.params;
      const { title, authorId, categoryId, body, mainImg, otherImgs } =
        req.body;

      const result = await NewsService.partialUpdate({
        title,
        authorId,
        categoryId,
        body,
        mainImg,
        otherImgs,
        id,
      });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const result = await NewsService.getAll();

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const result = await NewsService.getOne({ id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const result = await NewsService.delete({ id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }
}

export default NewsController;
