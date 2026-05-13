/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

// const crypto = require('crypto');
import crypto from 'crypto';

const generateSessionId = () => {
  return crypto.randomBytes(24).toString('hex');
};

export default generateSessionId;