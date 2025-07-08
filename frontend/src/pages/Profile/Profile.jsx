import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  FaEdit,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBirthdayCake,
} from "react-icons/fa";
import { Link, useParams, useNavigate } from "react-router-dom";
import TweetsSection from "../../components/common/TweetsSection";
import "./Profile.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUsers, setModalUsers] = useState([]);
  const [displayCount, setDisplayCount] = useState(5);
  const [activeTab, setActiveTab] = useState("tweets");

  const { tab } = useParams(); // e.g., liked/saved
  const navigate = useNavigate();

  const userInfo = JSON.parse(sessionStorage.getItem("user"));
  const userId = userInfo?._id;

  const fetchUser = useCallback(() => {
    if (userId) {
      axios
        .get(`${API_BASE_URL}/api/users/${userId}`)
        .then((res) => setUser(res.data))
        .catch((err) => console.error("Error fetching user:", err));
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
    const showImageDelay = sessionStorage.getItem("showImageDelayPopup");
    if (showImageDelay === "true") {
      // alert("Your profile picture may take a few moments to update.");
      sessionStorage.removeItem("showImageDelayPopup");
    }
  }, [fetchUser]);

  // Handle URL tab syncing
  useEffect(() => {
    if (!tab || tab === "tweets") {
      setActiveTab("tweets");
    } else if (["liked", "saved"].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab("tweets");
      navigate("/profile"); // fallback if invalid tab
    }
  }, [tab, navigate]);

  const handleTabClick = (selectedTab) => {
    setActiveTab(selectedTab);
    if (selectedTab === "tweets") {
      navigate("/profile");
    } else {
      navigate(`/profile/${selectedTab}`);
    }
  };

  const openModal = (type) => {
    if (!user) return;
    setModalTitle(type === "followers" ? "Followers" : "Following");

    if (type === "followers") {
      const enrichedFollowers = user.followers.map((follower) => ({
        ...follower,
        isFollowing: user.following.some((f) => f._id === follower._id),
      }));
      setModalUsers(enrichedFollowers);
    } else {
      const enrichedFollowing = user.following.map((f) => ({
        ...f,
        isFollowing: true,
      }));
      setModalUsers(enrichedFollowing);
    }

    setDisplayCount(5);
    setShowModal(true);
  };

  const showNextUsers = () => {
    setDisplayCount((prev) => Math.min(prev + 5, modalUsers.length));
  };

  const closeModal = () => {
    setShowModal(false);
    setModalUsers([]);
    setDisplayCount(5);
    fetchUser();
  };

  const handleFollowToggle = async (targetUserId, currentlyFollowing) => {
    try {
      const endpoint = currentlyFollowing ? "unfollow" : "follow";
      await axios.put(`${API_BASE_URL}/api/users/${endpoint}/${targetUserId}`, {
        followerId: userId,
      });

      setModalUsers((prev) =>
        prev.map((u) =>
          u._id === targetUserId ? { ...u, isFollowing: !currentlyFollowing } : u
        )
      );
    } catch (err) {
      console.error("Follow/Unfollow Error:", err);
    }
  };

  if (!user) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-page">
      <div className="profile-full-wrapper">
        <div className="profile-wrapper">
          <div className="profile-photo">
            <img src={userInfo.photo} alt="Profile" />
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
              onClick={() => (window.location.href = "/profile/edit")}
            >
              <FaEdit style={{ marginRight: "6px" }} />
              Edit Profile
            </button>
          </div>
        </div>

        {/* === Tabs === */}
        <div className="profile-tabs">
          <button
            className={activeTab === "tweets" ? "active-tab" : ""}
            onClick={() => handleTabClick("tweets")}
          >
            Tweets
          </button>
          <button
            className={activeTab === "liked" ? "active-tab" : ""}
            onClick={() => handleTabClick("liked")}
          >
            Liked
          </button>
          <button
            className={activeTab === "saved" ? "active-tab" : ""}
            onClick={() => handleTabClick("saved")}
          >
            Saved
          </button>
        </div>

        {/* === Render Tab Content === */}
        <div className="profile-tab-content">
          {activeTab === "liked" && (
            <TweetsSection
              type="liked"
              endpoint={`/api/tweets/liked/${user._id}`}
              title="Liked Tweets"
            />
          )}
          {activeTab === "saved" && (
            <TweetsSection
              type="saved"
              endpoint={`/api/tweets/saved/${user._id}`}
              title="Saved Tweets"
            />
          )}
          {activeTab === "tweets" && (
            <TweetsSection
              type="Posted"
              endpoint={`/api/tweets/posted/${user._id}`}
              title="Posted Tweets"
            />
          )}
        </div>

        {/* === Followers/Following Modal === */}
        {showModal && (
          <div className="modal-backdrop">
            <div className="modal-box">
              <h3>{modalTitle}</h3>
              <button className="close-btn" onClick={closeModal}>
                ×
              </button>

              <div className="modal-user-list">
                {modalUsers.slice(0, displayCount).map((u, idx) => (
                  <div key={idx} className="user-modal-card">
                    <div className="user-info-row">
                      <div className="user-left">
                        <img
                          src={`https://chatter-profile-pics.s3.ap-south-1.amazonaws.com/profile-pics/${u._id}.jpeg`}
                          alt="User"
                          className="modal-user-photo"
                        />
                        <Link
                          to={`/user/${encodeURIComponent(u.email)}`}
                          className="user-email"
                        >
                          {u.email}
                        </Link>
                      </div>

                      <button
                        className={u.isFollowing ? "unfollow-btn" : "follow-btn"}
                        onClick={() => handleFollowToggle(u._id, u.isFollowing)}
                      >
                        {u.isFollowing ? "Unfollow" : "Follow"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {displayCount < modalUsers.length && (
                <button className="more-btn" onClick={showNextUsers}>
                  More
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
