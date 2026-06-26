import { catchAsync } from '../../../shared/catchAsync.js';
import sendResponse from '../../../shared/sendResponse.js';
import httpStatus from 'http-status';
import { spokespersonService } from './spokesperson.service.js';

const generateChangelog = catchAsync(async (req, res) => {
  const { sinceTag } = req.query; // e.g. ?sinceTag=v1.0.0
  const result = await spokespersonService.generateChangelog(sinceTag);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Changelog generated',
    data: result,
  });
});

const draftReleaseNotes = catchAsync(async (req, res) => {
  const { version, changelog } = req.body;
  const result = await spokespersonService.draftReleaseNotes(
    version,
    changelog,
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Release notes drafted',
    data: result,
  });
});

const polishReadme = catchAsync(async (req, res) => {
  const result = await spokespersonService.polishReadme();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'README polished',
    data: result,
  });
});

export const spokespersonController = {
  generateChangelog,
  draftReleaseNotes,
  polishReadme,
};
