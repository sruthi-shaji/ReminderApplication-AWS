import "./remindercard.css";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import axios from "axios";

export default function ReminderCard({ reminder, onEdit, onDelete }) {

    const handleDelete = () => {
        axios.delete('http://remindo-cloud-backend-lb-1751912436.us-east-1.elb.amazonaws.com:8000/reminder', {
            data: {
                "user_id": localStorage.getItem('userId').toString(),
                "reminder_id": reminder.id.toString()
            }
        }).then((response) => {
            console.log("Deleted Reminder");
            onDelete();
        }).catch((error) => {
            console.log(error);
        });
    };

    return (
        <div style={{ margin: "1%", padding: "1%" }}>
            <Card sx={{ minWidth: 300 }}>
                {/* <CardMedia
                    sx={{ height: 140 }}
                    image="https://st4.depositphotos.com/13193658/26589/i/450/depositphotos_265891876-stock-photo-selective-focus-word-reminder-made.jpg"
                    title="green iguana"
                /> */}
                <CardContent>
                    <h4 style={{ whiteSpace: "nowrap" }}>
                        {reminder.title}
                    </h4>
                    <p style={{ fontSize: "1rem" }}>
                        {reminder.description}
                    </p>
                    <p style={{ fontSize: "0.8rem" }}>{reminder.date}</p>
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={() => onEdit("edit", reminder)}>Edit</Button>
                    <Button size="small" onClick={handleDelete}>Delete</Button>
                </CardActions>
            </Card>
        </div>);
};