import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditProfile.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const EditProfile = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("user"));
  const userId = userInfo?._id;

  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [previewImage, setPreviewImage] = useState(null); // for live preview
  const [selectedFile, setSelectedFile] = useState(null); // actual file

  useEffect(() => {
    if (userId) {
      axios
        .get(`${API_BASE_URL}/api/users/${userId}`)
        .then((res) => {
          setDob(res.data.dob?.substring(0, 10) || "");
          setAddress(res.data.address || "");
        })
        .catch((err) => console.error("Error fetching user:", err));
    }
  }, [userId]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append("userId", userId);
        formData.append("photo", selectedFile);

        await axios.post(`${API_BASE_URL}/api/users/upload-photo`, formData);

        // ✅ Set alert flag ONLY if image was changed
        sessionStorage.setItem("showImageDelayPopup", "true");
      }

      await axios.put(`${API_BASE_URL}/api/users/update-profile/${userId}`, {
        dob,
        address,
      });

      window.location.href = "/profile";
    } catch (err) {
      console.error("Error updating profile:", err);
    }
  };
  return (
    <div className="edit-profile-page">
      <div className="edit-profile-wrapper">
        <h2>Edit Profile</h2>

        {/* === Profile Image Preview === */}
        <div className="edit-profile-photo-section">
          <img
            src={
              previewImage
                ? previewImage
                : `https://chatter-profile-pics.s3.ap-south-1.amazonaws.com/profile-pics/${userId}.jpeg`
            }
            alt="Profile Preview"
            className="edit-profile-photo"
          />
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <label htmlFor="dob">Date of Birth:</label>
        <input
          id="dob"
          type="date"
          value={dob}
          onChange={(e) => setDob(e.target.value)}
          className="edit-input"
        />

        <label htmlFor="address">Address:</label>
        <input
          id="address"
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="edit-input"
        />

        <div className="edit-actions">
          <button
            className="cancel-btn"
            onClick={() => (window.location.href = "/profile")}
          >
            Cancel
          </button>
          <button className="save-btn" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
