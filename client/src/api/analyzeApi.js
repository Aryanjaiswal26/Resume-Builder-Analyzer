import api from "./client";

export const analyzeResume = async ({ file, jobDescription }) => {
  const form = new FormData();
  form.append("resume", file);
  form.append("jobDescription", jobDescription);
  const { data } = await api.post("/analyze", form);
  return data;
};

export const improveResume = async (payload) => {
  const { data } = await api.post("/analyze/improve", payload);
  return data;
};
