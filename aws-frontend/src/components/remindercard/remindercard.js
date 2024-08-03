import "./remindercard.css";
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Button from '@mui/material/Button';
import axios from "axios";

export default function ReminderCard({ reminder, onEdit, onDelete }) {

    const handleDelete = () => {
        axios.delete('https://vg31ptt9cj.execute-api.us-east-1.amazonaws.com/birthdayWisher/user/birthday', {
            data: {
                "user_id": localStorage.getItem('userId').toString(),
                "birthday_id": reminder.id.toString()
            }
        }).then((response) => {
            console.log("Deleted Reminder");
            onDelete();
        }).catch((error) => {
            console.log(error);
        });
    };

    return (
        <div style={{ margin: "1%" }}>
            <Card sx={{ maxWidth: 345 }}>
                <CardMedia
                    sx={{ height: 140 }}
                    image="https://st4.depositphotos.com/13193658/26589/i/450/depositphotos_265891876-stock-photo-selective-focus-word-reminder-made.jpg"
                    title="green iguana"
                />
                <CardContent>
                    <h4>
                        Lizard
                    </h4>
                    <p style={{ fontSize: "1rem" }}>
                        Lizards are a widespread group of squamate reptiles, with over 6,000
                        species, ranging across all continents except Antarctica
                    </p>
                </CardContent>
                <CardActions>
                    <Button size="small" onClick={() => onEdit("edit", reminder)}>Edit</Button>
                    <Button size="small" onClick={handleDelete}>Delete</Button>
                </CardActions>
            </Card>
        </div>);
};