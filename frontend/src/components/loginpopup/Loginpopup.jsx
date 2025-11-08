import { useState, useContext } from "react";
import "./Loginpopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/Storecontext";
import { ToastContainer, toast } from "react-toastify";
import { auth } from "../../firebase"; // ✅ Import initialized Firebase
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

const Loginpopup = () => {
  const { setshowlogin, settoken } = useContext(StoreContext);
  const [currstate, setcurrstate] = useState("Sign Up");
  const [data, setdata] = useState({ name: "", email: "", password: "" });

  const onchangehandler = (e) => {
    const { name, value } = e.target;
    setdata((prev) => ({ ...prev, [name]: value }));
  };

  const onsubmithandler = async (e) => {
    e.preventDefault();

    try {
      if (currstate === "Login") {
        // ✅ Firebase Login
        const userCredential = await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        const token = await userCredential.user.getIdToken();
        localStorage.setItem("token", token);
        settoken(token);
        toast.success("Login successful!", { autoClose: 200 });
        setshowlogin(false);
      } else {
        // ✅ Firebase Sign-Up
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        await updateProfile(userCredential.user, {
          displayName: data.name,
        });

        const token = await userCredential.user.getIdToken();
        localStorage.setItem("token", token);
        settoken(token);
        toast.success("Account created successfully!", { autoClose: 200 });
        setshowlogin(false);
      }
    } catch (error) {
      console.error("Firebase Auth Error:", error);
      toast.error(error.message, { autoClose: 500 });
    }
  };

  return (
    <div className="loginpopup">
      <form onSubmit={onsubmithandler} className="logincontainer">
        <div className="logintitle">
          <h2>{currstate}</h2>
          <img
            onClick={() => setshowlogin(false)}
            src={assets.cross_icon}
            alt=""
          />
        </div>

        <div className="logininputs">
          {currstate === "Login" ? null : (
            <input
              type="text"
              onChange={onchangehandler}
              name="name"
              value={data.name}
              placeholder="Your name"
              required
            />
          )}
          <input
            type="email"
            onChange={onchangehandler}
            name="email"
            value={data.email}
            placeholder="Your email"
            required
          />
          <input
            type="password"
            onChange={onchangehandler}
            name="password"
            value={data.password}
            placeholder="Password"
            required
          />
        </div>

        <button type="submit" className="submitbtn">
          {currstate === "Sign Up" ? "Create account" : "Login"}
        </button>

        <div className="logincondition">
          <input type="checkbox" name="condition" required />
          <p>By continuing, I agree to the terms of use & privacy policy</p>
        </div>

        {currstate === "Login" ? (
          <p>
            Create a new account?{" "}
            <span onClick={() => setcurrstate("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account?{" "}
            <span onClick={() => setcurrstate("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default Loginpopup;