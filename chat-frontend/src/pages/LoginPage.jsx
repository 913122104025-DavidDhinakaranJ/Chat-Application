import { useContext } from "react";
import { useState } from "react";
import { AuthContext } from "../context/AuthContext";
import assets from "../assets";

function LoginPage() {
  const [currState, setCurrState] = useState("Sign up");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);

  const { login } = useContext(AuthContext);

  const onSubmitHandler = (e) => {
    e.preventDefault();
    if(currState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true);
      return;
    }

    login(currState === "Sign up" ? "signup" : "login", {
      username, email, password, bio
    });
  }

  return (
    <div className="min-h-screen bg-cover bg-center flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col backdrop-blur-2xl">
      <img src={assets.logo} alt="" className="w-[min(30vw, 250px)]"/>
      <form onSubmit={onSubmitHandler} className="border-2 bg-white/8 text-white border-gray-500 p-6 flex flex-col gap-6 rounded-lg shadow-lg">
        <h2 className="font-medium text-2xl flex justify-between items-center">
          {currState}
          {isDataSubmitted && <img onClick={() => setIsDataSubmitted(false)} src="{assets.arrow}" alt="" className="w-5 cursor-pointer"/>}
        </h2>
        {currState === "Sign up" && !isDataSubmitted && (
            <input onChange={(e)=>setUsername(e.target.value)} value={username} type="text" placeholder="User Name" className="p-2 border border-gray-500 rounded-md focus:outline-none" required/>
        )}
        {!isDataSubmitted && (
          <>
            <input onChange={(e)=>setEmail(e.target.value)} value={email} type="email" placeholder="Email" className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required/>
            <input onChange={(e)=>setPassword(e.target.value)} value={password} type="password" placeholder="Password" className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required/>
            
          </>
        )}

        {currState === "Sign up" && isDataSubmitted && (
            <textarea onChange={(e)=>setBio(e.target.value)} value={bio} placeholder="provide a short bio..." rows = {4} className="p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" required></textarea>
        )}

        <button type="submit" className="py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer">{currState === "Sign up" ? "Create Account" : "Login"}</button>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <input type="checkbox" />
          <p>Agree to the terms of use & privacy policy</p>
        </div>

        <div className="flex flex-col gap-2">
          {currState === "Sign up" ? (
            <p className="text-sm text-gray-600">Already have an account?
              <span onClick={() => {setCurrState("Login"); setIsDataSubmitted(false);}} className="font-medium text-violet-500 cursor-pointer"> Login</span>
            </p>
          ) : (
            <p className="text-sm text-gray-600">Don't have an account?
              <span onClick={() => {setCurrState("Sign up"); setIsDataSubmitted(false);}} className="font-medium text-violet-500 cursor-pointer"> Sign up</span>
            </p>
          )}  
        </div>

      </form>
    </div>
  );
}

export default LoginPage;