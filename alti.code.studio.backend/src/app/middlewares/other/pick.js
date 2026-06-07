/**
 * Copyright (c) 2024 Inso Code
 * 
 * This software is released under the MIT License.
 * https://opensource.org/licenses/MIT
 */

const pick = (obj, keys) => {
  const finalObj = {};

  for (const key of keys) {
    if (obj && Object.hasOwnProperty.call(obj, key)) {
      // Convert specific query parameters to numbers if needed
      if (key === 'page' || key === 'limit') {
        finalObj[key] = Number(obj[key]);
      } else {
        finalObj[key] = obj[key];
      }
    }
  }
  return finalObj;
};

export default pick;
