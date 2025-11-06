import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StoreContext } from '../../context/Storecontext.jsx';
// import './Navbar.css'; // Assuming you have styles

const Navbar = () => {
    const { user, logout, setShowLogin } = useContext(StoreContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/'); // Navigate to home on logout
    };

    return (
        <nav className='navbar' style={styles.navbar}>
            <Link to='/' style={styles.logo}>
                <h1>AI News</h1>
            </Link>
            
            <ul className='navbar-menu' style={styles.menu}>
                <li style={styles.menuItem}><Link to='/' style={styles.link}>Home</Link></li>
                <li style={styles.menuItem}><Link to='/tech' style={styles.link}>Tech</Link></li>
                <li style={styles.menuItem}><Link to='/sports' style={styles.link}>Sports</Link></li>
                <li style={styles.menuItem}><Link to='/politics' style={styles.link}>Politics</Link></li>
                <li style={styles.menuItem}><Link to='/entertainment' style={styles.link}>Entertainment</Link></li>
            </ul>

            <div className='navbar-right' style={styles.navbarRight}>
                {/* <button style={styles.searchButton}>Search</button> */}
                {user ? (
                    // User is logged in
                    <div className='navbar-profile' style={styles.profile}>
                        <span style={styles.username}>Profile</span>
                        <div className='profile-dropdown' style={styles.dropdown}>
                            {/* This would be a dropdown on hover in a real app */}
                            <button onClick={handleLogout} style={styles.logoutButton}>
                                Logout
                            </button>
                        </div>
                    </div>
                ) : (
                    // User is logged out
                    <button 
                        onClick={() => setShowLogin(true)}
                        style={styles.loginButton}
                    >
                        Login
                    </button>
                )}
            </div>
        </nav>
    );
};

// --- Basic CSS-in-JS for Demonstration ---
const styles = {
    navbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    },
    logo: {
        textDecoration: 'none',
        color: '#000',
        fontSize: '18px'
    },
    menu: {
        display: 'flex',
        listStyle: 'none',
        gap: '20px'
    },
    menuItem: {},
    link: {
        textDecoration: 'none',
        color: '#333'
    },
    navbarRight: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    profile: {
        position: 'relative'
    },
    username: {
        cursor: 'pointer'
    },
    dropdown: {
        // You would show/hide this on hover in a real app
        display: 'none', // Simple for now
        position: 'absolute',
        top: '100%',
        right: 0,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px'
    },
    logoutButton: {
        padding: '10px',
        border: 'none',
        background: 'none',
        cursor: 'pointer'
    },
    loginButton: {
        padding: '10px 20px',
        border: '1px solid #007bff',
        borderRadius: '20px',
        backgroundColor: 'transparent',
        color: '#007bff',
        cursor: 'pointer'
    }
};

export default Navbar;