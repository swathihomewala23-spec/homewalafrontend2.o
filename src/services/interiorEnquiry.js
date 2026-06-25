import { api } from "../axiosConfig";

export const transformFormDataForAPI = (formData) => {
  return {
    name: formData.name.trim(),
    email: formData.email.trim(),
    countryCode: "+91",
    mobile: formData.phone.trim(),
    message: formData.message?.trim() || "",
    source: "interior-page",
  };
};

export const submitInteriorEnquiry = async (enquiryData) => {
  try {
    const response = await api.post("property-enquiries", enquiryData);
    return response;
  } catch (error) {
    throw error;
  }
};