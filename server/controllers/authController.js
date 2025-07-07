import jwt from 'jsonwebtoken';
import User from '../models/User.js'

//Generate JW Token
const generateToken = (id)=>{
    return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:"1d"})
}

//Register User
const registerUser = async(req, res)=>{
    const {fullName, email, password, profileImageUrl} = req.body;

    //Validation Check
    if(!fullName || !email || !password){
        return res.status(400).json({message:"Enter all fields"});
    }

    try {
        //Existing User
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"Email already in use"});
        }

        const user = await User.create({fullName, password, email, profileImageUrl});

        res.status(201).json({
            id: user._id,
            user, 
            token: generateToken(user._id),
        });
    } catch (error) {
        res
            .status(500)
            .json({message:"Error registering user", error:error.message});
    }
}

//Login User 
const loginUser = async(req, res)=>{
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({message:"Enter all fields"});
    }

    try {
        const user = await User.findOne({email});
        if(!user||!(await user.comparePassword(password))){
            return res.status(400).json({message:"Invalid Credentials"});
        }
        res.status(200).json({
            id:user._id,
            user,
            token:generateToken(user._id)
        })
    } catch (error) {
        res
            .status(500)
            .json({message:"Error logging user", error: error.message});
    }
}

//Get User Info
const getUserInfo = async(req, res)=>{
    try {
        const user = await User.findById(req.user.id).select("-password");

        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        res.status(200).json(user);
    } catch (error) {
        res
            .status(500)
            .json({message:"Error loading user info", error:error.message})
    }
}


export {registerUser, loginUser, getUserInfo} 

