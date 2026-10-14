import mongoose from "mongoose";
import Bus from "../models/Bus.model.js";
import Route from "../models/Route.model.js";
import seatReservation from "../models/seatReservation.model.js";
import type { BusSearchQuery, BusType } from "../types/bus.types.js"

const LOCK_DURATION_MS = 5 * 60 * 1000;

export const busSearchService = async (query: BusSearchQuery) => {
    const {
        from,
        to, 
        busType,
        page = 1,
        limit = 10
     } = query;

     const routeFilter: any = {}

     if(from || to) {
        if(from) {
            routeFilter.from = from
        }

        if(to) {
            routeFilter.to = to
        }
    }

    const route = await Route.find(routeFilter).select("_id")

    const routeIds = route.map((route) => route._id)

    if(routeIds.length === 0) {
        return {
            buses: [],
            pagination: {
                page,
                limit,
                total: 0,
                totalPages: 0,
            },
        };
    }

    const busFilter: {
        route: { $in: typeof routeIds };
        busType?: BusType;
    } = {
        route: {
            $in: routeIds,
        },
    };

    if(busType) {
        busFilter.busType = busType
    }

    const skip = (page - 1) * limit

    const total = await Bus.countDocuments(busFilter)

    const buses = await Bus.find(busFilter)
        .populate("route")
        .skip(skip)
        .limit(limit) 

    return {
        buses,
        pagination: {
            page, 
            limit, 
            total, 
            totalPages: Math.ceil(total/limit)
        }
    }
}

export const getBusService = async (params: any) => {
    const id = params.id
    const buses = await Bus.findById(id).populate("route")
    return buses
}

export const getSeatService = async (busId: any, date: string ) => {
    const bus = await Bus.findById(busId)
    if(!bus) {
        throw new Error("Bus not found")
    }
    const reservation = await seatReservation.find({
        bus: busId,
        travelDate: new Date(date)
    })

    const reservationMap = new Map();
    reservation.forEach((reservation) => {
        reservationMap.set(
            reservation.seatNumber,
            reservation.status
        )
    })

    const seats = bus.seatLayout
        .flat()
        .filter((seat: any) => seat !== "")
        .map((seat: any) => ({
            seatNumber: seat,
            price: 850,
            status: reservationMap.get(seat) ?? 'AVAILABLE'
        }));

    return seats

}

export const lockSeatsService = async (
    busId: any,
    travelDate: string,
    seats: string[],
    userId: string
) => {
    if (!mongoose.isObjectIdOrHexString(busId)) {
        throw new Error("Invalid bus ID")
    }

    if (!mongoose.isObjectIdOrHexString(userId)) {
        throw new Error("Invalid user ID")
    }

    if (
        !/^\d{4}-\d{2}-\d{2}$/.test(travelDate) ||
        !Number.isFinite(Date.parse(`${travelDate}T00:00:00.000Z`)) ||
        new Date(`${travelDate}T00:00:00.000Z`)
            .toISOString().slice(0, 10) !== travelDate
    ) {
        throw new Error("Invalid travel date; use YYYY-MM-DD");
    }

    if (
        !Array.isArray(seats) ||
        seats.length === 0 ||
        seats.some((seat) => typeof seat !== "string" || !seat.trim()) ||
        new Set(seats).size !== seats.length
    ) {
        throw new Error("Provide unique, valid seat numbers");
    }

    const bus = await Bus.findById(busId)
    if (!bus) {
        throw new Error("Bus not found")
    }

    const validSeats = new Set(bus.seatLayout.flat().filter((seat) => seat !== ""))

    if (seats.some((seat) => !validSeats.has(seat))) {
        throw new Error("One or more seats do not exist on this bus");
    }

    const start = new Date(`${travelDate}T00:00:00.000Z`);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const lockExpireAt = new Date(now.getTime() + LOCK_DURATION_MS)

    await seatReservation.deleteMany({
        bus: busId,
        travelDate: { $gte: start, $lt: end },
        seatNumber: { $in: seats },
        status: "LOCKED",
        lockExpiresAt: { $lte: now }
    })

    const session = await mongoose.startSession()
    try {
        await session.withTransaction(async() => {
            for (const seat of seats) {
                const result = await seatReservation.updateOne(
                    {
                        bus: busId,
                        travelDate: {$gte: start, $lt: end},
                        seatNumber: seat,
                        $or: [
                            {seats: "AVAILABLE"},
                            {
                                seats: "LOCKED",
                                lockExpiresAt: {$lte: now}
                            }
                        ]
                    },
                    {
                        $set: {
                            status: "LOCKED",
                            user: new mongoose.Types.ObjectId(userId),
                            lockedAt: now,
                            lockExpireAt,
                        }
                    },
                    {
                        session
                    }
                );

                if (result.modifiedCount === 0) {
                    const existing = await seatReservation.findOne({
                        bus: bus._id,
                        travelDate: { $gte: start, $lt: end },
                        seatNumber: seat,
                    }).session(session);

                    if (existing) {
                        throw new Error(`Seat ${seat} is not available`);
                    }

                    await seatReservation.create(
                        [{
                            bus: bus._id,
                            travelDate: start,
                            seatNumber: seat,
                            status: "LOCKED",
                            user: new mongoose.Types.ObjectId(userId),
                            lockedAt: now,
                            lockExpiresAt: lockExpireAt,
                        }],
                        {session}
                    )
                }
            }
        });
    } finally {
        await session.endSession();
    }

    return {
        busId,
        travelDate,
        seats,
        status: "LOCKED",
        lockExpireAt,
    }
}