import axios from "axios";
// Define the API URL using Vite environment variable, with a live fallback.
const apiUrl = import.meta.env.VITE_API_URL || "https://www.homewala.com/homewala/api";
const baseURL = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;

// Create Axios instances for different purposes
const createAxiosInstance = (baseURL, headers) => {
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...headers, // Additional headers if needed
    },
  });
};

// Create a standard API Axios instance
const api = createAxiosInstance(baseURL, {});

// Create an Axios instance for handling file uploads
const apiForFiles = createAxiosInstance(baseURL, {
  "Content-Type": "multipart/form-data",
});

// Create an Axios instance for file downloads
const apiForFileDownload = createAxiosInstance(baseURL, {
  "Content-Type": "application/json",
  Accept: "application/json",
  responseType: "blob",
});

// Flag to prevent multiple dialogs
let isSessionExpiredDialogShown = false;

// Axios interceptors for handling responses
api.interceptors.response.use(
  (response) => {
    // Handle successful responses
    // console.log("Response =>", response);
    // You can add more response handling logic here if needed
    return response;
  },
  (error) => {
    console.log("Error =>", error);
    // Handle error responses
    if (error.response) {
      if (
        error.response.status === 401 &&
        error.response.data.message === "Unauthorized"
      ) {
        console.log("Unauthorized request");
        localStorage.clear();
        window.location.href = "/";
      }

      if (error.response.status === 440 && !isSessionExpiredDialogShown) {
        // Display a simple alert with only an "OK" button
        isSessionExpiredDialogShown = true;
        window.alert("Session Expired. Please login again.");
        localStorage.clear();
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Add a request interceptor to include the authorization token
 * in the request headers if it exists in localStorage.
 */
const addAuthInterceptor = (instance) => {
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );
};

/**
 * Add a response interceptor to handle global error scenarios,
 * such as redirecting to the login page on a 401 Unauthorized error.
 */
const addErrorInterceptor = (instance) => {
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized access - logging out...");
        localStorage.removeItem("access_token");
        window.location.href = "/";
        // navigate("/")
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors to both instances
addAuthInterceptor(api);
addAuthInterceptor(apiForFiles);

addErrorInterceptor(api);
addErrorInterceptor(apiForFiles);
const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem("access_token", token);
    api.defaults.headers["Authorization"] = `Bearer ${token}`;
    apiForFiles.defaults.headers["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("access_token");
    delete api.defaults.headers["Authorization"];
    delete apiForFiles.defaults.headers["Authorization"];
  }
};

// Export the Axios instances
export { api, apiForFiles, apiForFileDownload, setAccessToken };


// import axios from "axios";

// // Define the API URL using Vite environment variable
// const apiUrl = "https://www.homewala.com/homewala/api";
// // const apiUrl = "http://127.0.0.1:8000/api";

// // Create Axios instances for different purposes
// const createAxiosInstance = (baseURL, headers) => {
//   return axios.create({
//     baseURL,
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//       ...headers, // Additional headers if needed
//     },
//   });
// };

// // Create a standard API Axios instance
// const api = createAxiosInstance(apiUrl, {});

// // Create an Axios instance for handling file uploads
// const apiForFiles = createAxiosInstance(apiUrl, {
//   "Content-Type": "multipart/form-data",
// });

// // Create an Axios instance for file downloads
// const apiForFileDownload = createAxiosInstance(apiUrl, {
//   "Content-Type": "application/json",
//   Accept: "application/json",
//   responseType: "blob",
// });

// // Flag to prevent multiple dialogs
// let isSessionExpiredDialogShown = false;

// // Axios interceptors for handling responses
// api.interceptors.response.use(
//   (response) => {
//     // Handle successful responses
//     // console.log("Response =>", response);
//     // You can add more response handling logic here if needed
//     return response;
//   },
//   (error) => {
//     console.log("Error =>", error);
//     // Handle error responses
//     if (error.response) {
//       if (
//         error.response.status === 401 &&
//         error.response.data.message === "Unauthorized"
//       ) {
//         console.log("Unauthorized request");
//         localStorage.clear();
//         window.location.href = "/";
//       }

//       if (error.response.status === 440 && !isSessionExpiredDialogShown) {
//         // Display a simple alert with only an "OK" button
//         isSessionExpiredDialogShown = true;
//         window.alert("Session Expired. Please login again.");
//         localStorage.clear();
//         window.location.href = "/";
//       }
//     }
//     return Promise.reject(error);
//   }
// );

// /**
//  * Add a request interceptor to include the authorization token
//  * in the request headers if it exists in localStorage.
//  */
// const addAuthInterceptor = (instance) => {
//   instance.interceptors.request.use(
//     (config) => {
//       const token = localStorage.getItem("access_token");
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     },
//     (error) => Promise.reject(error)
//   );
// };

// /**
//  * Add a response interceptor to handle global error scenarios,
//  * such as redirecting to the login page on a 401 Unauthorized error.
//  */
// const addErrorInterceptor = (instance) => {
//   instance.interceptors.response.use(
//     (response) => response,
//     (error) => {
//       if (error.response && error.response.status === 401) {
//         console.error("Unauthorized access - logging out...");
//         localStorage.removeItem("access_token");
//         window.location.href = "/";
//         // navigate("/")
//       }
//       return Promise.reject(error);
//     }
//   );
// };

// // Apply interceptors to both instances
// addAuthInterceptor(api);
// addAuthInterceptor(apiForFiles);

// addErrorInterceptor(api);
// addErrorInterceptor(apiForFiles);
// const setAccessToken = (token) => {
//   if (token) {
//     localStorage.setItem("access_token", token);
//     api.defaults.headers["Authorization"] = `Bearer ${token}`;
//     apiForFiles.defaults.headers["Authorization"] = `Bearer ${token}`;
//   } else {
//     localStorage.removeItem("access_token");
//     delete api.defaults.headers["Authorization"];
//     delete apiForFiles.defaults.headers["Authorization"];
//   }
// };

// // Export the Axios instances
// export { api, apiForFiles, apiForFileDownload, setAccessToken };