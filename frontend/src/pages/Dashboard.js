import { useState, useEffect } from "react";
import Modal from 'react-modal';
import axios from 'axios';

import NavBar from "../components/NavBar";
import ReminderCard from "../components/ReminderCard";
import EditReminder from "../components/EditReminder";

import "./Dashboard.css";


Modal.setAppElement('#root');

export default function Dashboard() {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);
    const [addModalIsOpen, setAddModalIsOpen] = useState(false);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [selectedReminder, setSelectedReminder] = useState(null);

    useEffect(() => {
        async function fetchData() {
            const response = await fetchUser();
            if (response) {
                setUser(response?.data);
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    async function fetchUser() {
        const userId = localStorage.getItem('userId');
        try {
            const response = await axios.post('https://vg31ptt9cj.execute-api.us-east-1.amazonaws.com/birthdayWisher/user', {
                "user_id": userId
            });

            return response;
        }
        catch (err) {
            return { "userId": userId, "username": "", "email": "", "birthdays": [] };
        }
    }

    const openAddModal = () => setAddModalIsOpen(true);
    const closeAddModal = () => setAddModalIsOpen(false);

    const openEditModal = () => setEditModalIsOpen(true);
    const closeEditModal = () => setEditModalIsOpen(false);

    function handleDelete(id) {
        setUser(prevUser => ({
            ...prevUser,
            birthday_list: prevUser.birthday_list.filter(item => item.id !== id)
        }));
    }

    function handleEdit(reminder) {
        setSelectedReminder(reminder);
        openEditModal();
    }

    const handleAddReminder = async (formData) => {
        console.log('Form Data:', formData);
        try {
            const response = await axios.post('https://vg31ptt9cj.execute-api.us-east-1.amazonaws.com/birthdayWisher/user/birthday/create', { ...formData, "user_id": localStorage.getItem("userId") });
            if (response.status === 201) {
                console.log('Reminder added successfully');
                const response = await fetchUser();
                setUser(response?.data);
                closeAddModal();
            }
        }
        catch (error) {
            console.error('Error adding reminder:', error);
        }
    };

    const handleEditReminder = async (formData) => {
        console.log('Form Data:', formData);
        try {
            const response = await axios.put('https://vg31ptt9cj.execute-api.us-east-1.amazonaws.com/birthdayWisher/user/birthday/edit',
                {
                    "user_id": localStorage.getItem("userId"),
                    "birthday_id": formData.id.toString(),
                    "name": formData.name.toString(),
                    "date": formData.date.toString()
                });
            if (response.status === 200) {
                console.log('Reminder added successfully');
                const response = await fetchUser();
                setUser(response?.data);
                closeAddModal();
            }
            closeEditModal();
        }
        catch (error) {
            console.error('Error adding reminder:', error);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    return (<div>
        <NavBar />
        <div id="test-reminder">  <button onClick={openAddModal}>Add Reminder</button></div>
        <div className="reminder-container">
            {
                (user?.birthday_list?.length > 0) ? (user?.birthday_list?.map((item, index) => (<div>
                    <ReminderCard key={item.id} reminder={item} onDelete={handleDelete} onEdit={handleEdit} />
                </div>))) : "No reminders for now"

            }
        </div >
        <Modal
            isOpen={addModalIsOpen}
            onRequestClose={closeAddModal}
            contentLabel="Add Reminder"
            className="modal"
            overlayClassName="overlay"
        >
            <EditReminder onSubmit={handleAddReminder} onCancel={closeAddModal} />
        </Modal>
        <Modal
            isOpen={editModalIsOpen}
            onRequestClose={closeEditModal}
            contentLabel="Edit Reminder"
            className="modal"
            overlayClassName="overlay"
        >
            <EditReminder onSubmit={handleEditReminder} onCancel={closeEditModal} oldReminder={selectedReminder} />
        </Modal>
    </div >);
}