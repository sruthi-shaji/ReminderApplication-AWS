import "./signup.css";
import TextField from '@mui/material/TextField';
import { GreyImage } from "../../assets/";
import Button from '@mui/material/Button';
import { useState } from "react";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { MuiFileInput } from 'mui-file-input'

export default function Signup() {
    const navigate = useNavigate();
    const [error, setError] = useState({});
    const [file, setFile] = useState(null);
    const [credentials, setCredentials] = useState({ name: "", email: "", password: "", confirm_password: "" });

    const handleFileUpload = (value) => {
        console.log(value);
        setFile(value);
    };

    const handleCredentialChange = (field, value) => {
        setError([]);
        setCredentials((prevCredentials) => {
            return { ...prevCredentials, [field]: value };
        })
    };

    const handleRegister = (event) => {
        event.preventDefault();
        if (!credentials.name || !credentials.email || !credentials.password || !credentials.confirm_password) {
            setError({ empty_credentials: "Please fill the required fields" });
            return;
        }

        const formData = new FormData();
        formData.append('user_id', localStorage.getItem("userId"));
        formData.append('username', credentials.name);
        formData.append('email', credentials.email);
        formData.append('password', credentials.password);
        formData.append('confirm_password', credentials.confirm_password);
        formData.append('file', file);
        axios.post("http://remindo-cloud-backend-lb-1751912436.us-east-1.elb.amazonaws.com:8000/signup", formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then((response) => {
            if (response.status === 200) {
                navigate('/');
                //toast message
            }
            setError({ error: 'Registration failed!' });
        }).catch((error) => {
            setError({ error: 'Registration failed!' });
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
                        error={error.empty_credentials}
                        label="Name"
                        required
                        fullWidth
                        onChange={(event) => {
                            handleCredentialChange("name", event.target.value)
                        }}
                        style={{ margin: "2% 0" }}
                    />
                    <TextField
                        error={error.empty_credentials}
                        label="Email"
                        required
                        fullWidth
                        onChange={(event) => {
                            handleCredentialChange("email", event.target.value)
                        }}
                        style={{ margin: "2% 0" }}
                    />
                    <TextField
                        error={error.empty_credentials}
                        label="Password"
                        type="password"
                        required
                        onChange={(event) => {
                            handleCredentialChange("password", event.target.value)
                        }}
                        fullWidth
                        style={{ margin: "2% 0 " }}
                    />
                    <TextField
                        error={error.empty_credentials}
                        label="Confirm Password"
                        type="password"
                        required
                        onChange={(event) => {
                            handleCredentialChange("confirm_password", event.target.value)
                        }}
                        fullWidth
                        style={{ margin: "2% 0 " }}
                    />
                    <MuiFileInput
                        label="Upload Image"
                        value={file}
                        onChange={(value) => { handleFileUpload(value) }}
                        inputProps={{ accept: 'image/*' }}
                        style={{ margin: "2% 0 " }}
                    />
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={handleRegister}
                        size="large"
                        style={{ margin: "5% 0" }}
                    >Register</Button>

                    <p style={{ fontSize: "0.9rem", textAlign: "center" }}>Already registered ? Login <a style={{ cursor: "pointer" }} onClick={() => navigate("/")}>here</a></p>
                    {error.error && <p style={{ color: "red", fontSize: "0.9rem", textAlign: "center" }}>{error.error}</p>}
                    {error.empty_credentials && <p style={{ color: "red", fontSize: "0.9rem", textAlign: "center" }}>{error.empty_credentials}</p>}
                </div>
            </div>
        </div >);
};