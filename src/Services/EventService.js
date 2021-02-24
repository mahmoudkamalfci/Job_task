import axios from "axios";

const options = {
  baseURL: "https://jawab-backend.shifters.tech/api",
  headers: {}
};

export default {
  getEvent(api, withCredentials) {
    if (withCredentials == true) {
      options.headers.Authorization = "Bearer " + localStorage.token;
    }
    options.headers.locale = localStorage.locale;
    const apiClient = axios.create(options);
    return apiClient.get(api);
  },

  postEvent(api, dataObj) {
    options.headers.Authorization = "Bearer " + localStorage.token;
    options.headers.locale = localStorage.locale;
    const apiClient = axios.create(options);
    return apiClient.post(api, dataObj);
  }
};
