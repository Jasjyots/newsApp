import axios from 'axios';
import ENV from '../apiConstants/index';

export const postRequest = async (path = '', body = null, params = {}) => {
  try {
    const response = await axios.post(path, body, {
      params,
    });
    return response;
  } catch (err) {
    console.log(err, 'error');
    return err?.response?.data ?? err?.response;
  }
};
