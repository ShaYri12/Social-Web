import React, { useState, useEffect } from "react";
import Avatar from '../../assets/avatar.jpg'
import { makeRequest } from "../../axios";
import './followers.scss'
import { Link } from 'react-router-dom'
import ArrowBackwardIcon from '@mui/icons-material/ArrowBack';

const Followers = () => {
  const [followers, setFollowers] = useState([]);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    window.scrollTo(0, -1);
  }, []);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        const response = await makeRequest.get("/relationships/follower");
        setFollowers(response.data); // Assuming the response data is an array of followers
      } catch (error) {
        console.error("Error fetching followers:", error);
      }
    };
    fetchFollowers();
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

  const handleFollow = async (followerId) => {
    try {
      if (followingMap[followerId]) {
        await makeRequest.delete(`/relationships?userId=${followerId}`);
        setFollowingMap(prevMap => ({ ...prevMap, [followerId]: false }));
      } else {
        await makeRequest.post("/relationships", { userId: followerId });
        setFollowingMap(prevMap => ({ ...prevMap, [followerId]: true }));
      }
      
      const updatedFollowers = await makeRequest.get("/relationships/follower");
      setFollowers(updatedFollowers.data);
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };
  

  return (
    <div className='followers-container container-fluid px-5'>
    <div className="d-flex py-4">
        <Link to="/followings" className="btn btn-followers"><ArrowBackwardIcon/> Followings</Link>
      </div>
      <div className="pb-5">
        <h1 className='text-center '>Followers</h1>
        <div className="line"></div>
      </div>
      {followers.map((follower) => (
        <div key={follower.userId} className='follower rounded-4 my-2 p-2 d-flex justify-content-between align-items-center'>
          <Link to={`/profile/${follower.userId}`} className='d-flex gap-3 uinfo'>
            <img className='img-fluid rounded-circle profile-img' src={follower.profilePic ? ("/upload/"+follower.profilePic):(Avatar)} alt="" />
            {follower.online === 1 && <div className="online" />}
            <h5 className='my-auto'>{follower.name}</h5>
          </Link>
          <button className='btn btn-primary btn-follow' onClick={() => handleFollow(follower.userId)}>
            {followingMap[follower.userId] ? 'Following' : 'Follow'}
          </button>
        </div>
      ))}
    </div>
  );
};

export default Followers;
