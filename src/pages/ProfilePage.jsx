import React, { useEffect, useState } from "react";
import { Avatar, Button, TextField } from "@mui/material";
import { AiFillEdit } from "react-icons/ai";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../axiosConfig";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user } = useSelector((store) => store.basic);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(user?.profile_image || null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    zip_code: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await api.get("/buyer/profile");
        if (response.data?.status === "success") {
          const profile = response.data.data || {};
          setFormData({
            first_name: profile.first_name || "",
            last_name: profile.last_name || "",
            email: profile.email || "",
            phone: profile.phone || "",
            address: profile.address || "",
            zip_code: profile.zip_code || "",
          });
          if (profile.profile_image) {
            setProfileImagePreview(profile.profile_image);
          }
        }
      } catch (error) {
        console.error("Failed to load profile data:", error);
        toast.error("Failed to load profile data");
      }
    };

    loadProfile();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setProfileImageFile(file);
    const previewUrl = URL.createObjectURL(file);
    setProfileImagePreview(previewUrl);
  };

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!formData.first_name || formData.first_name.trim().length < 2) nextErrors.first_name = "First name must be at least 2 characters";
    if (!formData.last_name || formData.last_name.trim().length < 2) nextErrors.last_name = "Last name must be at least 2 characters";
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) nextErrors.email = "Invalid email address";
    if (!/^[0-9]{10}$/.test(formData.phone || "")) nextErrors.phone = "Phone number must be exactly 10 digits";
    if (!formData.address || formData.address.trim().length < 3) nextErrors.address = "Location must be at least 3 characters";
    if (!formData.zip_code || formData.zip_code.trim().length < 6) nextErrors.zip_code = "Pincode must be at least 6 characters";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });
      if (profileImageFile) payload.append("profileImage", profileImageFile);

      const response = await api.post("/buyer/update-profile", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(response.data?.message || "Profile updated");
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error.response?.data?.error || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Profile</h1>
          <p>Update your account details and profile photo.</p>
        </div>

        <div className="profile-avatar-wrap">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="profile-avatar-input"
            id="profile-image-input"
          />
          <label htmlFor="profile-image-input" className="profile-avatar-label">
            <Avatar
              src={profileImagePreview || "https://via.placeholder.com/150"}
              alt="Profile"
              sx={{ width: 124, height: 124 }}
              className="profile-avatar-img"
            >
              {!profileImagePreview && formData.first_name ? formData.first_name.charAt(0).toUpperCase() : ""}
            </Avatar>
            <span className="profile-edit-badge">
              <AiFillEdit size={18} />
            </span>
          </label>
        </div>

        <form onSubmit={onSubmit} className="profile-form">
          <TextField label="First Name" fullWidth value={formData.first_name} onChange={handleChange("first_name")} error={!!errors.first_name} helperText={errors.first_name} InputLabelProps={{ shrink: true }} />
          <TextField label="Last Name" fullWidth value={formData.last_name} onChange={handleChange("last_name")} error={!!errors.last_name} helperText={errors.last_name} InputLabelProps={{ shrink: true }} />
          <TextField label="Email" fullWidth value={formData.email} onChange={handleChange("email")} error={!!errors.email} helperText={errors.email} InputLabelProps={{ shrink: true }} />
          <TextField label="Phone Number" fullWidth value={formData.phone} onChange={handleChange("phone")} error={!!errors.phone} helperText={errors.phone} InputLabelProps={{ shrink: true }} />
          <TextField label="Location" fullWidth value={formData.address} onChange={handleChange("address")} error={!!errors.address} helperText={errors.address} InputLabelProps={{ shrink: true }} />
          <TextField label="Pincode" fullWidth value={formData.zip_code} onChange={handleChange("zip_code")} error={!!errors.zip_code} helperText={errors.zip_code} InputLabelProps={{ shrink: true }} />

          <div className="profile-actions">
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
