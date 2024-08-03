import "./updatereminder.css";
import { useState } from "react";
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Button from '@mui/material/Button';
import axios from 'axios';
import { MuiFileInput } from 'mui-file-input'


export default function UpdateReminder({ type, reminder, onSubmit, onCancel }) {
    const [error, setError] = useState({});
    const [localReminder, setLocalReminder] = useState(reminder || {});
    const message = type === "edit" ? "Update Reminder" : "Add Reminder";

    const handleReminderChange = (field, value) => {
        setLocalReminder(prevReminder => ({ ...prevReminder, [field]: value }));
    };

    const handleUpdate = () => {
        if (!localReminder.name || !localReminder.date) {
            setError({ empty_reminder: 'All fields are required' });
            return;
        }
        if (type === "add") {
            axios.post('https://vg31ptt9cj.execute-api.us-east-1.amazonaws.com/birthdayWisher/user/birthday/create', {
                ...localReminder,
                "user_id": localStorage.getItem("userId")
            }).then((response) => {
                if (response.status === 201) {
                    console.log('Reminder added successfully');
                    onSubmit();
                }
            }).catch((error) => {
                console.error('Error adding reminder:', error);
            });
        }
        else if (type === "edit") {
            axios.put('https://vg31ptt9cj.execute-api.us-east-1.amazonaws.com/birthdayWisher/user/birthday/edit', {
                "user_id": localStorage.getItem("userId"),
                "birthday_id": localReminder.id.toString(),
                "name": localReminder.name.toString(),
                "date": localReminder.date.toString()
            }).then((response) => {
                if (response.status === 200) {
                    console.log('Reminder added successfully');
                    onSubmit();
                }
            }).catch((error) => {
                console.error('Error editing reminder:', error);
            });
        }
    };

    return (
        <div style={{ width: "90%" }}>
            <h2>{message}</h2>
            <TextField
                error={error.empty_reminder}
                label="Title"
                fullWidth
                required
                onChange={(event) => {
                    handleReminderChange("title", event.target.value)
                }}
                style={{ margin: "2% 0" }}
            />
            <TextField
                error={error.empty_reminder}
                label="Description"
                fullWidth
                required
                multiline
                rows={3}
                onChange={(event) => {
                    handleReminderChange("description", event.target.value)
                }}
                style={{ margin: "2% 0" }}
            />
            <MuiFileInput
                label="Upload Image"
                fullWidth
                value={localReminder?.file}
                onChange={(value) => {
                    handleReminderChange("file", value)
                }}
                inputProps={{ accept: 'image/*' }}
                style={{ margin: "2% 0 " }}
            />
            <div style={{ flexDirection: "row", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {/* <div style={{ flexDirection: "column", display: "flex", alignItems: "center", justifyContent: "space-between" }}> */}
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        label="Date"
                        onChange={(value) => {
                            const formattedDate = value.format('YYYY-MM-DD');
                            handleReminderChange("date", formattedDate);
                        }}
                    />
                </LocalizationProvider>
                <Button
                    variant="contained"
                    onClick={handleUpdate}
                    size="large"
                    style={{ margin: "5% 0" }}
                >{message}</Button>
            </div>

        </div>);
}