import axiosInstance from './axiosInstance';

export const updateProfile = (data) => axiosInstance.patch('/core/profile/update/', data);
export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return axiosInstance.post('/core/profile/avatar/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteAvatar = () => axiosInstance.delete('/core/profile/avatar/');
export const uploadCertificate = (certType, file) => {
  const formData = new FormData();
  formData.append('cert_type', certType);
  formData.append('file', file);
  return axiosInstance.post('/core/profile/certificate/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};