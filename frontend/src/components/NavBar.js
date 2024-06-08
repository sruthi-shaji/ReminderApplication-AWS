import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

import "./NavBar.css"

export default function NavBar() {
    const navigate = useNavigate();
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        const fetchProfilePic = async () => {
            await fetchImageUrl();
        };
        fetchProfilePic();
    }, []);

    const fetchImageUrl = async () => {
        try {
            const response = await fetch('https://vg31ptt9cj.execute-api.us-east-1.amazonaws.com/birthdayWisher/user/image?userId=' + localStorage.getItem("userId"));
            const data = await response.json();
            if (response) {
                setImageUrl(JSON.parse(data.body).url);
            } else {
                console.error('Error fetching pre-signed URL:', data);
            }
        } catch (error) {
            console.error('Error fetching image:', error);
        }
    };

    return (
        <div className="nav-bar">
            <div className="nav-header"> Reminder App </div>
            <div className="profile-section">
                <img
                    src={imageUrl}
                    alt="Profile"
                    className="profile-pic"
                    onClick={() => navigate("/profile")}
                >
                </img>
                <div className="logout" onClick={() => navigate('/login')}>Logout</div >
            </div>
        </div>);
}