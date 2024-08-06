import { useState, useEffect } from "react";
import "./navbar.css";
import axios from "axios";
import Popper from '@mui/material/Popper';
import { useNavigate } from "react-router-dom";

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Popover } from "@mui/material";
import Modal from 'react-modal';
import UpdateProfile from "../updateprofile/updateprofile";



export default function Navbar() {
    const navigate = useNavigate();
    const [userDetails, setUserDetails] = useState({});
    const [anchorEl, setAnchorEl] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const accessToken = localStorage.getItem("userId");
    const handleAccount = (event) => {
        setAnchorEl(event.currentTarget);
    }

    console.log(userDetails);
    const openModal = () => { setModalOpen(true) };
    const closeModal = () => { setModalOpen(false) };


    useEffect(() => {
        const fetchUser = () => {
            const userId = localStorage.getItem('userId');
            axios.post('http://cloudfinal-backend-alb-1135630707.us-west-2.elb.amazonaws.com:8000/user', {
                "user_id": userId
            }).then((response) => {

                setUserDetails(response?.data);
            }).catch((error) => {
                console.log(error);
            });
        };

        // const fetchImageUrl = () => {
        //     axios.get('http://cloudfinal-backend-alb-1135630707.us-west-2.elb.amazonaws.com:8000/user/image?userId=' + localStorage.getItem("userId"))
        //         .then((response) => {
        //             // console.log(response.data);
        //             const data = response.data;//.json();
        //             setUserDetails((prevUser) => {
        //                 return { ...prevUser, ["file"]: JSON.parse(data.body).url };
        //             });
        //         }).catch((error) => {
        //             console.error('Error fetching pre-signed URL:', error);
        //         });
        // };

        fetchUser();
        // fetchImageUrl();
    }, []);


    const handleLogout = () => {
        setUserDetails({});
        closeModal();
        localStorage.clear();
        navigate("/");
    }

    const open = Boolean(anchorEl);

    return (<div style={{ backgroundColor: "white", color: "black", padding: "0.8%", display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
        <h3>Reminders</h3>
        {accessToken && (<div>
            <img
                // src={userDetails.file}
                src="https://www.datocms-assets.com/70938/1683306538-1682964958-henry-cavill-1.jpg?auto=format%2Ccompress&cs=srgb"
                alt="Profile"
                className="profile-pic"
                onClick={(event) => { handleAccount(event) }}
            >
            </img>
            <Popover
                open={open}
                anchorEl={anchorEl}
                placement='bottom-end'
                onClose={() => setAnchorEl(null)}
                style={{
                    top: "90px"
                }}
            >
                < List >
                    <ListItem >
                        <ListItemButton>
                            <ListItemText primary="Profile" onClick={openModal} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem >
                        <ListItemButton>
                            <ListItemText primary="Logout" onClick={handleLogout} />
                        </ListItemButton>
                    </ListItem>
                </List>

            </Popover>
        </div >)}
        <Modal
            isOpen={modalOpen}
            onRequestClose={closeModal}
            contentLabel={"Edit Profile"}
            className="modal"
            overlayClassName="overlay"
        >
            <UpdateProfile credentials={userDetails} onCancel={closeModal} />
        </Modal>
    </div >);
};