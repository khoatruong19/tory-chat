import axios from 'axios';
import JwtManager from '../utils/jwt';
const baseUrl = process.env.REACT_APP_API_URL;

const axiosClient = axios.create({
  baseURL: baseUrl,
});

axiosClient.interceptors.request.use(async (config) => {
  return {
    ...config,
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${JwtManager.getToken()}`,
    },
  };
});

axiosClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (err) => {
    if (!err.response) {
      return alert(err);
    }
    throw err.response;
  }
);

export default axiosClient;
