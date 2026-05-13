/**
 * Copyright (c) 2024 Alti.Code.Studio
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

<<<<<<< HEAD
import { createCyberdeskClient } from 'cyberdesk';
=======
// import { createCyberdeskClient } from 'cyberdesk';
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
import httpStatus from 'http-status';
import config from '../../../../config/index.js';
import ApiError from '../../../errors/ApiError.js';

<<<<<<< HEAD
const cyberdesk = createCyberdeskClient({
  apiKey: config.cyberdesk_api_key,
});

// Launch a new desktop
const launchDesktops = async () => {
=======
// const cyberdesk = createCyberdeskClient({
//   apiKey: config.cyberdesk_api_key,
// });
const cyberdesk = null;

// Launch a new desktop
const launchDesktops = async () => {
  if (!cyberdesk) throw new ApiError(httpStatus.NOT_IMPLEMENTED, "Cyberdesk is not installed.");
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
  const result = await cyberdesk.launchDesktop({
    timeout_ms: 600000,
  });

  console.log('Cyberdesk launch result:', result);
  console.log('❗Cyberdesk error object:', result.error);

  if ('error' in result)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      result.error.message || 'Cyberdesk API Error',
    );
  return result;
};

// Get desktop info
const getDesktopInfo = async desktopId => {
<<<<<<< HEAD
=======
  if (!cyberdesk) throw new Error("Cyberdesk is not installed.");
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
  const result = await cyberdesk.getDesktop({ path: { id: desktopId } });
  if ('error' in result) throw new Error(result.error);
  return result;
};

// Perform a mouse click
const clickMouse = async (desktopId, x, y) => {
<<<<<<< HEAD
=======
  if (!cyberdesk) throw new Error("Cyberdesk is not installed.");
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
  const result = await cyberdesk.executeComputerAction({
    path: { id: desktopId },
    body: {
      type: 'click_mouse',
      x,
      y,
      button: 'left',
    },
  });
  if ('error' in result) {
    console.error(
      'Cyberdesk Action Error:',
      JSON.stringify(result.error, null, 2),
    );
    throw new Error(result.error.message || 'Unknown Cyberdesk Error');
  }
  return result;
};

// Execute bash command
const executeBash = async (desktopId, command) => {
<<<<<<< HEAD
=======
  if (!cyberdesk) throw new Error("Cyberdesk is not installed.");
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
  const result = await cyberdesk.executeBashAction({
    path: { id: desktopId },
    body: { command },
  });
  // if ('error' in result) {
  //   console.error(
  //     'Cyberdesk Action Error:',
  //     JSON.stringify(result.error, null, 2),
  //   );
  //   throw new Error(result.error.message || 'Unknown Cyberdesk Error');
  // }
  return result;
};

// Terminate desktop
const terminateDesktop = async desktopId => {
<<<<<<< HEAD
=======
  if (!cyberdesk) throw new Error("Cyberdesk is not installed.");
>>>>>>> ec1fead (feat(omni-cloud): integrate and visualize multi-cloud sovereign architecture)
  const result = await cyberdesk.terminateDesktop({ path: { id: desktopId } });
  return result;
};

export const cyberdeskService = {
  launchDesktops,
  getDesktopInfo,
  clickMouse,
  executeBash,
  terminateDesktop,
};
