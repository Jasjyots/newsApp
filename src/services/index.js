import {postRequest} from '../apiManager';

import ENV from '../config/env.json';

export const getPublishedNews = async (
  params,
  callback = () => {},
  err = () => {},
) => {
  try {
    const url = `${ENV.baseUrl}/globalNews?`;

    const res = await postRequest(url, null, params);
    if (res?.status) {
      callback(res?.data, res);
      return;
    } else {
      err(res?.data);
    }
  } catch (error) {
    err(error);
  }
};
