import fileUpload from 'express-fileupload';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

import FileService from './file.service';

jest.mock('uuid');
jest.mock('express-fileupload', () => ({
  UploadedFile: jest.fn(),
}));

describe('FileService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('savePostImage', () => {
    const mockFile: fileUpload.UploadedFile = {
      name: 'image.jpg',
      mimetype: 'image/jpeg',
      mv: jest.fn(),
    };

    const mockFileArray: fileUpload.UploadedFile[] = [
      {
        name: 'image1.jpg',
        mimetype: 'image/jpeg',
        mv: jest.fn(),
      },
      {
        name: 'image2.jpg',
        mimetype: 'image/jpeg',
        mv: jest.fn(),
      },
    ];

    it('should save a single post image', () => {
      const mockUuid = 'uuid';
      const mockName = `${mockUuid}.jpg`;
      uuidv4.mockReturnValue(mockUuid);

      const result = FileService.savePostImage(mockFile);

      expect(result).toEqual([mockName]);
      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(mockFile.mv).toHaveBeenCalledWith(
        path.resolve(__dirname, '@/ ', 'images', 'posts', mockName),
      );
    });

    it('should save multiple post images', () => {
      const mockUuid = 'uuid';
      const mockName1 = `${mockUuid}_1.jpg`;
      const mockName2 = `${mockUuid}_2.jpg`;
      uuidv4.mockReturnValue(mockUuid);

      const result = FileService.savePostImage(mockFileArray);

      expect(result).toEqual([mockName1, mockName2]);
      expect(uuidv4).toHaveBeenCalledTimes(2);
      expect(mockFileArray[0].mv).toHaveBeenCalledWith(
        path.resolve(__dirname, '@/ ', 'images', 'posts', mockName1),
      );
      expect(mockFileArray[1].mv).toHaveBeenCalledWith(
        path.resolve(__dirname, '@/ ', 'images', 'posts', mockName2),
      );
    });

    it('should return null if file is not provided', () => {
      const result = FileService.savePostImage(null);

      expect(result).toBeNull();
    });

    it('should return ApiError if file type is not allowed', () => {
      const mockFileInvalid: fileUpload.UploadedFile = {
        name: 'document.pdf',
        mimetype: 'application/pdf',
        mv: jest.fn(),
      };

      const result = FileService.savePostImage(mockFileInvalid);

      expect(result).toBeInstanceOf(ApiError);
      expect(result?.message).toBe('File type');
    });
  });

  describe('saveAvatar', () => {
    const mockFile: fileUpload.UploadedFile = {
      name: 'avatar.jpg',
      mimetype: 'image/jpeg',
      mv: jest.fn(),
    };

    it('should save an avatar image', () => {
      const mockUuid = 'uuid';
      const mockName = `${mockUuid}.jpg`;
      uuidv4.mockReturnValue(mockUuid);

      const result = FileService.saveAvatar(mockFile);

      expect(result).toEqual(mockName);
      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(mockFile.mv).toHaveBeenCalledWith(
        path.resolve(__dirname, '@/ ', 'images', 'avatars', mockName),
      );
    });

    it('should return null if file is not provided', () => {
      const result = FileService.saveAvatar(null);

      expect(result).toBeNull();
    });

    it('should return ApiError if file type is not allowed', () => {
      const mockFileInvalid: fileUpload.UploadedFile = {
        name: 'document.pdf',
        mimetype: 'application/pdf',
        mv: jest.fn(),
      };

      const result = FileService.saveAvatar(mockFileInvalid);

      expect(result).toBeInstanceOf(ApiError);
      expect(result?.message).toBe('File type');
    });
  });
});
