/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import multer from 'multer';
import path from 'path';

const imgUploader = options => {
  const { supportedExtensions, maxFileSize } = options;

  // Utilize memory storage to keep the file buffer in RAM.
  // The route handler is responsible for piping this buffer to Google Cloud Storage.
  const storage = multer.memoryStorage();

  return multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
      const extension = path.extname(file.originalname);
      if (supportedExtensions.test(extension)) {
        cb(null, true);
      } else {
        cb(new Error(`Must be ${supportedExtensions.toString()} image`));
      }
    },
    limits: {
      fileSize: maxFileSize,
    },
  });
};

export default imgUploader;
