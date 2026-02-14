import React, { useState } from 'react';
import { useAppContext } from '../Context/AppContext';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';


function Login() {
  const { setShowUserLogin, axios, navigate, fetchUser } = useAppContext();
  const location = useLocation();

  const [state, setState] = useState("login"); // login, register, login-otp
  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // Acts as 'identifier' for login (Email or Mobile)
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");

  // OTP States
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpMobile, setOtpMobile] = useState("");

  async function onSubmitHandler(event) {
    try {
      event.preventDefault();

      // --- LOGIN WITH OTP FLOW ---
      if (state === "login-otp") {
        if (!isOtpSent) {
          // Send OTP
          if (otpMobile.length !== 10) {
            toast.error("Please enter a valid 10-digit mobile number");
            return;
          }
          const { data } = await axios.post('/api/user/login-otp-init', { mobile: otpMobile });
          if (data.success) {
            toast.success(data.message);
            setIsOtpSent(true);
          } else {
            toast.error(data.message);
          }
        } else {
          // Verify OTP
          const { data } = await axios.post('/api/user/login-otp-verify', { mobile: otpMobile, otp });
          if (data.success) {
            await fetchUser();
            setShowUserLogin(false);
            toast.success(data.message);
            if (location.state?.from) {
              navigate(location.state.from);
            } else {
              navigate('/');
            }
          } else {
            toast.error(data.message);
          }
        }
        return;
      }

      // --- STANDARD LOGIN / REGISTER FLOW ---
      if (state === "register") {
        if (mobile.length !== 10) {
          toast.error("Mobile number must be 10 digits");
          return;
        }
      }

      const payload = state === "login"
        ? { email, password }
        : { name, email, mobile, password };

      const { data } = await axios.post(`/api/user/${state}`, payload);

      if (data.success) {
        await fetchUser();
        setShowUserLogin(false);
        toast.success(data.message);

        if (state === "login" && location.state?.from) {
          navigate(location.state.from);
        } else {
          navigate('/');
        }

      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  }

  return (
    <div onClick={() => setShowUserLogin(false)} className='fixed top-0 bottom-0 left-0 right-0 z-30 flex items-center text-sm text-gray-600 bg-black/50'>
      <form onSubmit={onSubmitHandler} onClick={(e) => e.stopPropagation()} className="flex flex-col gap-4 m-auto items-start p-8 py-12 w-80 sm:w-[352px] rounded-lg shadow-xl border border-gray-200 bg-white animate-fade-in-up">
        <p className="text-2xl font-medium m-auto">
          <span className="text-primary">User</span> {state === "login" ? "Login" : state === "register" ? "Sign Up" : "Login via OTP"}
        </p>

        {/* REGISTER FIELDS */}
        {state === "register" && (
          <div className="w-full space-y-4">
            <div>
              <p>Name</p>
              <input onChange={(e) => setName(e.target.value)} value={name} placeholder="Full Name" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" required />
            </div>
            <div>
              <p>Mobile Number</p>
              <input onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 10) setMobile(val);
              }} value={mobile} placeholder="10-digit mobile number" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="text" required />
            </div>
          </div>
        )}

        {/* STANDARD LOGIN FIELDS */}
        {(state === "login" || state === "register") && (
          <>
            <div className="w-full">
              <p>{state === "login" ? "Email or Mobile Number" : "Email"}</p>
              <input onChange={(e) => setEmail(e.target.value)} value={email} placeholder={state === "login" ? "Enter Email or Mobile" : "Email Address"} className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type={state === "login" ? "text" : "email"} required />
            </div>

            <div className="w-full">
              <p>Password</p>
              <input onChange={(e) => setPassword(e.target.value)} value={password} placeholder="Password" className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary" type="password" required />
            </div>
          </>
        )}

        {/* OTP LOGIN FIELDS */}
        {state === "login-otp" && (
          <div className="w-full space-y-4">
            <div>
              <p>Mobile Number</p>
              <input
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 10) setOtpMobile(val);
                }}
                value={otpMobile}
                placeholder="10-digit mobile number"
                className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary"
                type="text"
                required
                disabled={isOtpSent}
              />
            </div>
            {isOtpSent && (
              <div className="animate-fade-in">
                <p>Enter OTP</p>
                <input
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    if (val.length <= 6) setOtp(val);
                  }}
                  value={otp}
                  placeholder="6-digit OTP"
                  className="border border-gray-200 rounded w-full p-2 mt-1 outline-primary text-center text-lg tracking-widest font-bold"
                  type="text"
                  required
                />
              </div>
            )}
          </div>
        )}

        {/* TOGGLE LINKS */}
        <div className="w-full text-sm space-y-2">
          {state === "login" ? (
            <>
              <p>New user? <span onClick={() => setState("register")} className="text-primary font-semibold cursor-pointer hover:underline">Create account</span></p>
              <p>Forgot password? <span onClick={() => { setState("login-otp"); setIsOtpSent(false); setOtpMobile(""); setOtp(""); }} className="text-primary font-semibold cursor-pointer hover:underline">Login with OTP</span></p>
            </>
          ) : state === "register" ? (
            <p>Already have an account? <span onClick={() => setState("login")} className="text-primary font-semibold cursor-pointer hover:underline">Login here</span></p>
          ) : (
            <p>Back to <span onClick={() => setState("login")} className="text-primary font-semibold cursor-pointer hover:underline">Password Login</span></p>
          )}
        </div>

        <button className="bg-primary hover:bg-primary-dull transition-all text-white w-full py-2 rounded-md cursor-pointer font-bold shadow-md active:scale-95">
          {state === "register" ? "Create Account" : state === "login-otp" ? (isOtpSent ? "Verify & Login" : "Send OTP") : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
