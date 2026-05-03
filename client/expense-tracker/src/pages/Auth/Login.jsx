import React, { useContext, useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { Link } from 'react-router-dom';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance'
import { API_PATH } from '../../utils/apiPath';
import { UserContext } from '../../context/userContext';

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) { setError("Please enter a valid email address."); return; }
    if (!password)             { setError("Please enter the password"); return; }
    setError("");

    try {
      const response = await axiosInstance.post(API_PATH.AUTH.LOGIN, { email, password });
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
        setError("Something went wrong. Please try again.")
      }
    }
  }

  return (
    <AuthLayout>
      <div style={{ maxWidth: 400, width: '100%' }}>
        {/* Welcome pill */}
        <span style={{
          display: 'inline-block', background: '#F0FBD0', color: '#4A6E00',
          borderRadius: 999, padding: '5px 16px', fontSize: 12, fontWeight: 700,
          marginBottom: 16,
        }}>
          👋 Welcome back!
        </span>

        <h3 style={{ fontSize: 28, fontWeight: 800, color: '#111', lineHeight: 1.2, marginBottom: 6 }}>
          Sign in to<br /><span style={{ color: '#4A6E00' }}>your Gullak</span>
        </h3>
        <p style={{ fontSize: 13, color: '#888', marginBottom: 28 }}>
          Please enter your details to continue
        </p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            label="Email Address"
            type="text"
            placeHolder="Enter email address"
          />
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            label="Password"
            type="password"
            placeHolder="Min 8 characters"
          />

          {error && (
            <div style={{
              background: '#FFE4F5', border: '1px solid #FF3DAC40',
              borderRadius: 12, padding: '10px 14px', marginBottom: 12,
              fontSize: 13, color: '#C00080',
            }}>
              {error}
            </div>
          )}

          <button type='submit' className='btn-primary' style={{ marginTop: 8 }}>
            Login →
          </button>

          <p style={{ fontSize: 13, color: '#666', marginTop: 16, textAlign: 'center' }}>
            Don't have an account?{" "}
            <Link to="/signUp" style={{ color: '#4A6E00', fontWeight: 700, textDecoration: 'none' }}>
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  )
}

export default Login