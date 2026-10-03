import Bus from "../models/Bus.model.js";
import Route from "../models/Route.model.js";
import type { BusSearchQuery, BusType } from "../types/bus.types.js"

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