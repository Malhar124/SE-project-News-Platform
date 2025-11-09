import React, { useState, useEffect, useContext } from "react";
import "./ProfilePage.css";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase"; // ✅ Firestore config
import { StoreContext } from "../../context/Storecontext";
import { toast } from "react-toastify";

export default function ProfilePage() {
  const { token } = useContext(StoreContext);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
    country: "",
    email: "user_12345@anon.com",
    preferences: [],
  });

  const [loading, setLoading] = useState(true);
  const preferencesList = [
    "Politics",
    "Technology",
    "Sports",
    "Entertainment",
    "Business",
    "Science",
    "Health",
  ];

  // ✅ Load user data from Firestore
  useEffect(() => {
    const loadProfile = async () => {
      try {
        // const userId = localStorage.getItem("userId") || "guest";
        const userId = localStorage.getItem("userId");
        if (!userId) {
          console.error("User not logged in");
          return;
        }
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProfile({ ...profile, ...docSnap.data() });
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ Handle text field changes
  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  // ✅ Handle preference toggle
  const handlePreferenceChange = (pref) => {
    setProfile((prev) => {
      const prefs = prev.preferences.includes(pref)
        ? prev.preferences.filter((p) => p !== pref)
        : [...prev.preferences, pref];
      return { ...prev, preferences: prefs };
    });
  };

  // ✅ Save to Firestore
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId") || "guest";

    try {
      await setDoc(doc(db, "users", userId), profile, { merge: true });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
    }
  };

  if (loading) return <p>Loading profile...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="avatar">
            {profile.name ? profile.name[0].toUpperCase() : "U"}
          </div>
          <h2>{profile.name || "User Profile"}</h2>
          <p>Manage your account details and preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <label>Full Name (Required)</label>
          <input
            name="name"
            value={profile.name}
            onChange={handleInputChange}
            placeholder="e.g., Jane Doe"
            required
          />

          <label>Username</label>
          <input
            name="username"
            value={profile.username}
            onChange={handleInputChange}
            placeholder="e.g., news_reader_jane"
          />

          <label>Country</label>
          <select
            name="country"
            value={profile.country}
            onChange={handleInputChange}
          >
            <option value="">Select your country</option>
            <option value="India">India</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>

          <label>Email Address (Read-Only)</label>
          <input type="email" value={profile.email} readOnly />

          <label>News Preferences</label>
          <div className="preferences-grid">
            {preferencesList.map((pref) => (
              <button
                type="button"
                key={pref}
                onClick={() => handlePreferenceChange(pref)}
                className={`preference-btn ${
                  profile.preferences.includes(pref) ? "active" : ""
                }`}
              >
                {pref}
              </button>
            ))}
          </div>

          <button type="submit" className="save-btn">
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
}