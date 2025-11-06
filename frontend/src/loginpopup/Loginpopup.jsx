import React, { useState, useContext } from 'react';
import { StoreContext } from '../context/Storecontext';
// Assuming you have a CSS file for styling
// import './Loginpopup.css'; 

const Loginpopup = () => {
    const { setShowLogin, login, signup, error } = useContext(StoreContext);
    const [currentState, setCurrentState] = useState("Login"); // "Login" or "Sign Up"
    
    // Form data state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState(""); // Only for "Sign Up"

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent form from refreshing the page
        
        if (currentState === "Login") {
            login(email, password);
        } else {
            signup(email, password, username);
        }
    };

    return (
        <div className='login-popup' style={styles.popupOverlay}>
            <div className='login-popup-container' style={styles.popupContainer}>
                <div className='login-popup-title' style={styles.titleContainer}>
                    <h2>{currentState}</h2>
                    <button 
                        onClick={() => setShowLogin(false)} 
                        style={styles.closeButton}
                    >
                        &times;
                    </button>
                </div>
                <form onSubmit={handleSubmit} className='login-popup-form'>
                    <div className='login-popup-inputs' style={styles.inputs}>
                        {currentState === "Sign Up" && (
                            <input 
                                type="text" 
                                placeholder='Your name' 
                                required 
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                style={styles.input}
                            />
                        )}
                        <input 
                            type="email" 
                            placeholder='Your email' 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={styles.input}
                        />
                        <input 
                            type="password" 
                            placeholder='Password' 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    {error && <p style={styles.errorText}>{error}</p>}
                    <button type="submit" style={styles.submitButton}>
                        {currentState === "Sign Up" ? "Create account" : "Login"}
                    </button>
                    <div className='login-popup-condition'>
                        <input type="checkbox" required />
                        <p>By continuing, I agree to the terms of use & privacy policy.</p>
                    </div>
                </form>
                {currentState === "Login" ? (
                    <p style={styles.toggleText}>
                        Create a new account? <span onClick={() => setCurrentState("Sign Up")} style={styles.toggleLink}>Click here</span>
                    </p>
                ) : (
                    <p style={styles.toggleText}>
                        Already have an account? <span onClick={() => setCurrentState("Login")} style={styles.toggleLink}>Login here</span>
                    </p>
                )}
            </div>
        </div>
    );
};

// --- Basic CSS-in-JS for Demonstration ---
// (You would replace these with your CSS file)
const styles = {
    popupOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100
    },
    popupContainer: {
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    titleContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    closeButton: {
        border: 'none',
        background: 'none',
        fontSize: '24px',
        cursor: 'pointer'
    },
    inputs: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    input: {
        padding: '10px',
        borderRadius: '4px',
        border: '1px solid #ccc'
    },
    submitButton: {
        padding: '10px',
        borderRadius: '4px',
        border: 'none',
        backgroundColor: '#007bff',
        color: 'white',
        cursor: 'pointer'
    },
    errorText: {
        color: 'red',
        fontSize: '14px',
        textAlign: 'center'
    },
    toggleText: {
        fontSize: '14px',
        textAlign: 'center'
    },
    toggleLink: {
        color: '#007bff',
        fontWeight: 'bold',
        cursor: 'pointer'
    }
};

export default Loginpopup;