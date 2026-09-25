import type {Request, Response} from "express"
export const registerController = async (req: Response , res: Response) => {
    try {
        const {name, email, password} = req.body
        if(!name || !email || !password) {
            res.status(400).json({
                
            })
        }
    } catch (error) {
        
    }
}