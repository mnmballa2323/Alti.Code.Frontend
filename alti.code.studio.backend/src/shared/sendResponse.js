/**
 * Copyright (c) 2024 Inso Code
 *
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const sendResponse = (res, data) => {
  const sendResponse = {
    statusCode: data.statusCode,
    success: data.success,
    message: data.message || null,
    meta: data.meta || null || undefined,
    data: data.data || null || undefined,
  };
  res.status(data.statusCode).json(sendResponse);
};

export default sendResponse;
