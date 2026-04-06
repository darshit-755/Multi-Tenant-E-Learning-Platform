import API from "./api";

// Get all batches (tenant)
export const getBatchesApi = () => {
  return API.get("/tenant/batches");
};

// Create a batch (tenant)
export const createBatchApi = (data) => {
  return API.post("/tenant/batches", data);
};

// Update a batch (tenant)
export const updateBatchApi = (batchId, data) => {
  return API.put(`/tenant/batches/${batchId}`, data);
};

// Get my batches (tutor)
export const getTutorBatchesApi = () => {
  return API.get("/tutor/my-batches");
};
