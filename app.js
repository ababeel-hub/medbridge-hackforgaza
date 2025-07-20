// Firebase configuration and initialization
const firebaseConfig = {
    apiKey: "AIzaSyCVE0UlE4gGSYNiRbt_QhwkuN_ebeNZFCc",
    authDomain: "medbridge-hackforgaza.firebaseapp.com",
    projectId: "medbridge-hackforgaza",
    storageBucket: "medbridge-hackforgaza.firebasestorage.app",
    messagingSenderId: "750494963580",
    appId: "1:750494963580:web:f72e4caf4764aa0a6276f9",
    measurementId: "G-BHJ03BEXXG"
};

// Global variables
let firebaseApp, auth, db;

// Initialize Firebase when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Import Firebase modules
        const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
        const { getFirestore, enableNetwork, disableNetwork, setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Initialize Firebase
        firebaseApp = initializeApp(firebaseConfig);
        auth = getAuth(firebaseApp);
        db = getFirestore(firebaseApp);

        // Make Firebase available globally
        window.firebaseApp = firebaseApp;
        window.firebaseAuth = auth;
        window.firebaseDb = db;

        console.log('Firebase initialized successfully');

        // Authentication state listener
        onAuthStateChanged(auth, (user) => {
            console.log('Auth state changed:', user ? 'User logged in' : 'No user');
            if (user) {
                console.log('User ID:', user.uid);
                updateAuthUI(user);
            } else {
                updateAuthUI(null);
            }
        });

        // Initialize app
        initializeApp();

    } catch (error) {
        console.error('Firebase initialization failed:', error);
        showError('Failed to initialize app. Please refresh the page.');
    }
});

// Authentication functions
async function signInWithEmail(email, password) {
    const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        console.log('Email sign-in successful:', result.user.uid);
        return result.user;
    } catch (error) {
        console.error('Email sign-in failed:', error);
        throw error;
    }
}

async function createUserWithEmail(email, password, userType) {
    const { createUserWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
    
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User creation successful:', result.user.uid);
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.email.split('@')[0],
            userType: userType,
            specialty: 'General Medicine',
            hospital: 'To be updated',
            location: 'Gaza',
            experience: 'To be updated',
            phone: '',
            isVerified: false,
            createdAt: new Date(),
            lastActive: new Date()
        });
        
        return result.user;
    } catch (error) {
        console.error('User creation failed:', error);
        throw error;
    }
}

async function signOutUser() {
    const { signOut } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');
    try {
        await signOut(auth);
        console.log('Sign out successful');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userType');
    } catch (error) {
        console.error('Sign out failed:', error);
        throw error;
    }
}

// UI Management
function showView(viewId) {
    console.log('showView called with:', viewId);
    
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show the requested view
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
        console.log('View shown:', viewId);
    } else {
        console.error('View not found:', viewId);
    }
}

function updateAuthUI(user) {
    if (user) {
        // User is signed in - show appropriate dashboard based on user type
        const userType = localStorage.getItem('userType') || 'internal';
        if (userType === 'internal') {
            showView('internal-dashboard-view');
        } else {
            showView('external-dashboard-view');
        }
    } else {
        // User is signed out - show login
        showView('login-view');
    }
}

function showError(message) {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    } else {
        alert(message);
    }
}

function hideError() {
    const errorDiv = document.getElementById('auth-error');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

// Form validation
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password && password.length >= 6;
}

// Login/Register handlers
async function handleLogin(email, password, role, isRegistering = false) {
    console.log('handleLogin called', { email, role, isRegistering });
    
    // Validation
    if (!email || !password || !role) {
        showError('Please fill in all fields');
        return false;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    if (!validatePassword(password)) {
        showError('Password must be at least 6 characters long');
        return false;
    }
    
    hideError();
    
    try {
        let user;
        
        if (isRegistering) {
            // Register new user
            user = await createUserWithEmail(email, password, role);
            console.log('Registration successful');
        } else {
            // Try to sign in
            user = await signInWithEmail(email, password);
            console.log('Login successful');
        }
        
        // Store user info
        localStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            role: role
        }));
        localStorage.setItem('userType', role);
        
        return true;
        
    } catch (error) {
        console.error('Authentication failed:', error);
        
        // Handle specific error codes
        switch (error.code) {
            case 'auth/user-not-found':
                showError('No account found with this email. Please register first.');
                break;
            case 'auth/wrong-password':
                showError('Incorrect password. Please try again.');
                break;
            case 'auth/email-already-in-use':
                showError('An account with this email already exists. Please sign in instead.');
                break;
            case 'auth/weak-password':
                showError('Password is too weak. Please choose a stronger password.');
                break;
            case 'auth/invalid-email':
                showError('Invalid email address format.');
                break;
            case 'auth/too-many-requests':
                showError('Too many failed attempts. Please try again later.');
                break;
            default:
                showError(`Authentication failed: ${error.message}`);
        }
        
        return false;
    }
}

// App initialization
function initializeApp() {
    console.log('Initializing app...');
    
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            await handleLogin(email, password, role, false);
        });
    }
    
    // Register form handling
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('register-email').value.trim();
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm-password').value;
            const role = document.getElementById('register-role').value;
            
            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }
            
            await handleLogin(email, password, role, true);
        });
    }
    
    // Toggle between login and register forms
    const showRegisterBtn = document.getElementById('show-register');
    const showLoginBtn = document.getElementById('show-login');
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    
    if (showRegisterBtn && registerCard) {
        showRegisterBtn.addEventListener('click', function(e) {
            e.preventDefault();
            loginCard.classList.add('hidden');
            registerCard.classList.remove('hidden');
        });
    }
    
    if (showLoginBtn && loginCard) {
        showLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            registerCard.classList.add('hidden');
            loginCard.classList.remove('hidden');
        });
    }
    
    // Logout buttons
    setupLogoutButtons();
    
    // Navigation buttons
    setupNavigationButtons();
    
    console.log('App initialized successfully');
}

function setupLogoutButtons() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            try {
                await signOutUser();
            } catch (error) {
                console.error('Logout failed:', error);
            }
        });
    }
    
    const extLogoutBtn = document.getElementById('ext-logout-btn');
    if (extLogoutBtn) {
        extLogoutBtn.addEventListener('click', async function() {
            try {
                await signOutUser();
            } catch (error) {
                console.error('Logout failed:', error);
            }
        });
    }
}

function setupNavigationButtons() {
    // Internal Doctor Navigation
    const createCaseBtn = document.getElementById('create-case-btn');
    if (createCaseBtn) {
        createCaseBtn.addEventListener('click', function() {
            showView('case-creation-view');
        });
    }

    const backToDashboard = document.getElementById('back-to-dashboard');
    if (backToDashboard) {
        backToDashboard.addEventListener('click', function() {
            showView('internal-dashboard-view');
        });
    }

    // External Doctor Navigation
    const viewMyAssignedBtn = document.getElementById('view-my-assigned-btn');
    if (viewMyAssignedBtn) {
        viewMyAssignedBtn.addEventListener('click', function() {
            showView('my-assigned-cases-view');
        });
    }

    const backToExtDashboard = document.getElementById('back-to-ext-dashboard');
    if (backToExtDashboard) {
        backToExtDashboard.addEventListener('click', function() {
            showView('external-dashboard-view');
        });
    }

    // Case forms
    setupCaseForms();
}

function setupCaseForms() {
    // Case creation form
    const caseForm = document.getElementById('case-creation-form');
    if (caseForm) {
        caseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // TODO: Implement case submission to Firebase
            alert('Case submitted successfully!');
            showView('internal-dashboard-view');
        });
    }

    // Expert review form
    const expertReviewForm = document.getElementById('expert-review-form');
    if (expertReviewForm) {
        expertReviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Expert review submitted successfully!');
            showView('my-assigned-cases-view');
        });
    }
}

// Populate mock data function (if needed)
async function populateMockData() {
    try {
        if (typeof window.MOCK_DATA !== 'undefined' && window.firebaseDb) {
            const { setDoc, doc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            const mockData = window.MOCK_DATA;
            console.log('Populating mock data...');
            
            // Add users
            for (const user of mockData.users) {
                await setDoc(doc(window.firebaseDb, 'users', user.uid), user);
            }
            
            // Add cases
            for (const caseData of mockData.cases) {
                await setDoc(doc(window.firebaseDb, 'cases', caseData.id), caseData);
            }
            
            // Add answers
            for (const answer of mockData.answers) {
                await setDoc(doc(window.firebaseDb, 'answers', answer.id), answer);
            }
            
            // Add votes
            for (const vote of mockData.votes) {
                await setDoc(doc(window.firebaseDb, 'votes', vote.id), vote);
            }
            
            console.log('Mock data populated successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error populating mock data:', error);
        return false;
    }
}

// Export functions for global use
window.showView = showView;
window.populateMockData = populateMockData; 