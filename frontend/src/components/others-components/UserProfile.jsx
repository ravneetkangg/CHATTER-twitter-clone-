import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBirthdayCake
} from "react-icons/fa";

import "./Profile.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserProfile = () => {
  const { email } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (email) {
      axios
        .get(`${API_BASE_URL}/api/users/by-email/${email}`)
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Error fetching user:", err));
    }
  }, [email]);

  if (!user) return <div className="loading">Loading user profile...</div>;

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        <div className="profile-photo">
          <img
            src={`https://chatter-profile-pics.s3.ap-south-1.amazonaws.com/profile-pics/${user._id}.jpeg`}
            alt="User"
          />
        </div>

        <div className="profile-details">
          <h2>{user.email}</h2>
          <p>
            <FaCalendarAlt style={{ marginRight: "6px" }} />
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </p>

          {user.address && (
            <p>
              <FaMapMarkerAlt style={{ marginRight: "6px" }} />
              {user.address}
            </p>
          )}

          {user.dob && (
            <p>
              <FaBirthdayCake style={{ marginRight: "6px" }} />
              DOB: {new Date(user.dob).toLocaleDateString("en-GB")}
            </p>
          )}

          <div className="follow-stats">
            <div className="clickable">
              <p>{user.tweets?.length || 0}</p>
              <span>Tweets</span>
            </div>
            <div className="clickable">
              <p>{user.followers?.length || 0}</p>
              <span>Followers</span>
            </div>
            <div className="clickable">
              <p>{user.following?.length || 0}</p>
              <span>Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
