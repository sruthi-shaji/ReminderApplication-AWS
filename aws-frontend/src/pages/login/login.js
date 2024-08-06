import "./login.css";
import TextField from '@mui/material/TextField';
import { GreyImage } from "../../assets/";
import Button from '@mui/material/Button';
import { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { red } from "@mui/material/colors";

export default function Login() {
    const navigate = useNavigate();
    const [error, setError] = useState({});
    const [credentials, setCredentials] = useState({ username: "", password: "" });

    const handleCredentialChange = (field, value) => {
        setError([]);
        setCredentials((prevCredentials) => {
            return { ...prevCredentials, [field]: value };
        })
    };

    const handleLogin = (event) => {
        event.preventDefault();

        if (!credentials.username || !credentials.password) {
            setError({ empty_credential: "Please provide valid username and password!" });
            return;
        }

        axios.post('http://cloudfinal-backend-alb-1135630707.us-west-2.elb.amazonaws.com:8000/login', {
            "username": credentials.username,
            "password": credentials.password
        }).then((response) => {
            if (response.status === 200) {
                const userId = response.data.user_id;
                localStorage.setItem('userId', userId);
                navigate('/dashboard');
            }
            else {
                setError({ error: 'An error occurred' });
            }
        }).catch((error) => {
            console.error(error);
            setError({ invalid_credential: "The credentials provided are invalid!" });
        });
    };

    return (
        <div style={{ flexDirection: "row", display: "flex", width: "100%", justifyContent: "center", alignContent: "center", alignItems: "center" }}>
            {/* <div style={{ flexDirection: "column", display: "flex", width: "100%", justifyContent: "center", alignContent: "center", alignItems: "center" }}> during media query */}
            <div style={{ width: "50%", height: "100vh" }}>
                {/* <div style={{ width: "100%", height: "100vh" }}> during media query */}
                <img src={GreyImage} style={{ width: "100%", height: "100%" }} alt="login background " />
            </div>
            <div style={{ width: "50%", justifyContent: "center", display: "flex", margin: "2% 0" }}>
                {/* <div style={{ width: "100%", justifyContent: "center", display: "flex", margin: "2% 0" }}> during media query */}
                <div style={{ border: "1px solid black", margin: "1%", padding: "5%", width: "50%", justifyContent: "center", display: "flex", flexDirection: "column" }}>
                    <TextField
                        error={error.empty_credential}
                        id="login-username"
                        label="username"
                        fullWidth
                        required
                        onChange={(event) => {
                            handleCredentialChange("username", event.target.value)
                        }}
                        style={{ margin: "2% 0" }}
                    />
                    <TextField
                        error={error.empty_credential}
                        id="login-password"
                        label="Password"
                        type="password"
                        required
                        onChange={(event) => {
                            handleCredentialChange("password", event.target.value)
                        }}
                        fullWidth
                        style={{ margin: "2% 0 " }}
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleLogin}
                        size="large"
                        style={{ margin: "5% 0" }}
                    >LogIn</Button>
                    <p style={{ fontSize: "0.9rem", textAlign: "center" }}>New user? Register <a style={{ cursor: "pointer" }} onClick={() => navigate("/register")}>here</a></p>
                    {error.empty_credential && <p style={{ color: "red", fontSize: "0.9rem", textAlign: "center" }}>{error.empty_credential}</p>}
                    {error.invalid_credential && <p style={{ color: "red", fontSize: "0.9rem", textAlign: "center" }}>{error.invalid_credential}</p>}
                    {error.error && <p style={{ color: "red", fontSize: "0.9rem", textAlign: "center" }}>{error.error}</p>}
                </div>
            </div>
        </div >);
};