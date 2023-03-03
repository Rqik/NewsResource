import fileUpload from 'express-fileupload';
import path from 'path';
import { v4 } from 'uuid';

class FileService {
  static savePostImage<T extends fileUpload.UploadedFile>(picture: T | T[]) {
    if (!picture) return null;

    if (!(picture instanceof Array)) {
      const nameImg = `${v4()}.jpg`;

      picture.mv(
        path.resolve(__dirname, '../../static', 'images', 'posts', nameImg),
      );

      return [nameImg];
    }
    if (picture instanceof Array) {
      const namesImgs: string[] = [];
      picture.forEach((file) => {
        const nameImg = `${v4()}.jpg`;

        namesImgs.push(nameImg);
        file.mv(
          path.resolve(__dirname, '../../static', 'images', 'posts', nameImg),
        );
      });

      return namesImgs;
    }

    return null;
  }

  static saveAvatar<T extends fileUpload.UploadedFile>(avatar?: T | T[]) {
    const nameImg = `${v4()}.jpg`;

    if (avatar && !(avatar instanceof Array)) {
      avatar.mv(
        path.resolve(__dirname, '../../static', 'images', 'avatars', nameImg),
      );

      return nameImg;
    }

    return null;
  }
}

export default FileService;
