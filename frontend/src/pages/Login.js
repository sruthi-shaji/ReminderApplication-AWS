import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "./Register.css";
import { EmptyReminderImage } from '../assets';

export default function Login() {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ "username": "", "password": "" });
    const [error, setError] = useState('');


    const handleLogin = async () => {
        if (!credentials.username || !credentials.password) {
            setError('All fields are required');
            return;
        }

        try {
            const response = await axios.post('https://vg31ptt9cj.execute-api.us-east-1.amazonaws.com/birthdayWisher/login', {
                "username": credentials.username,
                "password": credentials.password
            });
            console.log(response);
            if (response.status === 200) {
                const userId = response.data.userId;
                localStorage.setItem('userId', userId);
                navigate('/dashboard');
            }
            else {
                setError('Login failed');
            }
        }
        catch (err) {
            console.error(err);
            setError('An error occurred');
        }

    };

    return (
        <div className='login-container'>
            <div className='login-left'>
                <div className='register-box'>
                    <div className='register-fields'>
                        <label>Username: </label>
                        <input type="email" value={credentials.username} onChange={(e) => setCredentials({ "username": e.target.value, "password": credentials.password })}></input>
                    </div>
                    <div className='register-fields'>
                        <label>Password: </label>
                        <input type="password" value={credentials.password} onChange={(e) => setCredentials({ "username": credentials.username, "password": e.target.value })}  ></input>
                    </div>
                    <div className='register-buttons'>
                        <button onClick={handleLogin}>
                            Login
                        </button>
                        <button onClick={() => navigate('/register')}>
                            SignUp
                        </button>
                    </div>
                </div>
                {error && <div className="error-message">{error}</div>}
            </div>
            <div className='login-right'>
                <img src={EmptyReminderImage} alt="reminder" width="700px" height="700px" />

            </div>
        </div >
    );
}
