import ReminderCard from "../../components/remindercard/remindercard";
import { useState, useEffect } from "react";
import axios from 'axios';
import "./dashboard.css";
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import Modal from 'react-modal';
import UpdateReminder from "../../components/updatereminder/updatereminder";
import Button from '@mui/material/Button';

export default function Dashboard() {
    const [tabValue, setTabValue] = useState("2");
    const [loading, setLoading] = useState(true);
    const [userDetails, setUserDetails] = useState({});
    const [modalOpen, setModalOpen] = useState({ open: false, type: "" });

    const fetchUser = () => {
        const userId = localStorage.getItem('userId');
        axios.post('http://10.0.131.52:8000/user', {
            "user_id": userId
        }).then((response) => {
            setUserDetails(response?.data);
            console.log(userDetails);
            setLoading(false);
        }).catch((error) => {
            console.log(error);
        });
    };

    useEffect(() => {
        setLoading(true);
        fetchUser();
    }, []);


    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const openModal = (type, reminder) => setModalOpen({ "open": true, "type": type, "reminder": reminder });
    const closeModal = () => setModalOpen({ "open": false, "type": "" });

    const reset = () => {
        closeModal();
        fetchUser();
    };

    if (loading) {
        return <div>Loading</div>;
    }

    return <div>
        <div style={{ justifyContent: "end", display: "flex", margin: "2%" }}>
            <Button variant="contained" onClick={() => openModal("add", null)}>NEW REMINDER</Button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <TabContext value={tabValue}>
                <div style={{ borderBottom: 1, borderColor: "divider" }}>
                    <TabList onChange={handleTabChange} >
                        <Tab label="Past Reminders" value="1" />
                        <Tab label="Future Reminders" value="2" />
                    </ TabList>
                </div>
                <TabPanel value="1">
                    <div className="reminder-container">
                        {
                            (userDetails?.reminder_list?.length > 0) ? (userDetails?.reminder_list?.map((item, index) => (<div>
                                <ReminderCard key={item.id} reminder={item} onEdit={openModal} onDelete={reset} />
                            </div>))) : "You don't have any past reminders."
                        }
                    </div>
                </TabPanel>
                <TabPanel value="2">
                    <div className="reminder-container">
                        {
                            (userDetails?.reminder_list?.length > 0) ? (userDetails?.reminder_list?.map((item, index) => (<div>
                                <ReminderCard key={item.id} reminder={item} onEdit={openModal} onDelete={reset} />
                            </div>))) : "You don't have any future reminders."
                        }
                    </div>
                </TabPanel>
            </TabContext>
        </div>

        <Modal
            isOpen={modalOpen.open}
            onRequestClose={closeModal}
            contentLabel={modalOpen.type === "add" ? "Add" : "Update" + " Reminder"}
            className="modal"
            overlayClassName="overlay"
        >
            <UpdateReminder type={modalOpen.type} onSubmit={reset} onCancel={closeModal} reminder={modalOpen.reminder !== null ? modalOpen.reminder : {}} />
        </Modal>
    </div >

};