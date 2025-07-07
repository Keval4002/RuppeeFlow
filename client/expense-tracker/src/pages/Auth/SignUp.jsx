import React, {useContext, useState} from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import {useNavigate} from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import {Link} from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import { UserContext } from '../../context/userContext';
import uploadImage from '../../utils/uploadImage';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATH } from '../../utils/apiPath';

function SignUp() {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState(null);

  const {updateUser} = useContext(UserContext);

  const navigate = useNavigate();

  const handleSignUp = async (e)=>{
    e.preventDefault();
    let profileImageUrl = "";

    if(!fullName){
      setError("Please enter name!");
      return;
    }

    if(!validateEmail(email)){
      setError("Please enter a valid email!")
      return;
    }

    if(!password){
      setError("Please enter a password!");
      return;
    }

    //SignUP Api Call
    try {

      //Upload image if present
      if(profilePic){
        const imageUploadRes = await uploadImage(profilePic);
        profileImageUrl = imageUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATH.AUTH.REGISTER, {
        fullName, email, password
      });

      const {token, user} = response.data;

      if(token){
        localStorage.setItem("token", token);
        updateUser(user);
        navigate("/dashboard");
      }
    } catch (error) {
      if(error.response && error.response.data.message){
        setError(error.response.data.message);
      } else{
        setError("Something went wrong. Please try again.")
        console.error(error);
      }
    }
  }


  return (
    <AuthLayout>
      <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-0 flex flex-col justify-center'>
        <h3 className='text-xl font-semibold text-black'>Create an Account</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>Join us today by entering your details below</p>
      

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector 
            image={profilePic}
            setImage={setProfilePic}
            />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
            <Input 
            value={fullName}
            onChange={(e)=>{setFullName(e.target.value)}}
            label="Full Name"
            placeHolder="Enter your name"
            type="text"
            />
            <Input 
            value={email}
            onChange={(e)=>{setEmail(e.target.value)}}
            label="Email Address"
            type="text"
            placeHolder="Enter email address"
            />
            <div className='col-span-2'>
              <Input  
              value={password}
              onChange={(e)=>{setPassword(e.target.value)}}
              label="Password"
              type="password"
              placeHolder="Min 8 Characters"
              />
            </div>

            {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}
  
            <button type='submit' className='btn-primary col-span-2'>
              Sign Up
            </button>
  
            <p className='text-[13px] text-slate-800 mt-3 col-span-2 text-center'>Already an user?{" "}
              <Link className="font-medium text-primary underline " to="/login">Login</Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp