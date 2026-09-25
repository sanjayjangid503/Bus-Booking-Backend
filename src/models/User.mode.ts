import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"

interface User {
    name: string;
    email: string;
    password: string
}

const userSchema = new Schema<User>({
    name: {
        type: String,
        required: true,
        trim: true
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    password: {
        type: String,
        required: true,
        select: true
    }
}, { timestamps: true })

userSchema.pre("save", async function() {
    if(!this.isModified("password")) return;
    
    this.password = await bcrypt.hash(this.password, 12)
} )

const UserModel = mongoose.model<User>("User", userSchema)


export default UserModel


