import React from 'react';
import axios from 'axios';

import './ReminderCard.css';

export default function ReminderCard({ reminder, onDelete, onEdit }) {
    async function handleDelete(id) {
        try {
            console.log({
                "user_id": localStorage.getItem('userId').toString(),
                "birthday_id": id.toString()
            });
            const response = await axios.delete('https://vg31ptt9cj.execute-api.us-east-1.amazonaws.com/birthdayWisher/user/birthday', {
                data: {
                    "user_id": localStorage.getItem('userId').toString(),
                    "birthday_id": id.toString()
                }
            });
            console.log(response);
            if (response) {
                console.log("Deleted Reminder");
                onDelete(id);
            }
        }
        catch (error) {
            console.log(error);
        }

    }
    return (
        <div id={reminder.id} className="reminder-card">
            <div>
                <div>
                    <span>{reminder.name}</span>
                </div>
                <div>{reminder.date}</div>
            </div>
            <div>
                <button onClick={() => onEdit(reminder)}>Edit</button>
                <button onClick={() => handleDelete(reminder.id)}>Delete</button>
            </div>
        </div>);
}