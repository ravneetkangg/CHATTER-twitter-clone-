import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBirthdayCake,
} from "react-icons/fa";

import TweetsSection from "../../components/common/TweetsSection";
import "./Profile.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const OtherUserProfile = () => {
  const { email } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null);

  useEffect(() => {
    const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
    if (loggedInUser) {
      setLoggedInUserId(loggedInUser._id);
      if (email === loggedInUser.email) {
        navigate("/profile");
        return;
      }
    }

    if (email) {
      axios
        .get(`${API_BASE_URL}/api/users/by-email/${email}`)
        .then((res) => {
          setUser(res.data);
          if (loggedInUser && res.data.followers.includes(loggedInUser._id)) {
            setIsFollowing(true);
          }
        })
        .catch((err) => console.error("Error fetching user:", err));
    }
  }, [email, navigate]);

  const handleFollow = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/users/follow/${user._id}`, {
        followerId: loggedInUserId,
      });
      setIsFollowing(true);
      setUser((prev) => ({
        ...prev,
        followers: [...prev.followers, loggedInUserId],
      }));
    } catch (err) {
      console.error("Error following user:", err);
    }
  };

  const handleUnfollow = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/users/unfollow/${user._id}`, {
        followerId: loggedInUserId,
      });
      setIsFollowing(false);
      setUser((prev) => ({
        ...prev,
        followers: prev.followers.filter((id) => id !== loggedInUserId),
      }));
    } catch (err) {
      console.error("Error unfollowing user:", err);
    }
  };

  if (!user) return <div className="loading">Loading user profile...</div>;

  return (
    <div className="profile-page">
      <div className="profile-full-wrapper">
        {/* === Profile Card === */}
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
              <FaCalendarAlt /> Joined:{" "}
              {new Date(user.createdAt).toLocaleDateString()}
            </p>

            {user.address && (
              <p>
                <FaMapMarkerAlt /> {user.address}
              </p>
            )}

            {user.dob && (
              <p>
                <FaBirthdayCake /> DOB:{" "}
                {new Date(user.dob).toLocaleDateString("en-GB")}
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

            <div style={{ marginTop: "20px" }}>
              {isFollowing ? (
                <button className="unfollow-btn" onClick={handleUnfollow}>
                  Unfollow
                </button>
              ) : (
                <button className="follow-btn" onClick={handleFollow}>
                  Follow
                </button>
              )}
            </div>
          </div>
        </div>

        {/* === Only Tweet Section === */}
        <div className="profile-tab-content">
          <TweetsSection type="user" endpoint={`/api/tweets/posted/${user._id}`} />
        </div>
      </div>
    </div>
  );
};

export default OtherUserProfile;
