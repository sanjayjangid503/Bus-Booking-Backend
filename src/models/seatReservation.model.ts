import { model, Schema } from "mongoose";
import type { ISeatReservation } from "../types/seatReservation.types.js";

const seatSchema = new Schema<ISeatReservation>({
    bus: {
        type: Schema.Types.ObjectId,
        ref: "Bus",
        required: true
    },

    travelDate: {
        type: Date,
        required: true
    },

    seatNumber: {
        type: String,
        required: true
    },

    status: {
        type: String,
        enum: [
            "AVAILABLE",
            "LOCKED",
            "BOOKED"
        ],
        required: true
    },

    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

    locketAt: {
        type: Date,
    },

    lockExpiresAt: {
        type: Date,
    }
}, {timestamps: true})

const seatReservation = model<ISeatReservation>("SeatReservation", seatSchema)

export default seatReservation