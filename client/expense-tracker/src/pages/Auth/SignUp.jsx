import React, { useContext, useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { Link } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import { UserContext } from '../../context/userContext';
import uploadImage from '../../utils/uploadImage';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATH } from '../../utils/apiPath';

function SignUp() {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName]     = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [error, setError]           = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    let profileImageUrl = "";
    if (!fullName)             { setError("Please enter name!");              return; }
    if (!validateEmail(email)) { setError("Please enter a valid email!");     return; }
    if (!password)             { setError("Please enter a password!");         return; }

    try {
      if (profilePic) {
        const imageUploadRes = await uploadImage(profilePic);
        profileImageUrl = imageUploadRes.imageUrl || "";
      }
      const response = await axiosInstance.post(API_PATH.AUTH.REGISTER, { fullName, email, password });
      const { token, user } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(user);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again.");
        console.error(error);
      }
    }
  }

  return (
    <AuthLayout>
      <div style={{ maxWidth: 480, width: '100%' }}>
        {/* Pill badge */}
        <span style={{
          display: 'inline-block', background: '#F0FBD0', color: '#4A6E00',
          borderRadius: 999, padding: '5px 16px', fontSize: 12, fontWeight: 700,
          marginBottom: 16,
        }}>
          🪙 Start saving smarter!
        </span>

        <h3 style={{ fontSize: 26, fontWeight: 800, color: '#111', lineHeight: 1.2, marginBottom: 6 }}>
          Create your<br /><span style={{ color: '#4A6E00' }}>Gullak account</span>
        </h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
          Join thousands tracking their finances smarter.
        </p>

        <form onSubmit={handleSignUp}>
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

          <div className='grid grid-cols-1 md:grid-cols-2 gap-3' style={{ marginTop: 4 }}>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              label="Full Name"
              placeHolder="Enter your name"
              type="text"
            />
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email Address"
              type="text"
              placeHolder="Enter email address"
            />
            <div className='col-span-2'>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
                type="password"
                placeHolder="Min 8 characters"
              />
            </div>

            {error && (
              <div className='col-span-2' style={{
                background: '#FFE4F5', border: '1px solid #FF3DAC40',
                borderRadius: 12, padding: '10px 14px',
                fontSize: 13, color: '#C00080',
              }}>
                {error}
              </div>
            )}

            <button type='submit' className='btn-primary col-span-2' style={{ marginTop: 4 }}>
              Create Account →
            </button>

            <p style={{ fontSize: 13, color: '#666', marginTop: 8, textAlign: 'center' }} className='col-span-2'>
              Already have an account?{" "}
              <Link to="/login" style={{ color: '#4A6E00', fontWeight: 700, textDecoration: 'none' }}>
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}

export default SignUp