import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const verifyApi = {
    uploadDocument: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(`${API_BASE_URL}/verify/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // { job_id: string, status: string }
    },
    
    getJobStatus: async (jobId: string) => {
        const response = await apiClient.get(`/verify/status/${jobId}`);
        return response.data;
    }
};
