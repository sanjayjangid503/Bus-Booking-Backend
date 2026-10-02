import type { Types, Document } from "mongoose";

export type BusType = "AC_SEATER" | "NON_AC_SEATER" | "AC_SLEEPER" | "NON_AC_SLEEPER";

export interface IBus extends Document {
    operator: string;
    busNumber: string;
    busType: BusType;
    totalSeats: number;
    seatLayout: [][];
    route: Types.ObjectId;
}