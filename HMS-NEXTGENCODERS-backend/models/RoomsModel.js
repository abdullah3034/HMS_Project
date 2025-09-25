import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    RoomNo: { 
        type: Number, 
        required: true,
        min: 1,
        unique: true
    },
    RStatus: {
        type: String,
        required: true,
        enum: ["Booked", "Vacant", "Occupied", "Out of Service"]
    },
    RType: {
        type: String,
        required: true,
        enum: ["Single", "Double"]
    },
    RClass: {
        type: String,
        required: true,
        enum: ["Standard", "Deluxe"]
    },
    Price: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

// Use mongoose.models to avoid OverwriteModelError
const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);

export default Room;
