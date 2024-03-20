import "./share.scss";
import Image from "../../assets/img.png";
import Map from "../../assets/map.png";
import Friend from "../../assets/friend.png";
import { useContext, useState } from "react";
import { AuthContext } from "../../context/authContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { makeRequest } from "../../axios";
import Avatar from '../../assets/avatar.jpg';

const Share = () => {
  const [file, setFile] = useState(null);
  const [desc, setDesc] = useState("");

  const upload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await makeRequest.post("/upload", formData);
      console.log(res)
      return res.data;
    } catch (err) {
      console.log(err);
    }
  };

  const { currentUser } = useContext(AuthContext);

  const queryClient = useQueryClient();

  const mutation = useMutation(
    (newPost) => makeRequest.post("/posts", newPost),
    {
      onSuccess: () => {
        // Invalidate and refetch
        queryClient.invalidateQueries(["posts"]);
      },
      onError: (error) => {
        console.error("Error creating post:", error);
      },
    }
  );

  const handleClick = async (e) => {
    e.preventDefault();
    let mediaUrl = "";
    if (file) mediaUrl = await upload();
    mutation.mutate({ desc, img: mediaUrl });
    setDesc("");
    setFile(null);
  };

  return (
    <div className="share">
      <div className="container">
        <div className="top">
          <div className="left">
          {currentUser.profilePic ? (
            <img src={"/upload/" + currentUser.profilePic} alt="" />
          ) : (
            <img src={Avatar} alt="Default Avatar" />
          )}
            <input
              type="text"
              placeholder={`What's on your mind ${currentUser.name}?`}
              onChange={(e) => setDesc(e.target.value)}
              value={desc}
            />
          </div>
          <div className="right">
            {file && file.type.startsWith("image/") && (
              <img className="file" alt="" src={URL.createObjectURL(file)} />
            )}
            {file && file.type.startsWith("video/") && (
              <video className="file" controls>
                <source src={URL.createObjectURL(file)} type={file.type} />
              </video>
            )}
          </div>
        </div>
        <hr />
        <div className="bottom">
          <div className="left">
            <input
              type="file"
              id="file"
              style={{ display: "none" }}
              accept="image/*, video/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <label htmlFor="file">
              <div className="item">
                <img src={Image} alt="" />
                <span>Add Image/Video</span>
              </div>
            </label>
            <div className="item">
              <img src={Map} alt="" />
              <span>Add Place</span>
            </div>
            <div className="item">
              <img src={Friend} alt="" />
              <span>Tag Friends</span>
            </div>
          </div>
          <div className="right ps-2">
            <button className="btn" onClick={handleClick} type="button">Share</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Share;
