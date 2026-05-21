import api from "./client";

export const fetchResumes = async () => {
  const { data } = await api.get("/resume");
  return data;
};

export const createResume = async (payload) => {
  const { data } = await api.post("/resume", payload);
  return data;
};

export const generateResumeBullets = async (payload) => {
  const { data } = await api.post("/resume/generate-bullets", payload);
  return data;
};
