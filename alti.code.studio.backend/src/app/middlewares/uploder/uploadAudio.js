/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

import multer from 'multer';
import path from 'path';

const audioUploader = multer({
  storage: multer.diskStorage({
    destination: 'uploads/',
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname); // ensure extension
      cb(null, `${Date.now()}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowed = /\.(mp3|m4a|wav|webm|flac|ogg|mpga|mp4|mpeg)$/i;
    if (!allowed.test(file.originalname)) {
      return cb(new Error('Unsupported file format'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

export default audioUploader;
