import { useState } from "react";
import "./updateprofile.css";
import TextField from '@mui/material/TextField';
import { Button } from "@mui/material";

export default function UpdateProfile({ credentials, onCancel }) {
    const [file, setFile] = useState(null);

    const handleFileUpload = (value) => {
        console.log(value);
        setFile(value);
    };

    return (<div style={{ width: "90%" }}>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h2>Profile Details</h2>
            <img
                src={credentials?.file}
                className="profile-image" />
        </div>

        <TextField
            label="Name"
            defaultValue={credentials?.username}
            fullWidth
            InputProps={{
                readOnly: true,
            }}
            style={{ margin: "2% 0" }}
        />
        <TextField
            label="Email"
            defaultValue={credentials?.email}
            fullWidth
            InputProps={{
                readOnly: true,
            }}
            style={{ margin: "2% 0" }}
        />
        <Button variant="contained" size="large" style={{ alignItems: "end", display: "flex" }} onClick={onCancel}>Back</Button>

    </div>);
}