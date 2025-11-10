// Prefer an environment override so devices/emulators can point to the correct host.
// Update `API_BASE_URL` in your dev environment when necessary. Fallbacks provided
// below are for local development only.
const DEFAULT_DEV_HOST = "http://172.17.73.127:3000"; // your machine IP (updated)
const API_BASE_URL = process.env.API_BASE_URL || `${DEFAULT_DEV_HOST}/api`;

class ApiService {
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

  async getItems() {
    return this.request("/items");
  }

  async getItem(id) {
    return this.request(`/items/${id}`);
  }

  async createItem(itemData) {
    return this.request("/items", {
      method: "POST",
      body: JSON.stringify(itemData),
    });
  }

  async updateItem(id, itemData) {
    return this.request(`/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(itemData),
    });
  }

  async deleteItem(id) {
    return this.request(`/items/${id}`, {
      method: "DELETE",
    });
  }

  async bulkDeleteItems(itemIds) {
    return this.request("/items/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ itemIds }),
    });
  }

  async getCategories() {
    return this.request("/categories");
  }

  async getCategory(id) {
    return this.request(`/categories/${id}`);
  }

  async createCategory(categoryData) {
    return this.request("/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/categories/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  }

  async deleteCategory(id) {
    return this.request(`/categories/${id}`, {
      method: "DELETE",
    });
  }

  async bulkDeleteCategories(categoryIds) {
    return this.request("/categories/bulk-delete", {
      method: "POST",
      body: JSON.stringify({ categoryIds }),
    });
  }

  async getDashboardData() {
    return this.request("/dashboard");
  }

  async getSuggestions() {
    return this.request("/dashboard/suggestions");
  }

  async getExpiringItems() {
    return this.request("/expiring");
  }

  async sendChatMessage(message) {
    return this.request("/chat", {
      method: "POST",
      body: JSON.stringify({ message }),
    });
  }
}

export default new ApiService();
