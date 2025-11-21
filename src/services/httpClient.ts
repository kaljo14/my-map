import auth from './auth';

/**
 * HTTP client that automatically attaches authentication token to requests
 */
class HttpClient {
    private async getAuthHeaders(): Promise<HeadersInit> {
        const token = auth.getToken();

        if (token) {
            return {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            };
        }

        return {
            'Content-Type': 'application/json',
        };
    }

    async get(url: string): Promise<Response> {
        const headers = await this.getAuthHeaders();
        return fetch(url, {
            method: 'GET',
            headers,
        });
    }

    async post(url: string, data?: any): Promise<Response> {
        const headers = await this.getAuthHeaders();
        return fetch(url, {
            method: 'POST',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put(url: string, data?: any): Promise<Response> {
        const headers = await this.getAuthHeaders();
        return fetch(url, {
            method: 'PUT',
            headers,
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete(url: string): Promise<Response> {
        const headers = await this.getAuthHeaders();
        return fetch(url, {
            method: 'DELETE',
            headers,
        });
    }
}

export default new HttpClient();
