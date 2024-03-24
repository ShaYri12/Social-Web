import "./navbar.scss";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import { NavLink, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { DarkModeContext } from "../../context/darkModeContext";
import { AuthContext } from "../../context/authContext";
import Avatar from "../../assets/avatar.jpg";
import { toast } from "react-toastify";
import { makeRequest } from "../../axios";

const Navbar = () => {
  const { toggle, darkMode } = useContext(DarkModeContext);
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Online status updated successfully");
      toast.success("Logout Successfully!");
      await makeRequest.put(`/users/online`, { online: false });
      logout();
      navigate("/login");
    } catch (error) {
      console.error("Error updating online status:", error);
    }
  };

  return (
    <>
      <div
        className={`d-block navbar-behind ${darkMode ? "dark-navbar" : ""}`}
      ></div>
      <nav
        className={`navbar navbar-expand-md ${
          darkMode ? "navbar-dark dark-navbar bg-dark" : "bg-white text-dark"
        } fixed-top `}
      >
        <div className="container-fluid ">
          <NavLink
            className={`navbar-brand ${darkMode ? "text-light" : ""}`}
            to="/"
          >
            Lamasocial
          </NavLink>
          <button
            className="navbar-toggler my-auto"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasNavbar"
            aria-controls="offcanvasNavbar"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className={`offcanvas offcanvas-end  ${
              darkMode ? "text-bg-dark" : ""
            }`}
            tabIndex="-1"
            id="offcanvasNavbar"
            aria-labelledby="offcanvasNavbarLabel"
          >
            <div
              className="offcanvas-body align-item-center"
              id="navbarSupportedContent"
            >
              <ul
                className={`navbar-nav justify-content-start gap-4 gap-md-0 flex-grow-1 ${
                  darkMode ? "text-light" : ""
                }`}
              >
                <li className="nav-item mx-auto mx-md-2 my-auto">
                  <NavLink className="nav-link" aria-current="page" to="/">
                    <HomeOutlinedIcon style={{ fontSize: "26px" }} />
                  </NavLink>
                </li>
                <li className="nav-item mx-auto my-auto mx-md-2">
                  {darkMode ? (
                    <WbSunnyOutlinedIcon
                      onClick={toggle}
                      style={{ cursor: "pointer" }}
                    />
                  ) : (
                    <DarkModeOutlinedIcon
                      onClick={toggle}
                      style={{ cursor: "pointer" }}
                    />
                  )}
                </li>
              </ul>
              <div
                className={`right d-flex flex-column flex-md-row gap-4 gap-md-3 justify-content-start ${
                  darkMode ? "text-light" : ""
                }`}
              >
                <NavLink
                  to="/followings"
                  className="following align-items-center d-flex flex-column justify-content-center"
                >
                  <PersonOutlinedIcon />
                </NavLink>
                <NavLink
                  to="/chats"
                  className="message align-items-center d-flex flex-column justify-content-center"
                >
                  <EmailOutlinedIcon />
                </NavLink>

                <div className="profile dropdown align-items-center d-flex flex-column justify-content-center">
                  <div className="position-relative">
                    <button
                      className="nav-link d-flex flex-column flex-md-row align-items-center dropdown-toggle"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      {currentUser?.profilePic ? (
                        <img
                          src={"/upload/" + currentUser?.profilePic}
                          className="profileimg img-fluid rounded-circle"
                          alt=""
                        />
                      ) : (
                        <img
                          src={Avatar}
                          className="profileimg img-fluid rounded-circle"
                          alt=""
                        />
                      )}
                    </button>
                    <ul
                      className={`dropdown-menu text-center position-absolute ${
                        darkMode ? "dropdown-menu-dark" : ""
                      } ${
                        window.innerWidth >= 768
                          ? "start-30 translate-middle-x"
                          : "start-50 translate-middle-x"
                      }`}
                    >
                      <li>
                        <NavLink
                          className="dropdown-item"
                          to={`/profile/${currentUser?._id}`}
                        >
                          Profile
                        </NavLink>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item"
                          onClick={() => handleLogout(currentUser?._id)}
                        >
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
