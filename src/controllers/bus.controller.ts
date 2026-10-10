import type {Request, Response} from "express"
import type { BusSearchQuery } from "../types/bus.types.js";
import { busSearchService, getBusService, getSeatService } from "../services/bus.service.js";
import { HTTP_STATUS } from "../constants/httpCodes.js";

export const searchBusController = async (req: Request<{}, {}, {}, BusSearchQuery>, res: Response) => {
    try {
        const buses = await busSearchService(req.query)
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            result: buses
        });
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to search buses", error,
        })
    }
}

export const getBusController = async (req: Request, res: Response) => {
    try {
        const buses = await getBusService(req.params)
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            result: buses
        })
    } catch (error) {
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to search buses", error,
        })
    }
}

export const getSeatController = async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const {date} = req.query
        if(!date || typeof date !== "string") {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: "Date is required"
            }) 
        }
        const seats = await getSeatService(id, date)
        return res.status(HTTP_STATUS.OK).json({
            success: true,
            seats,
        });
        
    } catch (error) {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Failed to get bus seats", error,
        });

    }
}