describe('PostsDraftsController', () => {
  let postsDraftsController: PostsDraftsController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    postsDraftsController = new PostsDraftsController(
      AuthorsService,
      FileService,
      PostsDraftsService,
      PostsService,
    );

    mockRequest = {
      params: {},
      body: {},
      query: {},
      files: {},
    };
    mockResponse = {
      send: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  describe('create', () => {
    it('should return validation error if dto is invalid', async () => {
      const dto = new PostsDraftsDto({} as IPostDrafts);
      dto.validate = jest
        .fn()
        .mockReturnValue({ error: 'Some error', value: null });
      mockRequest.body = dto;
      mockRequest.params = { id: '1' };

      await postsDraftsController.create(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toBeCalledWith('Some error');
    });

    it('should return NotFound error if author is not found', async () => {
      const authorValidateResult = ApiError.NotFound();
      postsDraftsController.authorValidate = jest
        .fn()
        .mockReturnValue(authorValidateResult);
      const dto = new PostsDraftsDto({} as IPostDrafts);
      dto.validate = jest.fn().mockReturnValue({ error: null, value: {} });
      mockRequest.body = dto;
      mockRequest.params = { id: '1' };

      await postsDraftsController.create(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(nextFunction).toBeCalledWith(authorValidateResult);
    });

    it('should save post images and create a new draft', async () => {
      const authorValidateResult = { id: 1, name: 'Author' };
      const dto = new PostsDraftsDto({} as IPostDrafts);
      dto.validate = jest.fn().mockReturnValue({ error: null, value: {} });
      const savePostImageResult = ['main-img.jpg'];
      postsDraftsController.authorValidate = jest
        .fn()
        .mockResolvedValue(authorValidateResult);
      FileService.savePostImage = jest
        .fn()
        .mockReturnValue(savePostImageResult);
      PostsDraftsService.create = jest
        .fn()
        .mockResolvedValue({ id: 1, title: 'Draft' });
      mockRequest.body = dto;
      mockRequest.params = { id: '1' };
      mockRequest.files = {
        mainImg: { data: Buffer.from('image-data'), mimetype: 'image/jpeg' },
      };

      await postsDraftsController.create(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(FileService.savePostImage).toBeCalledWith(
        mockRequest.files.mainImg,
      );
      expect(PostsDraftsService.create).toBeCalledWith({
        postId: 1,
        authorId: authorValidateResult.id,
        mainImg: savePostImageResult[0],
        otherImgs: [],
      });
      expect(mockResponse.send).toBeCalledWith({ id: 1, title: 'Draft' });
    });
  });

  describe('update', () => {
    it('should return validation error if dto is invalid', async () => {
      const dto = new PostsDraftsDto({} as IPostDrafts);
      dto.validate = jest
        .fn()
        .mockReturnValue({ error: 'Some error', value: null });
      mockRequest.body = dto;
      mockRequest.params = { id: '1', did: '2' };

      await postsDraftsController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(nextFunction).toBeCalledWith('Some error');
    });

    it('should return NotFound error if author is not found', async () => {
      const authorValidateResult = ApiError.NotFound();
      postsDraftsController.authorValidate = jest
        .fn()
        .mockReturnValue(authorValidateResult);
      const dto = new PostsDraftsDto({} as IPostDrafts);
      dto.validate = jest.fn().mockReturnValue({ error: null, value: {} });
      mockRequest.body = dto;
      mockRequest.params = { id: '1', did: '2' };

      await postsDraftsController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(nextFunction).toBeCalledWith(authorValidateResult);
    });

    it('should return NotFound error if author is not the owner of the post', async () => {
      const authorValidateResult = { id: 2, name: 'Author 2' };
      const dto = new PostsDraftsDto({} as IPostDrafts);
      dto.validate = jest.fn().mockReturnValue({ error: null, value: {} });
      postsDraftsController.authorValidate = jest
        .fn()
        .mockResolvedValue(authorValidateResult);
      PostsService.getOne = jest
        .fn()
        .mockResolvedValue({ author: { id: 1, name: 'Author 1' } });
      mockRequest.body = dto;
      mockRequest.params = { id: '1', did: '2' };

      await postsDraftsController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(PostsService.getOne).toBeCalledWith({ id: 1 });
      expect(nextFunction).toBeCalledWith(ApiError.NotFound());
    });

    it('should save post images and update the draft', async () => {
      const authorValidateResult = { id: 1, name: 'Author' };
      const dto = new PostsDraftsDto({} as IPostDrafts);
      dto.validate = jest.fn().mockReturnValue({ error: null, value: {} });
      const savePostImageResult = ['main-img.jpg'];
      postsDraftsController.authorValidate = jest
        .fn()
        .mockResolvedValue(authorValidateResult);
      FileService.savePostImage = jest
        .fn()
        .mockReturnValue(savePostImageResult);
      PostsDraftsService.update = jest
        .fn()
        .mockResolvedValue({ id: 1, title: 'Updated Draft' });
      mockRequest.body = dto;
      mockRequest.params = { id: '1', did: '2' };
      mockRequest.files = {
        mainImg: { data: Buffer.from('image-data'), mimetype: 'image/jpeg' },
      };

      await postsDraftsController.update(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(FileService.savePostImage).toBeCalledWith(
        mockRequest.files.mainImg,
      );
      expect(PostsDraftsService.update).toBeCalledWith({
        postId: 1,
        draftId: 2,
        authorId: authorValidateResult.id,
        mainImg: savePostImageResult[0],
        otherImgs: [],
      });
      expect(mockResponse.send).toBeCalledWith({
        id: 1,
        title: 'Updated Draft',
      });
    });
  });

  describe('getAll', () => {
    it('should return NotFound error if author is not found', async () => {
      const authorValidateResult = ApiError.NotFound();
      postsDraftsController.authorValidate = jest
        .fn()
        .mockReturnValue(authorValidateResult);
      mockRequest.params = { id: '1' };
      mockRequest.query = { per_page: '10', page: '0' };

      await postsDraftsController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(nextFunction).toBeCalledWith(authorValidateResult);
    });

    it('should return drafts for the specified post', async () => {
      const authorValidateResult = { id: 1, name: 'Author' };
      postsDraftsController.authorValidate = jest
        .fn()
        .mockResolvedValue(authorValidateResult);
      PostsDraftsService.getDraftsPost = jest.fn().mockResolvedValue({
        totalCount: 2,
        count: 2,
        drafts: [
          { id: 1, title: 'Draft 1' },
          { id: 2, title: 'Draft 2' },
        ],
      });
      mockRequest.params = { id: '1' };
      mockRequest.query = { per_page: '10', page: '0' };

      await postsDraftsController.getAll(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(PostsDraftsService.getDraftsPost).toBeCalledWith(
        { postId: 1, authorId: authorValidateResult.id },
        { page: 0, perPage: 10 },
      );
      expect(mockResponse.send).toBeCalledWith({
        totalCount: 2,
        count: 2,
        drafts: [
          { id: 1, title: 'Draft 1' },
          { id: 2, title: 'Draft 2' },
        ],
      });
    });
  });

  describe('getOne', () => {
    it('should return NotFound error if author is not found', async () => {
      const authorValidateResult = ApiError.NotFound();
      postsDraftsController.authorValidate = jest
        .fn()
        .mockReturnValue(authorValidateResult);
      mockRequest.params = { id: '1', did: '2' };

      await postsDraftsController.getOne(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(nextFunction).toBeCalledWith(authorValidateResult);
    });

    it('should return the specified draft', async () => {
      const authorValidateResult = { id: 1, name: 'Author' };
      postsDraftsController.authorValidate = jest
        .fn()
        .mockResolvedValue(authorValidateResult);
      PostsDraftsService.getOne = jest
        .fn()
        .mockResolvedValue({ id: 1, title: 'Draft' });
      mockRequest.params = { id: '1', did: '2' };

      await postsDraftsController.getOne(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(PostsDraftsService.getOne).toBeCalledWith({
        postId: 1,
        draftId: 2,
        authorId: authorValidateResult.id,
      });
      expect(mockResponse.send).toBeCalledWith({ id: 1, title: 'Draft' });
    });
  });

  describe('delete', () => {
    it('should return NotFound error if author is not found', async () => {
      const authorValidateResult = ApiError.NotFound();
      postsDraftsController.authorValidate = jest
        .fn()
        .mockReturnValue(authorValidateResult);
      mockRequest.params = { id: '1', did: '2' };

      await postsDraftsController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(mockResponse.send).toBeCalledWith(authorValidateResult);
    });

    it('should delete the specified draft', async () => {
      const authorValidateResult = { id: 1, name: 'Author' };
      postsDraftsController.authorValidate = jest
        .fn()
        .mockResolvedValue(authorValidateResult);
      PostsDraftsService.delete = jest
        .fn()
        .mockResolvedValue({ id: 2, title: 'Draft 2' });
      mockRequest.params = { id: '1', did: '2' };

      await postsDraftsController.delete(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(PostsDraftsService.delete).toBeCalledWith({
        postId: 1,
        draftId: 2,
      });
      expect(mockResponse.send).toBeCalledWith({ id: 2, title: 'Draft 2' });
    });
  });

  describe('publish', () => {
    it('should return NotFound error if author is not found', async () => {
      const authorValidateResult = ApiError.NotFound();
      postsDraftsController.authorValidate = jest
        .fn()
        .mockReturnValue(authorValidateResult);
      mockRequest.params = { id: '1', did: '2' };

      await postsDraftsController.publish(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(nextFunction).toBeCalledWith(authorValidateResult);
    });

    it('should publish the specified draft', async () => {
      const authorValidateResult = { id: 1, name: 'Author' };
      postsDraftsController.authorValidate = jest
        .fn()
        .mockResolvedValue(authorValidateResult);
      PostsDraftsService.publish = jest
        .fn()
        .mockResolvedValue({ id: 2, title: 'Draft 2' });
      mockRequest.params = { id: '1', did: '2' };

      await postsDraftsController.publish(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction,
      );

      expect(postsDraftsController.authorValidate).toBeCalledWith(
        mockRequest,
        mockResponse,
      );
      expect(PostsDraftsService.publish).toBeCalledWith({
        postId: 1,
        draftId: 2,
      });
      expect(mockResponse.send).toBeCalledWith({ id: 2, title: 'Draft 2' });
    });
  });

  describe('authorValidate', () => {
    it('should return NotFound error if author is not found', async () => {
      const getByUserIdResult = ApiError.NotFound();
      AuthorsService.getByUserId = jest
        .fn()
        .mockResolvedValue(getByUserIdResult);
      mockRequest.params = { id: '1' };

      const result = await postsDraftsController.authorValidate(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(AuthorsService.getByUserId).toBeCalledWith({ id: '1' });
      expect(result).toBe(getByUserIdResult);
    });

    it('should return NotFound error if author is null', async () => {
      AuthorsService.getByUserId = jest.fn().mockResolvedValue(null);
      mockRequest.params = { id: '1' };

      const result = await postsDraftsController.authorValidate(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(AuthorsService.getByUserId).toBeCalledWith({ id: '1' });
      expect(result).toBe(ApiError.NotFound());
    });

    it('should return the author object if found', async () => {
      const getByUserIdResult = { id: 1, name: 'Author' };
      AuthorsService.getByUserId = jest
        .fn()
        .mockResolvedValue(getByUserIdResult);
      mockRequest.params = { id: '1' };

      const result = await postsDraftsController.authorValidate(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(AuthorsService.getByUserId).toBeCalledWith({ id: '1' });
      expect(result).toBe(getByUserIdResult);
    });
  });
});
