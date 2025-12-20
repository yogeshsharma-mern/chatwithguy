import axios from "axios";

function getHeaders() {
    return { "Content-Type": "application/json" };
}

const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: getHeaders(),
});

instance.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (!token) return config;

    return {
        ...config,
        headers: { ...config.headers, Authorization: `Bearer ${token}` },
    };
});

function apiPost(url, body) {
    let headers = {};

    // 👇 Detect if body is FormData
    if (body instanceof FormData) {
        headers["Content-Type"] = "multipart/form-data";
    } else {
        headers["Content-Type"] = "application/json";
    }

    return instance
        .post(url, body, { headers })
        .then((res) => res.data)
        .catch((err) => {
            console.error("API POST error:", err);
            throw err;
        });
}



function apiGet(url, params = {}) {
    return instance.get(url, { params }).then(res => res.data);
}

// function apiPut(url, body) {
//   const isFormData = body instanceof FormData;
//   return instance.put(url, body, {
//     headers:  { "Content-Type": "multipart/form-data" },
//   }).then(res => res.data);
// }
//
function apiPut(url, body) {
    let headers = {};

    // 👇 Detect if body is FormData
    if (body instanceof FormData) {
        headers["Content-Type"] = "multipart/form-data";
    } else {
        headers["Content-Type"] = "application/json";
    }

    return instance
        .put(url, body, { headers })
        .then((res) => res.data)
        .catch((err) => {
            console.error("API PUT error:", err);
            throw err;
        });
}
function apiPatch(url, body) {
    let headers = {};

    // 👇 Detect if body is FormData
    if (body instanceof FormData) {
        headers["Content-Type"] = "multipart/form-data";
    } else {
        headers["Content-Type"] = "application/json";
    }

    return instance
        .patch(url, body, { headers })
        .then((res) => res.data)
        .catch((err) => {
            console.error("API PUT error:", err);
            throw err;
        });
}
//
function apiDelete(url, data) {
    return instance.delete(url, {
        data,   // 👈 THIS IS THE BODY
        headers: {
            "Content-Type": "application/json",
        },
    }).then(res => res.data);
}


export { getHeaders, apiGet, apiPost, apiPut, apiDelete, apiPatch };
