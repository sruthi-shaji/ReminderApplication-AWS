import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { EmptyReminderImage } from '../assets';
import "./Register.css";

export default function SignUp() {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [image, setImage] = useState(null);
    const [error, setError] = useState('');

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImage(file);
    };

    const handleSignup = async (e) => {
        e.preventDefault();

        if (!name || !email || !password || !image) {
            setError('All fields are required');
            return;
        }
        try {
            const reader = new FileReader();
            reader.readAsDataURL(image);

            reader.onload = async () => {
                const fileContent = reader.result.split(',')[1];

                const response = await axios.post('https://vg31ptt9cj.execute-api.us-east-1.amazonaws.com/birthdayWisher/signup', {
                    "user_id": localStorage.getItem("userId"),
                    "username": name,
                    "email": email,
                    "password": password,
                    fileContent
                });
                if (response.status === 201) {
                    navigate('/login');
                }
                else {
                    setError('Signup failed');
                }
            };
        } catch (err) {
            console.error(err);
            setError('An error occurred');
        }
    };

    return (
        <div className='login-container'>
            <div className='login-left'>
                <div className="register-box">
                    <div className="register-fields">
                        <label>Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="register-fields">
                        <label>Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="register-fields">
                        <label>Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <div className="register-fields">
                        <label htmlFor="image">Image</label>
                        <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
                    </div>
                    <div className='register-buttons'>
                        <button onClick={handleSignup}>Signup</button>
                        <button onClick={() => navigate('/login')}>Login</button>
                    </div>
                </div>
                {error && <div className="error-message">{error}</div>}
            </div>
            <div className='login-right'>
                <img src={EmptyReminderImage} alt="reminder" width="700px" height="700px" />

            </div>
        </div>
    );
}
