import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaCalendarAlt, FaMapMarkerAlt, FaBirthdayCake } from "react-icons/fa";

import "./Profile.css";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;


const Profile = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState([]);
  const [currentModalIndex, setCurrentModalIndex] = useState(0);
  const userInfo = JSON.parse(sessionStorage.getItem("user"));
  const userId = userInfo?._id;

  useEffect(() => {
    if (userId) {
      axios
        .get(`${API_BASE_URL}/api/users/${userId}`)
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Error fetching user:", err));
    }
  }, [userId]);

  const openModal = (type) => {
    if (!user) return;
    setModalTitle(type === "followers" ? "Followers" : "Following");
    setModalUsers(type === "followers" ? user.followers : user.following);
    setCurrentModalIndex(0); // reset index
    setShowModal(true);
  };

  const showNextUser = () => {
    setCurrentModalIndex((prev) =>
      prev < modalUsers.length - 1 ? prev + 1 : prev
    );
  };

  const closeModal = () => {
    setShowModal(false);
    setModalUsers([]);
  };

  if (!user) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        <div className="profile-photo">
          <img
            src={`${API_BASE_URL}/api/users/get-photo/${user._id}`}
            alt="Profile"
          />
        </div>
        <div className="profile-details">
          <h2>{user.email}</h2>
          <p><FaCalendarAlt style={{ marginRight: "6px" }} />Joined: {new Date(user.createdAt).toLocaleDateString()}</p>

          {user.address && (
            <p><FaMapMarkerAlt style={{ marginRight: "6px" }} />{user.address}</p>
          )}

          {user.dob && (
            <p><FaBirthdayCake style={{ marginRight: "6px" }} />DOB: {new Date(user.dob).toLocaleDateString("en-GB")}</p>
          )}

          <div className="follow-stats">
            <div className="clickable">
              <p>{user.tweets?.length || 0}</p>
              <span>Tweets</span>
            </div>
            <div onClick={() => openModal("followers")} className="clickable">
              <p>{user.followers?.length || 0}</p>
              <span>Followers</span>
            </div>
            <div onClick={() => openModal("following")} className="clickable">
              <p>{user.following?.length || 0}</p>
              <span>Following</span>
            </div>
          </div>
        </div>
        <div className="edit-btn-wrapper">
          <button
            className="edit-profile-btn"
            onClick={() => window.location.href = "/profile/edit"}
          >
            <FaEdit style={{ marginRight: "6px" }} />
            Edit Profile
          </button>
        </div>

      </div>

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h3>{modalTitle}</h3>
            <button className="close-btn" onClick={closeModal}>×</button>

            <div className="modal-user-list">
              {modalUsers.slice(0, currentModalIndex + 1).map((u, idx) => (
                <div key={idx} className="user-modal-card">
                  <div className="user-info-row">
                    <div className="user-left">
                      <img
                        src={`${API_BASE_URL}/api/users/get-photo/${u._id}`}
                        alt="User"
                        className="modal-user-photo"
                      />
                      <p className="user-email">{u.email}</p>
                    </div>
                    <button className="unfollow-btn">Unfollow</button>
                  </div>
                </div>
              ))}
            </div>

            {currentModalIndex < modalUsers.length - 1 && (
              <button className="more-btn" onClick={showNextUser}>More</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
