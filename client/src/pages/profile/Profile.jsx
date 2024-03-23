import "./profile.scss";
import FacebookTwoToneIcon from "@mui/icons-material/FacebookTwoTone";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import TwitterIcon from "@mui/icons-material/Twitter";
import PlaceIcon from "@mui/icons-material/Place";
import LanguageIcon from "@mui/icons-material/Language";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import Posts from "../../components/posts/Posts";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import { Link, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/authContext";
import Update from "../../components/update/Update";
import Avatar from '../../assets/avatar.jpg';
import Cover from '../../assets/cover.png';

const Profile = () => {
  const [openUpdate, setOpenUpdate] = useState(false);
  const { currentUser } = useContext(AuthContext);
  const location = useLocation();
  const userId = parseInt(location.pathname.split("/")[2]);

  useEffect(() => {
    window.scrollTo(0, -1);
  }, [userId]); // Trigger effect when userId changes

  const queryClient = useQueryClient();

  const { isLoading: userDataLoading, error: userDataError, data: userData } = useQuery(["user", userId], () =>
    makeRequest.get("/users/find/" + userId).then((res) => {
      return res.data;
    })
  );

  const { isLoading: relationshipLoading, data: relationshipData } = useQuery(
    ["relationship", userId],
    () =>
      makeRequest.get("/relationships?followedUserId=" + userId).then((res) => {
        return res.data;
      })
  );

  const mutation = useMutation(
    (following) => {
      if (following)
        return makeRequest.delete("/relationships?userId=" + userId);
      return makeRequest.post("/relationships", { userId });
    },
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["relationship", userId]);
      },
    }
  );

  const handleFollow = () => {
    mutation.mutate(relationshipData.includes(currentUser._id));
  };

  return (
    <div className="profile-container container-fluid pb-4">
      {(userDataLoading || relationshipLoading) ? (
        "loading"
      ) : (
        <>
          <div className="images">
            <img src={userData.coverPic ? "/upload/"+userData.coverPic : Cover} alt="" className="cover" />
            <img
              src={userData.profilePic ? "/upload/"+userData.profilePic : Avatar}
              alt=""
              className="profilePic shadow"
            />
          </div>
          <div className="profileContainer container">
            <div className="uInfo">
              <div className="left">
                <a href="http://facebook.com" target="_blank">
                  <FacebookTwoToneIcon fontSize="medium" />
                </a>
                <a href="http://instagram.com" target="_blank">
                  <InstagramIcon fontSize="medium" />
                </a>
                <a href="http://twitter.com" target="_blank">
                  <TwitterIcon fontSize="medium" />
                </a>
                <a href="http://linkedin.com" target="_blank">
                  <LinkedInIcon fontSize="medium" />
                </a>
                <a href="http://pinterest.com" target="_blank">
                  <PinterestIcon fontSize="medium" />
                </a>
              </div>
              <div className="center">
                <span>{userData.name}</span>
                <div className="info d-flex flex-column flex-lg-row gap-1">
                  <div className="item">
                    <PlaceIcon />
                    <span>{userData.city || "not added"}</span>
                  </div>
                  <div className="item">
                    <LanguageIcon />
                    <span>{userData.website || "not added"}</span>
                  </div>
                </div>
                {userId === currentUser._id ? (
                  <button onClick={() => setOpenUpdate(true)}>Edit Profile</button>
                ) : (
                  <button onClick={handleFollow}>
                    {relationshipData.includes(currentUser._id)
                      ? "Following"
                      : "Follow"}
                  </button>
                )}
              </div>
              <Link to="/message" className="right">
                <EmailOutlinedIcon />
              </Link>
            </div>
            <Posts userId={userId} />
          </div>
        </>
      )}
      {openUpdate && <Update setOpenUpdate={setOpenUpdate} user={userData} />}
    </div>
  );
};

export default Profile;
