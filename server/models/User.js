import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
    fullName:{type:String, required:true},
    email:{type:String, required:true},
    password:{type:String, required:true},
    profileImageUrl:{type:String, default:null},
}, {
    timestamps:true
})
//Hash passwords before save
UserSchema.pre('save', async function (next) {
    if(!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
})

//Compare Passwords
UserSchema.methods.comparePassword = async function(candidatePassword){
    return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model("User", UserSchema);