async function apiRequestWrapper<T>(apiCall: () => Promise<T>): Promise<T | { success: false }> {
    try {
        return await apiCall();
    } catch (error) {
        console.error("Api request error:", error);
        return { success: false };
    }
}

export default apiRequestWrapper;