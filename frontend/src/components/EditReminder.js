import React, { useState } from 'react';
import "./EditReminder.css";
export default function EditReminder({ onSubmit, onCancel, oldReminder }) {
    const [reminder, setReminder] = useState(oldReminder ? oldReminder : { "name": "", "date": "" });
    const [error, setError] = useState('');


    function handleSubmit(reminder) {
        if (!reminder.name || !reminder.date) {
            setError('All fields are required');
            return;
        }
        onSubmit(reminder);
    }

    function handleNameChange(event) {
        setError("");
        setReminder((prevReminder) => ({
            ...prevReminder,
            "name": event.target.value
        }));
    }
    function handleDateChange(event) {
        setError("");
        setReminder((prevReminder) => ({
            ...prevReminder,
            "date": event.target.value
        }));
    }

    return (
        <div className='reminder-block'>
            <div className='reminder-fields'>
                <label>Name</label>
                <input type="text" value={reminder.name} onChange={handleNameChange}></input>
            </div>
            <div className='reminder-fields'>
                <label>Date</label>
                <input type="date" value={reminder.date} onChange={handleDateChange}></input>
            </div>
            <div className='reminder-buttons'>
                <button onClick={() => handleSubmit(reminder)}>
                    Add/Update
                </button>
                <button onClick={onCancel}>
                    Cancel
                </button>
            </div>
            {error && <div className="error-message">{error}</div>}
        </div >);
}