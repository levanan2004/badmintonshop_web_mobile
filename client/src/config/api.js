// API Configuration
const API_SERVER_URL =
  process.env.REACT_APP_API_SERVER || "http://localhost:3000";
const API_CLIENT_URL =
  process.env.REACT_APP_API_CLIENT || "http://localhost:3001";

export const API_CONFIG = {
  SERVER_URL: API_SERVER_URL,
  CLIENT_URL: API_CLIENT_URL,
  UPLOADS_URL: API_CLIENT_URL,
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: `${API_SERVER_URL}/auth/login`,
    REGISTER: `${API_SERVER_URL}/auth/register`,

    // User endpoints
    PROFILE_USER: `${API_SERVER_URL}/profileUser`,
    UPDATE_PROFILE_USER: `${API_SERVER_URL}/updateprofileUser`,
    CHANGE_PASSWORD_USER: `${API_SERVER_URL}/profile/changepasswordUser`,
    ORDER_USER: `${API_SERVER_URL}/order`,

    // Product endpoints
    PRODUCTS: `${API_SERVER_URL}/products`,
    PRODUCT_DETAILS: (id) => `${API_SERVER_URL}/products/productdetails/${id}`,

    // Admin endpoints
    ADMIN_ORDERS: `${API_SERVER_URL}/privatesite/orders`,
    ADMIN_ORDER_DELETE: (id) =>
      `${API_SERVER_URL}/privatesite/orders/delete/${id}`,
    ADMIN_ORDER_CHANGE_STATUS: (id) =>
      `${API_SERVER_URL}/privatesite/orders/changestatus/${id}`,
    ADMIN_ORDER_DETAIL: (id) => `${API_SERVER_URL}/privatesite/orders/${id}`,
    ADMIN_PRODUCTS: `${API_SERVER_URL}/privatesite/products`,
    ADMIN_PRODUCT_DELETE: (id) =>
      `${API_SERVER_URL}/privatesite/products/${id}`,
    ADMIN_PROFILE: `${API_SERVER_URL}/privatesite/profile`,
    ADMIN_UPDATE_PROFILE: `${API_SERVER_URL}/privatesite/updateprofile`,
    ADMIN_CHANGE_PASSWORD: `${API_SERVER_URL}/privatesite/profile/changepassword`,
    ADMIN_REVENUE: `${API_SERVER_URL}/privatesite/revenue`,
    ADMIN_SLOT_TIMES: `${API_SERVER_URL}/privatesite/slot-times`,
    ADMIN_SLOT_TIME_DELETE: (id) =>
      `${API_SERVER_URL}/privatesite/slot-times/${id}`,
    ADMIN_SLOT_TIME_EDIT: (id) =>
      `${API_SERVER_URL}/privatesite/edit-slot-times/${id}`,

    // Booking endpoints
    BOOKING_HISTORY: `${API_SERVER_URL}/booking-history`,
    BOOKING_CANCEL: `${API_SERVER_URL}/booking/cancel-many`,
    BRANCHES: `${API_SERVER_URL}/branches`,
    COURTS: `${API_SERVER_URL}/courts`,
    TIMESLOTS: `${API_SERVER_URL}/timeslots`,
    BOOKED_SLOTS: `${API_SERVER_URL}/booked-slots`,
    BOOKING: `${API_SERVER_URL}/booking`,

    // Cart & Checkout
    CART: `${API_SERVER_URL}/cart`,
    CHECKOUT: `${API_SERVER_URL}/checkout`,

    // Comments
    COMMENTS: (productId) => `${API_SERVER_URL}/comments/${productId}`,
    ADD_COMMENT: `${API_SERVER_URL}/comments`,
    DELETE_COMMENT: (commentId) => `${API_SERVER_URL}/comments/${commentId}`,
    ADD_REPLY: `${API_SERVER_URL}/comments/reply`,
    GET_REPLIES: (commentId) =>
      `${API_SERVER_URL}/comments/${commentId}/replies`,
    DELETE_REPLY: (replyId) => `${API_SERVER_URL}/comments/reply/${replyId}`,
  },
};

// Helper functions for common API calls
export const apiHelpers = {
  // GET request helper
  get: async (url, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers,
    });
    return response;
  },

  // POST request helper
  post: async (url, data, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return response;
  },

  // PUT request helper
  put: async (url, data, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return response;
  },

  // DELETE request helper
  delete: async (url, token = null) => {
    const headers = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: "DELETE",
      headers,
    });
    return response;
  },
};

export default API_CONFIG;
