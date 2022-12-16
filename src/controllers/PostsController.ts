import { Request, Response } from 'express';

import { PostsService } from '../service/index';
import {
  RequestWithBody,
  RequestWithParams,
  RequestWithParamsAndBody,
} from './types';

class PostsController {
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
      const result = await PostsService.create(req.body);

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

      const result = await PostsService.update({ ...req.body, id: Number(id) });

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

      const result = await PostsService.partialUpdate({ ...req.body, id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const result = await PostsService.getAll();

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async getOne(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;
      const result = await PostsService.getOne({ id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }

  static async delete(req: RequestWithParams<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      const result = await PostsService.delete({ id });

      res.send(result);
    } catch (e) {
      res.send(e);
    }
  }
}

export default PostsController;
