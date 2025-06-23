import React, { useState, useEffect } from "react";
import axios from "axios";
import "./EditProfile.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const EditProfile = () => {
  const userInfo = JSON.parse(sessionStorage.getItem("user"));
  const userId = userInfo?._id;
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");

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

  const handleSave = () => {
    axios
      .put(`${API_BASE_URL}/api/users/update-profile/${userId}`, { dob, address })
      .then(() => window.location.href = "/profile")
      .catch((err) => console.error("Error updating profile:", err));
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-wrapper">
        <h2>Edit Profile</h2>

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
          <button className="cancel-btn" onClick={() => window.location.href = "/profile"}>
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
