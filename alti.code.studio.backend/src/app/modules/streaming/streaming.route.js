/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const express = require('express');
const router = express.Router();
const streamingController = require('./streaming.controller');

router.route('/get-token').get(streamingController.authStreamingController);

module.exports = router;