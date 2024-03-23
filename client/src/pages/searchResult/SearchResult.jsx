import React, { useState, useEffect } from 'react';
import Avatar from '../../assets/avatar.jpg';
import './search-result.scss';
import { Link, useLocation } from 'react-router-dom';
import { makeRequest } from "../../axios";

const SearchResult = () => {
  const location = useLocation();
  const users = location.state.users || [];
  const searchTerm = new URLSearchParams(location.search).get('q');
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    window.scrollTo(0, -1);
  }, []);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        const response = await makeRequest.get("/relationships/following");
        const followingIds = response.data.map(following => following.userId);
        const followingMap = Object.fromEntries(followingIds.map(id => [id, true]));
        setFollowingMap(followingMap);
      } catch (error) {
        console.error("Error fetching following:", error);
      }
    };
    fetchFollowing();
  }, []);

  const handleFollow = async (userId) => {
    try {
      if (followingMap[userId]) {
        await makeRequest.delete(`/relationships?userId=${userId}`);
        setFollowingMap(prevMap => ({ ...prevMap, [userId]: false }));
      } else {
        await makeRequest.post("/relationships", { userId });
        setFollowingMap(prevMap => ({ ...prevMap, [userId]: true }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  return (
    <div className='search-container container-fluid px-5'>
      <div className="py-5">
        <h1>Search Result for "{searchTerm}":</h1>
      </div>
      {users.length > 0 ? (
        <div>
          {users.map(user => (
            <div key={user._id} className='search-item rounded-4 my-2 p-2 d-flex justify-content-between align-items-center'>
              <Link to={`/profile/${user._id}`} className='d-flex gap-3 uinfo'>
                {user.profilePic ? (
                  <img className='img-fluid rounded-circle profile-img' src={`/upload/${user.profilePic}`} alt={user.username} />
                ) : (
                  <img className='img-fluid rounded-circle profile-img' src={Avatar} alt="" />
                )}
                <h5 className='my-auto'>{user.name || user.username}</h5>
              </Link>
              <button className='btn btn-primary btn-follow' onClick={() => handleFollow(user._id)}>
                {followingMap[user._id] ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p>No user found</p>
      )}
    </div>
  );
};

export default SearchResult;
