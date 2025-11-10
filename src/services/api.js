/**
 * ApiService
 * Centralized client for mobile (Expo) and potential web usage to interact with
 * Next.js API routes.
 *
 * Features:
 * - Base URL resolved from environment (`API_BASE_URL`) with a dev fallback.
 * - Uniform error handling: throws Error with message from server payload.
 * - Multi-part upload support for image detection (no manual content-type header).
 *
 * Methods return parsed JSON responses and throw on non-2xx status codes.
 */
// Environment override so devices/emulators can point to the correct host.
// Update `API_BASE_URL` for real deployments; fallback is for local dev only.
const DEFAULT_DEV_HOST = "http://172.17.73.127:3000"; // your machine IP (updated)
const API_BASE_URL = process.env.API_BASE_URL || `${DEFAULT_DEV_HOST}/api`;

class ApiService {
  /**
   * Low-level request wrapper.
   * @param {string} endpoint - Endpoint path beginning with '/'.
   * @param {RequestInit & { headers?: Record<string,string> }} options - Fetch options.
   * @returns {Promise<any>} Parsed JSON body.
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  /**
   * Upload image for food detection.
   * @param {string} imageUri - Local file URI from Expo ImagePicker.
   * @returns {Promise<{label:string|null,confidence:number,items?:any}>}
   */
  async detectFood(imageUri) {
    const url = `${API_BASE_URL}/detect`;

    const form = new FormData();
    // Expo/React Native FormData file shape
    form.append('image', {
      uri: imageUri,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    const response = await fetch(url, {
      method: 'POST',
      // Let fetch set the correct multipart boundary header
      body: form,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Detection failed');
    }
    return data; // { label, confidence, items }
  }

  /** List all items */
  async getItems() {
    return this.request("/items");
  }

  /** Fetch single item by id */
  async getItem(id) {
    return this.request(`/items/${id}`);
  }

  /** Create item (expects quantity & unit) */
  async createItem(itemData) {
    return this.request("/items", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  }

  /** Update item by id */
  async updateItem(id, itemData) {
    return this.request(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(itemData),
    });
  }

  /** Delete item by id */
  async deleteItem(id) {
    return this.request(`/items/${id}`, {
      method: "DELETE",
    });
  }

  /** Bulk delete items */
  async bulkDeleteItems(itemIds) {
    return this.request("/items/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ itemIds }),
    });
  }

  /** List categories */
  async getCategories() {
    return this.request("/categories");
  }

  /** Fetch category by id */
  async getCategory(id) {
    return this.request(`/categories/${id}`);
  }

  /** Create category */
  async createCategory(categoryData) {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  }

  /** Update category */
  async updateCategory(id, categoryData) {
    return this.request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  }

  /** Delete category */
  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  /** Bulk delete categories */
  async bulkDeleteCategories(categoryIds) {
    return this.request("/categories/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ categoryIds }),
    });
  }

  /** Dashboard aggregated metrics */
  async getDashboardData() {
    return this.request("/dashboard");
  }

  /** AI-like suggestions */
  async getSuggestions() {
    return this.request("/dashboard/suggestions");
  }

  /** Items nearing expiry */
  async getExpiringItems() {
    return this.request("/expiring");
  }

  /** Send chat message to AI backend */
  async sendChatMessage(message) {
    return this.request("/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }
}

export default new ApiService();
