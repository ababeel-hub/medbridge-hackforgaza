// Firebase configuration for data fetching (auth still disabled for demo)
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

// Initialize app when DOM is loaded (Firebase for data, demo auth)
document.addEventListener('DOMContentLoaded', async function() {
    console.log('DEMO MODE: Starting app with Firebase data but demo auth');
    
    // Wait a bit for mock data to load
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Mock data available:', typeof window.MOCK_DATA !== 'undefined');
    console.log('Current user in localStorage:', localStorage.getItem('currentUser'));
    console.log('User type in localStorage:', localStorage.getItem('userType'));
    
    try {
        // Import Firebase modules for data access
        const { initializeApp: initFirebaseApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
        const { getFirestore, enableNetwork, disableNetwork } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');

        // Initialize Firebase for data access only
        firebaseApp = initFirebaseApp(firebaseConfig);
        db = getFirestore(firebaseApp);

        // Make Firebase DB available globally
        window.firebaseApp = firebaseApp;
        window.firebaseDb = db;
        window.db = db; // Also set window.db for compatibility

        console.log('Firebase initialized for data access');
        console.log('Firebase DB available:', !!window.firebaseDb);
        console.log('Window DB available:', !!window.db);

        // Load app data and populate if empty
        await loadAppData();

        // Initialize app
        initializeApp();

    } catch (error) {
        console.error('Firebase initialization failed:', error);
        console.log('Falling back to mock data only');
        
        // Check if mock data is available
        if (typeof window.MOCK_DATA !== 'undefined') {
            console.log('Mock data available, using fallback');
            window.APP_DATA = {
                cases: window.MOCK_DATA.cases || [],
                users: window.MOCK_DATA.users || [],
                answers: window.MOCK_DATA.answers || [],
                votes: window.MOCK_DATA.votes || [],
                source: 'mock'
            };
        } else {
            console.error('Mock data also not available!');
        }
        
        // Initialize app even if Firebase fails
        initializeApp();
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
    // DEMO MODE: Simple logout without Firebase
    console.log('DEMO MODE: Signing out user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userType');
    console.log('Demo sign out successful');
    
    /* COMMENTED OUT - FIREBASE SIGN OUT
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
    */
}

// UI Management
function showView(viewId) {
    console.log('showView called with:', viewId);
    
    // Store current view
    window.currentView = viewId;
    
    // Hide all views
    document.querySelectorAll('.view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Show the requested view
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.classList.add('active');
        console.log('View shown:', viewId);
        
        // Load cases data for dashboard views and assigned cases view
        if (viewId.includes('dashboard') || viewId === 'my-assigned-cases-view') {
            setTimeout(() => {
                console.log('Auto-loading cases for view:', viewId);
                loadAndDisplayCases();
            }, 100);
        }
        
        // For internal dashboard, also trigger the initial tab load
        if (viewId === 'internal-dashboard-view') {
            setTimeout(() => {
                console.log('Loading initial tab content for internal dashboard');
                const activeTab = document.querySelector('.tab-button.active')?.getAttribute('data-view') || 'recent';
                loadAndDisplayFilteredCases(activeTab);
            }, 200);
        }
        
        // For external dashboard, also trigger the initial tab load
        if (viewId === 'external-dashboard-view') {
            setTimeout(() => {
                console.log('Loading initial tab content for external dashboard');
                const activeTab = document.querySelector('#available-cases-tab.active, #my-assigned-tab.active')?.getAttribute('data-view') || 'available';
                loadAndDisplayExternalCases(activeTab);
            }, 200);
        }
        
        // Re-setup event listeners for the new view
        setTimeout(() => {
            setupEventListenersForCurrentView(viewId);
        }, 150);
    } else {
        console.error('View not found:', viewId);
    }
}

function getCurrentView() {
    return window.currentView || 'login-view';
}

// Tab and Filter Management
function setupTabsAndFilters() {
    console.log('Setting up tabs and filters...');
    
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetView = this.getAttribute('data-view');
            
            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            if (targetView === 'recent') {
                document.getElementById('recent-cases-content').classList.add('active');
                loadAndDisplayFilteredCases('recent');
            } else if (targetView === 'my-cases') {
                document.getElementById('my-cases-content').classList.add('active');
                loadAndDisplayFilteredCases('my-cases');
            }
        });
    });
    
    // Filter change listeners for Recent Cases tab
    const statusFilter = document.getElementById('status-filter');
    const tagFilter = document.getElementById('tag-filter');
    const sortFilter = document.getElementById('sort-filter');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    
    if (statusFilter) statusFilter.addEventListener('change', () => loadAndDisplayFilteredCases('recent'));
    if (tagFilter) tagFilter.addEventListener('change', () => loadAndDisplayFilteredCases('recent'));
    if (sortFilter) sortFilter.addEventListener('change', () => loadAndDisplayFilteredCases('recent'));
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', () => {
            statusFilter.value = 'all';
            tagFilter.value = 'all';
            sortFilter.value = 'recent';
            loadAndDisplayFilteredCases('recent');
        });
    }
    
    // Filter change listeners for My Cases tab
    const myStatusFilter = document.getElementById('my-status-filter');
    const myTagFilter = document.getElementById('my-tag-filter');
    const mySortFilter = document.getElementById('my-sort-filter');
    const clearMyFiltersBtn = document.getElementById('clear-my-filters-btn');
    
    // External doctor filter listeners
    const extStatusFilter = document.getElementById('ext-status-filter');
    const extSpecialtyFilter = document.getElementById('ext-specialty-filter');
    const extPriorityFilter = document.getElementById('ext-priority-filter');
    const extSortFilter = document.getElementById('ext-sort-filter');
    const clearExtFiltersBtn = document.getElementById('clear-ext-filters-btn');
    
    const myExtStatusFilter = document.getElementById('my-ext-status-filter');
    const myExtSpecialtyFilter = document.getElementById('my-ext-specialty-filter');
    const myExtSortFilter = document.getElementById('my-ext-sort-filter');
    const clearMyExtFiltersBtn = document.getElementById('clear-my-ext-filters-btn');
    
    if (myStatusFilter) myStatusFilter.addEventListener('change', () => loadAndDisplayFilteredCases('my-cases'));
    if (myTagFilter) myTagFilter.addEventListener('change', () => loadAndDisplayFilteredCases('my-cases'));
    if (mySortFilter) mySortFilter.addEventListener('change', () => loadAndDisplayFilteredCases('my-cases'));
    if (clearMyFiltersBtn) {
        clearMyFiltersBtn.addEventListener('click', () => {
            myStatusFilter.value = 'all';
            myTagFilter.value = 'all';
            mySortFilter.value = 'recent';
            loadAndDisplayFilteredCases('my-cases');
        });
    }
    
    // External doctor filter listeners
    if (extStatusFilter) extStatusFilter.addEventListener('change', () => loadAndDisplayExternalCases('available'));
    if (extSpecialtyFilter) extSpecialtyFilter.addEventListener('change', () => loadAndDisplayExternalCases('available'));
    if (extPriorityFilter) extPriorityFilter.addEventListener('change', () => loadAndDisplayExternalCases('available'));
    if (extSortFilter) extSortFilter.addEventListener('change', () => loadAndDisplayExternalCases('available'));
    if (clearExtFiltersBtn) {
        clearExtFiltersBtn.addEventListener('click', () => {
            extStatusFilter.value = 'all';
            extSpecialtyFilter.value = 'all';
            extPriorityFilter.value = 'all';
            extSortFilter.value = 'recent';
            loadAndDisplayExternalCases('available');
        });
    }
    
    if (myExtStatusFilter) myExtStatusFilter.addEventListener('change', () => loadAndDisplayExternalCases('assigned'));
    if (myExtSpecialtyFilter) myExtSpecialtyFilter.addEventListener('change', () => loadAndDisplayExternalCases('assigned'));
    if (myExtSortFilter) myExtSortFilter.addEventListener('change', () => loadAndDisplayExternalCases('assigned'));
    if (clearMyExtFiltersBtn) {
        clearMyExtFiltersBtn.addEventListener('click', () => {
            myExtStatusFilter.value = 'all';
            myExtSpecialtyFilter.value = 'all';
            myExtSortFilter.value = 'recent';
            loadAndDisplayExternalCases('assigned');
        });
    }
    
    // External doctor tab switching
    const extTabButtons = document.querySelectorAll('#available-cases-tab, #my-assigned-tab');
    const extTabContents = document.querySelectorAll('#available-cases-content, #assigned-cases-content');
    
    extTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetView = this.getAttribute('data-view');
            
            // Remove active class from all tabs and contents
            extTabButtons.forEach(btn => btn.classList.remove('active'));
            extTabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Show corresponding content
            if (targetView === 'available') {
                document.getElementById('available-cases-content').classList.add('active');
                loadAndDisplayExternalCases('available');
            } else if (targetView === 'assigned') {
                document.getElementById('assigned-cases-content').classList.add('active');
                loadAndDisplayExternalCases('assigned');
            }
        });
    });
    
    console.log('Tabs and filters setup complete');
}

// Load and display filtered cases
async function loadAndDisplayFilteredCases(tabType) {
    try {
        console.log('loadAndDisplayFilteredCases called with tabType:', tabType);
        
        // Ensure we have data
        if (!window.APP_DATA || !window.APP_DATA.cases) {
            console.log('No app data available, loading from Firebase...');
            await loadAppData();
        }
        
        console.log('APP_DATA after loading:', window.APP_DATA);
        console.log('Number of cases:', window.APP_DATA?.cases?.length || 0);
        
        const cases = window.APP_DATA.cases || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userEmail = currentUser.email?.split('@')[0] || 'internal_001';
        
        let filteredCases = [];
        let containerId = '';
        
        if (tabType === 'recent') {
            // Recent Cases: ALL cases in the system that are in_review or completed
            filteredCases = cases.filter(c => 
                c.status === 'in_review' || c.status === 'completed'
            );
            containerId = 'internal-cases-list';
            
            // Apply filters
            const statusFilter = document.getElementById('status-filter')?.value || 'all';
            const tagFilter = document.getElementById('tag-filter')?.value || 'all';
            const sortFilter = document.getElementById('sort-filter')?.value || 'recent';
            
            if (statusFilter !== 'all') {
                filteredCases = filteredCases.filter(c => c.status === statusFilter);
            }
            if (tagFilter !== 'all') {
                filteredCases = filteredCases.filter(c => 
                    // Check both specialty field (new cases) and tags field (old cases)
                    (c.specialty && c.specialty === tagFilter) ||
                    (c.tags && c.tags.includes(tagFilter))
                );
            }
            
            // Apply sorting
            filteredCases = applySorting(filteredCases, sortFilter);
            
        } else if (tabType === 'my-cases') {
            // My Cases: draft and submitted
            filteredCases = cases.filter(c => 
                c.createdBy === userEmail && 
                (c.status === 'draft' || c.status === 'submitted')
            );
            containerId = 'my-cases-list';
            
            // Apply filters
            const statusFilter = document.getElementById('my-status-filter')?.value || 'all';
            const tagFilter = document.getElementById('my-tag-filter')?.value || 'all';
            const sortFilter = document.getElementById('my-sort-filter')?.value || 'recent';
            
            if (statusFilter !== 'all') {
                filteredCases = filteredCases.filter(c => c.status === statusFilter);
            }
            if (tagFilter !== 'all') {
                filteredCases = filteredCases.filter(c => 
                    // Check both specialty field (new cases) and tags field (old cases)
                    (c.specialty && c.specialty === tagFilter) ||
                    (c.tags && c.tags.includes(tagFilter))
                );
            }
            
            // Apply sorting
            filteredCases = applySorting(filteredCases, sortFilter);
        }
        
        console.log(`Rendering ${filteredCases.length} filtered cases for ${tabType}`);
        renderCases(filteredCases, containerId, 'internal');
        
        // Update dynamic headings
        updateDynamicHeadings(tabType, filteredCases.length);
        
        // Update counts
        updateCaseCounts(cases, userEmail);
        
    } catch (error) {
        console.error('Error loading filtered cases:', error);
        showErrorState();
    }
}

// Load and display filtered cases for external doctors
async function loadAndDisplayExternalCases(tabType) {
    try {
        console.log('loadAndDisplayExternalCases called with tabType:', tabType);
        
        // Ensure we have data
        if (!window.APP_DATA || !window.APP_DATA.cases) {
            console.log('No app data available, loading from Firebase...');
            await loadAppData();
        }
        
        console.log('APP_DATA after loading:', window.APP_DATA);
        console.log('Number of cases:', window.APP_DATA?.cases?.length || 0);
        
        const cases = window.APP_DATA.cases || [];
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userEmail = currentUser.email?.split('@')[0] || 'external_001';
        
        let filteredCases = [];
        let containerId = '';
        
        if (tabType === 'available') {
            // Available Cases: submitted or in_review cases not assigned to current user
            filteredCases = cases.filter(c => 
                (c.status === 'submitted' || c.status === 'in_review') &&
                c.assignedTo !== userEmail
            );
            containerId = 'external-cases-list';
            
            // Apply filters
            const statusFilter = document.getElementById('ext-status-filter')?.value || 'all';
            const specialtyFilter = document.getElementById('ext-specialty-filter')?.value || 'all';
            const priorityFilter = document.getElementById('ext-priority-filter')?.value || 'all';
            const sortFilter = document.getElementById('ext-sort-filter')?.value || 'recent';
            
            if (statusFilter !== 'all') {
                filteredCases = filteredCases.filter(c => c.status === statusFilter);
            }
            if (specialtyFilter !== 'all') {
                filteredCases = filteredCases.filter(c => 
                    (c.specialty && c.specialty === specialtyFilter) ||
                    (c.tags && c.tags.includes(specialtyFilter))
                );
            }
            if (priorityFilter !== 'all') {
                filteredCases = filteredCases.filter(c => c.priority === priorityFilter);
            }
            
            // Apply sorting
            filteredCases = applySorting(filteredCases, sortFilter);
            
        } else if (tabType === 'assigned') {
            // My Assigned Cases
            filteredCases = cases.filter(c => c.assignedTo === userEmail);
            containerId = 'my-assigned-cases-list';
            
            // Apply filters
            const statusFilter = document.getElementById('my-ext-status-filter')?.value || 'all';
            const specialtyFilter = document.getElementById('my-ext-specialty-filter')?.value || 'all';
            const sortFilter = document.getElementById('my-ext-sort-filter')?.value || 'recent';
            
            if (statusFilter !== 'all') {
                filteredCases = filteredCases.filter(c => c.status === statusFilter);
            }
            if (specialtyFilter !== 'all') {
                filteredCases = filteredCases.filter(c => 
                    (c.specialty && c.specialty === specialtyFilter) ||
                    (c.tags && c.tags.includes(specialtyFilter))
                );
            }
            
            // Apply sorting
            filteredCases = applySorting(filteredCases, sortFilter);
        }
        
        console.log(`Rendering ${filteredCases.length} filtered cases for external ${tabType}`);
        renderCases(filteredCases, containerId, 'external');
        
        // Update counts
        updateExternalCaseCounts(cases, userEmail);
        
    } catch (error) {
        console.error('Error loading external cases:', error);
        showErrorState();
    }
}

// Apply sorting to cases
function applySorting(cases, sortType) {
    const sortedCases = [...cases];
    
    switch (sortType) {
        case 'recent':
            return sortedCases.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'oldest':
            return sortedCases.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        case 'priority-high':
            return sortedCases.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                const aPriority = priorityOrder[a.priority] || 0;
                const bPriority = priorityOrder[b.priority] || 0;
                return bPriority - aPriority;
            });
        case 'priority-low':
            return sortedCases.sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                const aPriority = priorityOrder[a.priority] || 0;
                const bPriority = priorityOrder[b.priority] || 0;
                return aPriority - bPriority;
            });
        default:
            return sortedCases;
    }
}

// Update dynamic headings based on filters
function updateDynamicHeadings(tabType, caseCount) {
    if (tabType === 'recent') {
        const statusFilter = document.getElementById('status-filter')?.value || 'all';
        const tagFilter = document.getElementById('tag-filter')?.value || 'all';
        const sortFilter = document.getElementById('sort-filter')?.value || 'recent';
        
        let heading = 'All Cases';
        let subtitle = 'Cases in review or completed';
        
        // Priority: Status > Tag > Sort
        if (statusFilter !== 'all') {
            const statusMap = {
                'in_review': 'In Review',
                'completed': 'Completed'
            };
            heading = `${statusMap[statusFilter]} Cases`;
            subtitle = `${caseCount} ${statusMap[statusFilter].toLowerCase()} cases`;
        } else if (tagFilter !== 'all') {
            const tagMap = {
                'emergency': 'Emergency',
                'acute': 'Acute',
                'cardiology': 'Cardiology',
                'orthopedics': 'Orthopedics',
                'pediatrics': 'Pediatrics',
                'trauma': 'Trauma',
                'chronic': 'Chronic'
            };
            heading = `${tagMap[tagFilter]} Cases`;
            subtitle = `${caseCount} cases tagged with ${tagMap[tagFilter].toLowerCase()}`;
        } else if (sortFilter === 'recent') {
            heading = 'Recent Cases';
            subtitle = `${caseCount} cases sorted by most recent`;
        } else if (sortFilter === 'oldest') {
            heading = 'All Cases';
            subtitle = `${caseCount} cases sorted by oldest first`;
        } else if (sortFilter === 'priority-high') {
            heading = 'High Priority Cases';
            subtitle = `${caseCount} cases sorted by priority (high to low)`;
        } else if (sortFilter === 'priority-low') {
            heading = 'Low Priority Cases';
            subtitle = `${caseCount} cases sorted by priority (low to high)`;
        }
        
        const headingElement = document.getElementById('all-cases-heading');
        const subtitleElement = document.getElementById('all-cases-subtitle');
        if (headingElement) headingElement.textContent = heading;
        if (subtitleElement) subtitleElement.textContent = subtitle;
        
    } else if (tabType === 'my-cases') {
        const statusFilter = document.getElementById('my-status-filter')?.value || 'all';
        const tagFilter = document.getElementById('my-tag-filter')?.value || 'all';
        const sortFilter = document.getElementById('my-sort-filter')?.value || 'recent';
        
        let heading = 'My Cases';
        let subtitle = 'Draft and submitted cases';
        
        // Priority: Status > Tag > Sort
        if (statusFilter !== 'all') {
            const statusMap = {
                'draft': 'Draft',
                'submitted': 'Submitted'
            };
            heading = `My ${statusMap[statusFilter]} Cases`;
            subtitle = `${caseCount} ${statusMap[statusFilter].toLowerCase()} cases`;
        } else if (tagFilter !== 'all') {
            const tagMap = {
                'emergency': 'Emergency',
                'acute': 'Acute',
                'cardiology': 'Cardiology',
                'orthopedics': 'Orthopedics',
                'pediatrics': 'Pediatrics',
                'trauma': 'Trauma',
                'chronic': 'Chronic'
            };
            heading = `My ${tagMap[tagFilter]} Cases`;
            subtitle = `${caseCount} of your cases tagged with ${tagMap[tagFilter].toLowerCase()}`;
        } else if (sortFilter === 'recent') {
            heading = 'My Recent Cases';
            subtitle = `${caseCount} of your cases sorted by most recent`;
        } else if (sortFilter === 'oldest') {
            heading = 'My Cases';
            subtitle = `${caseCount} of your cases sorted by oldest first`;
        } else if (sortFilter === 'priority-high') {
            heading = 'My High Priority Cases';
            subtitle = `${caseCount} of your cases sorted by priority (high to low)`;
        } else if (sortFilter === 'priority-low') {
            heading = 'My Low Priority Cases';
            subtitle = `${caseCount} of your cases sorted by priority (low to high)`;
        }
        
        const headingElement = document.getElementById('my-cases-heading');
        const subtitleElement = document.getElementById('my-cases-subtitle');
        if (headingElement) headingElement.textContent = heading;
        if (subtitleElement) subtitleElement.textContent = subtitle;
    }
}

// Submit case to Firestore
async function submitCase(status) {
    try {
        console.log('Submitting case with status:', status);
        
        // Get form data
        const title = document.getElementById('case-title')?.value?.trim();
        const ageRange = document.getElementById('age-range')?.value;
        const gender = document.querySelector('input[name="gender"]:checked')?.value;
        const caseType = document.getElementById('case-type')?.value;
        const symptoms = document.getElementById('case-symptoms')?.value?.trim();
        const medicalHistory = document.getElementById('medical-history')?.value?.trim();
        const urgency = document.getElementById('case-urgency')?.value;
        const researchConsent = document.getElementById('research-consent')?.checked;
        
        // Validation
        if (!title || !ageRange || !gender || !caseType || !symptoms || !medicalHistory) {
            showErrorMessage('Please fill in all required fields.');
            return;
        }
        
        if (status === 'submitted' && !urgency) {
            showErrorMessage('Please select a priority level to submit the case.');
            return;
        }
        
        // Get current user
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userEmail = currentUser.email?.split('@')[0] || 'internal_001';
        
        // Create case object compatible with existing structure
        const caseData = {
            id: generateCaseId(),
            title: title,
            createdBy: userEmail,
            assignedTo: null,
            status: status,
            specialty: caseType, // Map case_type to specialty for compatibility
            patientAge: ageRange,
            patientGender: gender,
            symptoms: symptoms,
            medicalHistory: medicalHistory,
            vitalSigns: {}, // Will be filled later by medical staff
            labResults: {}, // Will be filled later by medical staff
            imaging: '', // Will be filled later by medical staff
            treatmentGiven: '', // Will be filled later by medical staff
            tags: [caseType], // Use case_type as primary tag for compatibility
            priority: urgency || 'medium',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            researchConsent: researchConsent || false
        };
        
        console.log('Saving case to Firestore:', caseData);
        console.log('Firebase DB available:', !!window.db, !!window.firebaseDb);
        
        // Save to Firestore using modern Firebase v9+ syntax
        const db = window.db || window.firebaseDb;
        if (db) {
            try {
                // Import Firestore functions
                const { doc, setDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                
                // Save to Firestore
                await setDoc(doc(db, 'cases', caseData.id), caseData);
                console.log('Case saved successfully to Firestore');
                
                // Update local data
                if (!window.APP_DATA) window.APP_DATA = {};
                if (!window.APP_DATA.cases) window.APP_DATA.cases = [];
                window.APP_DATA.cases.push(caseData);
                
                // Show success message
                const statusText = status === 'draft' ? 'saved as draft' : 'submitted for review';
                console.log(`Case ${statusText} successfully!`);
                
                // Clear form
                document.getElementById('case-creation-form')?.reset();
                
                // Redirect to dashboard
                showView('internal-dashboard-view');
                
                // Reload cases to show the new one
                setTimeout(() => {
                    loadAndDisplayCases();
                }, 200);
                
                // Show temporary success message in UI instead of alert
                showSuccessMessage(`Case ${statusText} successfully!`);
                
            } catch (firestoreError) {
                console.error('Firestore save error:', firestoreError);
                showErrorMessage('Error saving to database. Please try again.');
            }
            
        } else {
            console.error('Firestore not available - DB instances:', { 
                windowDb: !!window.db, 
                windowFirebaseDb: !!window.firebaseDb,
                firebaseApp: !!window.firebaseApp 
            });
            showErrorMessage('Unable to save case. Database connection not available.');
        }
        
    } catch (error) {
        console.error('Error submitting case:', error);
        showErrorMessage('Error saving case. Please try again.');
    }
}

// Generate unique case ID
function generateCaseId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `case_${timestamp}_${random}`;
}

// Show success message with auto-dismiss
function showSuccessMessage(message) {
    // Remove any existing message
    const existing = document.getElementById('success-message');
    if (existing) existing.remove();
    
    // Create success message element
    const messageEl = document.createElement('div');
    messageEl.id = 'success-message';
    messageEl.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    messageEl.innerHTML = `
        <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(messageEl);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (messageEl && messageEl.parentNode) {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => messageEl.remove(), 300);
        }
    }, 3000);
}

// Show error message with auto-dismiss
function showErrorMessage(message) {
    // Remove any existing message
    const existing = document.getElementById('error-message');
    if (existing) existing.remove();
    
    // Create error message element
    const messageEl = document.createElement('div');
    messageEl.id = 'error-message';
    messageEl.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
    messageEl.innerHTML = `
        <div class="flex items-center space-x-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(messageEl);
    
    // Auto remove after 5 seconds (longer for errors)
    setTimeout(() => {
        if (messageEl && messageEl.parentNode) {
            messageEl.style.opacity = '0';
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => messageEl.remove(), 300);
        }
    }, 5000);
}

// Update case counts
function updateCaseCounts(cases, userEmail) {
    // Count all cases in the system for the stats
    const allInReviewCases = cases.filter(c => c.status === 'in_review').length;
    const allCompletedCases = cases.filter(c => c.status === 'completed').length;
    const totalAllCases = allInReviewCases + allCompletedCases;
    
    // Count user's own cases for reference
    const userCases = cases.filter(c => c.createdBy === userEmail);
    const userDraftSubmitted = userCases.filter(c => c.status === 'draft' || c.status === 'submitted').length;
    
    updateCaseCount('total-cases', totalAllCases);
    updateCaseCount('pending-cases', allInReviewCases);
    updateCaseCount('completed-cases', allCompletedCases);
}

function setupEventListenersForCurrentView(viewId) {
    console.log(`Setting up event listeners for view: ${viewId}`);
    
    // Only setup listeners that are specific to this view to avoid duplicates
    if (viewId.includes('dashboard')) {
        setupLogoutButtons();
        setupNavigationButtons();
    }
    
    // Setup tabs and filters for internal dashboard
    if (viewId === 'internal-dashboard-view') {
        setupTabsAndFilters();
    }
    
    // Setup tabs and filters for external dashboard
    if (viewId === 'external-dashboard-view') {
        setupTabsAndFilters();
    }
    
    // Always setup form and action buttons for current view
    setupAllOtherButtons();
    setupViewDetailButtons();
}

function updateAuthUI(user = null) {
    // DEMO MODE: Check localStorage for user session
    const currentUser = localStorage.getItem('currentUser');
    const userType = localStorage.getItem('userType');
    
    if (currentUser && userType) {
        // User is logged in - show appropriate dashboard
        console.log('DEMO MODE: User found in localStorage, showing', userType, 'dashboard');
        if (userType === 'internal') {
            showView('internal-dashboard-view');
        } else {
            showView('external-dashboard-view');
        }
        
        // Update user display names
        updateUserDisplayName();
    } else {
        // No user session - show login
        console.log('DEMO MODE: No user session, showing login');
        showView('login-view');
    }
}

function updateUserDisplayName() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Demo User';
    
    // Update all user name displays
    const nameElements = ['doctor-name', 'ext-doctor-name', 'welcome-name', 'ext-welcome-name'];
    nameElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = displayName;
        }
    });
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

// Login/Register handlers (DEMO MODE - No real authentication)
async function handleLogin(email, password, role, isRegistering = false) {
    console.log('handleLogin called (DEMO MODE)', { email, role, isRegistering });
    
    // Basic validation
    if (!email || !password || !role) {
        showError('Please fill in all fields');
        return false;
    }
    
    if (!validateEmail(email)) {
        showError('Please enter a valid email address');
        return false;
    }
    
    // For demo purposes, accept any password length
    if (!password || password.length < 1) {
        showError('Please enter a password');
        return false;
    }
    
    hideError();
    
    // DEMO MODE: Skip Firebase authentication
    console.log('DEMO MODE: Bypassing Firebase authentication');
    
    // Store user info for demo
    localStorage.setItem('currentUser', JSON.stringify({
        email: email,
        role: role,
        displayName: email.split('@')[0]
    }));
    localStorage.setItem('userType', role);
    
    console.log('Demo login successful, redirecting to', role, 'dashboard');
    return true;
    
    /* COMMENTED OUT - FIREBASE AUTHENTICATION
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
    */
}

// App initialization
function initializeApp() {
    console.log('Initializing app...');
    
    // Add small delay to ensure DOM is fully ready
    setTimeout(() => {
        // Check for existing user session on startup
        updateAuthUI();
        
        // Setup all event listeners
        setupEventListeners();
    }, 100);
}

function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Login form submitted');
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            const success = await handleLogin(email, password, role, false);
            if (success) {
                // Force update UI after successful login
                setTimeout(() => updateAuthUI(), 100);
            }
        });
        console.log('Login form listener attached');
    } else {
        console.warn('Login form not found');
    }
    
    // Setup all other buttons
    setupLogoutButtons();
    setupNavigationButtons();
    setupCaseForms();
    
    console.log('All event listeners set up successfully');
}

function setupLogoutButtons() {
    console.log('Setting up logout buttons...');
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Internal logout clicked');
            try {
                await signOutUser();
                updateAuthUI(); // Force UI update
            } catch (error) {
                console.error('Logout failed:', error);
            }
        });
        console.log('Internal logout button listener attached');
    } else {
        console.log('Internal logout button not found (normal if not on dashboard)');
    }
    
    const extLogoutBtn = document.getElementById('ext-logout-btn');
    if (extLogoutBtn) {
        extLogoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('External logout clicked');
            try {
                await signOutUser();
                updateAuthUI(); // Force UI update
            } catch (error) {
                console.error('Logout failed:', error);
            }
        });
        console.log('External logout button listener attached');
    } else {
        console.log('External logout button not found (normal if not on dashboard)');
    }
}

function setupNavigationButtons() {
    console.log('Setting up navigation buttons...');
    
    // Internal Doctor Navigation
    const createCaseBtn = document.getElementById('create-case-btn');
    if (createCaseBtn) {
        createCaseBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Create case button clicked');
            showView('case-creation-view');
        });
        console.log('Create case button listener attached');
    }

    const backToDashboard = document.getElementById('back-to-dashboard');
    if (backToDashboard) {
        backToDashboard.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Back to dashboard button clicked');
            showView('internal-dashboard-view');
        });
        console.log('Back to dashboard button listener attached');
    }

    // External Doctor Navigation (handled in setupAllOtherButtons)

    const backToExtDashboard = document.getElementById('back-to-ext-dashboard');
    if (backToExtDashboard) {
        backToExtDashboard.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Back to external dashboard button clicked');
            showView('external-dashboard-view');
        });
        console.log('Back to external dashboard button listener attached');
    }

    // Add more navigation buttons as needed
    setupAdditionalNavigationButtons();
}

function setupAdditionalNavigationButtons() {
    // Set up any additional navigation buttons that might exist
    const additionalButtons = [
        { id: 'back-to-cases', view: 'internal-dashboard-view', name: 'back to cases' },
        { id: 'back-to-assigned-cases', action: () => { showView('external-dashboard-view'); setTimeout(() => { document.getElementById('my-assigned-tab')?.click(); }, 200); }, name: 'back to assigned cases' },
        { id: 'back-to-ext-main', view: 'external-dashboard-view', name: 'back to external main' }
    ];
    
    additionalButtons.forEach(button => {
        const btn = document.getElementById(button.id);
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`${button.name} button clicked`);
                showView(button.view);
            });
            console.log(`${button.name} button listener attached`);
        }
    });
}

function setupCaseForms() {
    console.log('Setting up case forms...');
    
    // Case creation form
    const caseForm = document.getElementById('case-creation-form');
    if (caseForm) {
        caseForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Case creation form submitted');
            await submitCase('submitted');
        });
        console.log('Case creation form listener attached');
    }

    // Expert review form
    const expertReviewForm = document.getElementById('expert-review-form');
    if (expertReviewForm) {
        expertReviewForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Expert review form submitted');
            await submitExpertReview('final');
        });
        console.log('Expert review form listener attached');
    }
    
    // All other buttons that need listeners
    setupAllOtherButtons();
}

function setupAllOtherButtons() {
    console.log('Setting up all other buttons...');
    
    // Define all buttons with their actions
    const buttons = [
        // Action buttons (removed view-all-cases-btn as it's replaced with tabs and filters)
        { id: 'view-my-assigned-btn', action: () => { showView('my-assigned-cases-view'); loadAndDisplayCases(); }, name: 'view my assigned cases' },
        { id: 'save-draft-btn', action: async () => { console.log('Saving draft...'); await submitCase('draft'); }, name: 'save draft' },
        { id: 'save-draft-review-btn', action: () => submitExpertReview('draft'), name: 'save review draft' },
        { id: 'assign-to-me-btn', action: () => toggleCaseAssignment(), name: 'assign to me' },
        { id: 'provide-feedback-btn', action: () => { showView('case-review-view'); loadCaseIntoReviewView(window.currentCaseData); }, name: 'provide feedback' },
        { id: 'view-my-cases-btn', action: () => { showView('external-dashboard-view'); setTimeout(() => { document.getElementById('my-assigned-tab')?.click(); }, 200); }, name: 'view my cases' },
        { id: 'install-btn', action: handleInstallApp, name: 'install app' }
    ];
    
    // Setup each button
    buttons.forEach(button => {
        const btn = document.getElementById(button.id);
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log(`${button.name} button clicked`);
                button.action();
            });
            console.log(`${button.name} button listener attached`);
        } else {
            console.log(`${button.name} button not found (normal if not on current view)`);
        }
    });
    
    // Setup view detail buttons (these are dynamically created)
    setupViewDetailButtons();
}

function setupViewDetailButtons() {
    // View detail buttons now use onclick directly in the HTML
    // This function is kept for compatibility but does nothing
    console.log('View detail buttons setup (using onclick handlers)');
}

function handleInstallApp() {
    console.log('Install app clicked');
    // PWA install functionality would go here
    alert('PWA installation would be triggered here');
}

// Load data from Firebase or fallback to mock data
async function loadAppData() {
    try {
        if (window.firebaseDb) {
            console.log('Loading data from Firebase...');
            const { getDocs, collection } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            // Try to load cases from Firebase
            const casesSnapshot = await getDocs(collection(window.firebaseDb, 'cases'));
            const cases = [];
            casesSnapshot.forEach((doc) => {
                cases.push({ id: doc.id, ...doc.data() });
            });
            
            console.log(`Loaded ${cases.length} cases from Firebase`);
            
            if (cases.length > 0) {
                // Store in global variable for use by the app
                window.APP_DATA = {
                    cases: cases,
                    source: 'firebase'
                };
                return cases;
            } else {
                console.log('No cases found in Firebase, using existing database data');
            }
        }
    } catch (error) {
        console.error('Error loading data from Firebase:', error);
    }
    
    // Fallback to mock data
    console.log('Using mock data as fallback');
    console.log('MOCK_DATA available:', typeof window.MOCK_DATA !== 'undefined');
    if (typeof window.MOCK_DATA !== 'undefined') {
        console.log('MOCK_DATA structure:', window.MOCK_DATA);
        console.log('MOCK_DATA cases length:', window.MOCK_DATA.cases?.length || 0);
        window.APP_DATA = {
            cases: window.MOCK_DATA.cases || [],
            users: window.MOCK_DATA.users || [],
            answers: window.MOCK_DATA.answers || [],
            votes: window.MOCK_DATA.votes || [],
            source: 'mock'
        };
        console.log('APP_DATA set from mock data:', window.APP_DATA);
        return window.MOCK_DATA.cases || [];
    } else {
        console.error('MOCK_DATA is not available!');
    }
    
    return [];
}

// Mock data population removed - data already exists in database

// Render cases dynamically from Firestore data
function renderCases(cases, containerId, userType = 'internal') {
    const container = document.getElementById(containerId);
    if (!container) {
        console.log(`Container ${containerId} not found`);
        return;
    }
    
    if (!cases || cases.length === 0) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <div class="mb-4">
                    <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <p class="text-lg font-medium">No cases available</p>
                <p class="text-sm">${userType === 'internal' ? 'You haven\'t submitted any cases yet.' : 'No cases are currently awaiting review.'}</p>
            </div>
        `;
        return;
    }
    
    console.log(`Rendering ${cases.length} cases in ${containerId} for ${userType} user`);
    
    let casesHtml = '';
    
    cases.forEach(caseData => {
        const createdDate = new Date(caseData.createdAt?.seconds ? caseData.createdAt.seconds * 1000 : caseData.createdAt);
        const formattedDate = createdDate.toLocaleDateString();
        
        // Get priority color
        const priorityColor = caseData.priority === 'high' ? 'text-red-600' : 
                             caseData.priority === 'medium' ? 'text-yellow-600' : 'text-green-600';
        
        // Get status color
        const statusColor = caseData.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                           caseData.status === 'in_review' ? 'bg-yellow-100 text-yellow-800' :
                           caseData.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
        
        // Check if current user can delete this case
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userEmail = currentUser.email?.split('@')[0] || 'internal_001';
        const canDelete = userType === 'internal' && caseData.createdBy === userEmail && 
                         (caseData.status === 'draft' || caseData.status === 'submitted');
        
        casesHtml += `
            <div class="card hover:shadow-lg transition-shadow cursor-pointer case-card" onclick="showCaseDetails('${caseData.id}')">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="text-lg font-semibold text-gray-900">${caseData.title}</h3>
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusColor}">
                        ${caseData.status.replace('_', ' ').toUpperCase()}
                    </span>
                </div>
                
                <div class="space-y-2 mb-4">
                    <p class="text-sm text-gray-600">
                        <span class="font-medium">Specialty:</span> ${caseData.specialty}
                    </p>
                    <p class="text-sm text-gray-600">
                        <span class="font-medium">Patient:</span> ${caseData.patientAge}, ${caseData.patientGender}
                    </p>
                    <p class="text-sm text-gray-600">
                        <span class="font-medium">Priority:</span> 
                        <span class="${priorityColor} font-medium">${caseData.priority?.toUpperCase()}</span>
                    </p>
                </div>
                
                <p class="text-gray-600 text-sm mb-3">${caseData.symptoms?.substring(0, 150)}...</p>
                
                <div class="flex justify-between items-center pt-3 border-t border-gray-200">
                    <span class="text-xs text-gray-500">Created: ${formattedDate}</span>
                    <div class="flex space-x-2">
                        ${canDelete ? `
                            <button class="btn btn-secondary text-sm delete-case-btn" onclick="event.stopPropagation(); deleteCase('${caseData.id}')" title="Delete Case">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H9a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                            </button>
                        ` : ''}
                        <button class="btn btn-primary text-sm view-details-btn" onclick="event.stopPropagation(); showCaseDetails('${caseData.id}')">
                            ${userType === 'external' ? 'Review Case' : 'View Details'}
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = casesHtml;
    console.log(`✅ Rendered ${cases.length} cases successfully`);
}

// Load and display cases for current user type
async function loadAndDisplayCases() {
    try {
        // Show loading state
        showLoadingState();
        
        if (!window.APP_DATA || !window.APP_DATA.cases) {
            console.log('No app data available, loading from Firebase...');
            const loadedCases = await loadAppData();
            if (!loadedCases || loadedCases.length === 0) {
                console.log('No cases loaded, showing empty state');
                showEmptyState();
                return;
            }
        }
        
        const userType = localStorage.getItem('userType') || 'internal';
        const cases = window.APP_DATA.cases || [];
        
        console.log(`Loading cases for ${userType} user:`, cases);
        
        if (userType === 'internal') {
            // Internal doctors - load filtered cases for current tab
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userEmail = currentUser.email?.split('@')[0] || 'internal_001';
            
            // Check which tab is active
            const activeTab = document.querySelector('.tab-button.active')?.getAttribute('data-view') || 'recent';
            
            // Load appropriate cases for the active tab
            loadAndDisplayFilteredCases(activeTab);
            
            // Update overall counts
            updateCaseCounts(cases, userEmail);
            
        } else {
            // External doctors - use new filtering system
            const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const userEmail = currentUser.email?.split('@')[0] || 'external_001';
            
            // Check which tab is active
            const activeTab = document.querySelector('#available-cases-tab.active, #my-assigned-tab.active')?.getAttribute('data-view') || 'available';
            
            // Load appropriate cases for the active tab
            loadAndDisplayExternalCases(activeTab);
            
            // Update overall counts
            updateExternalCaseCounts(cases, userEmail);
        }
        
    } catch (error) {
        console.error('Error loading and displaying cases:', error);
        showErrorState();
    }
}

function showLoadingState() {
    const currentView = getCurrentView();
    let containerId = 'internal-cases-list'; // default
    
    if (currentView === 'external-dashboard-view') {
        containerId = 'external-cases-list';
    } else if (currentView === 'my-assigned-cases-view') {
        containerId = 'assigned-cases-list';
    } else if (currentView === 'internal-dashboard-view') {
        containerId = 'internal-cases-list';
    }
    
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p>Loading cases...</p>
            </div>
        `;
    }
}

function showEmptyState() {
    const currentView = getCurrentView();
    let containerId = 'internal-cases-list'; // default
    
    if (currentView === 'external-dashboard-view') {
        containerId = 'external-cases-list';
    } else if (currentView === 'my-assigned-cases-view') {
        containerId = 'assigned-cases-list';
    } else if (currentView === 'internal-dashboard-view') {
        containerId = 'internal-cases-list';
    }
    
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="text-center py-12 text-gray-500">
                <div class="mb-4">
                    <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                </div>
                <p class="text-lg font-medium">No cases available</p>
                <p class="text-sm">Data will appear here once cases are added to the system.</p>
            </div>
        `;
    }
}

function showErrorState() {
    const currentView = getCurrentView();
    let containerId = 'internal-cases-list'; // default
    
    if (currentView === 'external-dashboard-view') {
        containerId = 'external-cases-list';
    } else if (currentView === 'my-assigned-cases-view') {
        containerId = 'assigned-cases-list';
    } else if (currentView === 'internal-dashboard-view') {
        containerId = 'internal-cases-list';
    }
    
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="text-center py-12 text-red-500">
                <div class="mb-4">
                    <svg class="w-16 h-16 mx-auto text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                </div>
                <p class="text-lg font-medium">Error loading cases</p>
                <p class="text-sm">Please refresh the page to try again.</p>
            </div>
        `;
    }
}

// Update case count displays
function updateCaseCount(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = count;
    }
}

function updateExternalCaseCounts(cases, userEmail) {
    console.log('Updating external case counts for user:', userEmail);
    console.log('Total cases:', cases.length);
    
    const availableCases = cases.filter(c => 
        (c.status === 'submitted' || c.status === 'in_review') &&
        (!c.assignedTo || c.assignedTo !== userEmail)
    ).length;
    
    const assignedCases = cases.filter(c => c.assignedTo === userEmail).length;
    
    console.log('Available cases:', availableCases);
    console.log('Assigned cases:', assignedCases);
    
    // Update stat cards instead of tab counters
    updateCaseCount('available-cases', availableCases);
    updateCaseCount('my-assigned-cases', assignedCases);
}

// Toggle case assignment (assign/unassign)
async function toggleCaseAssignment() {
    try {
        const caseId = window.currentCaseId;
        if (!caseId) {
            console.error('No case ID available');
            showErrorMessage('Error: No case selected');
            return;
        }
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userEmail = currentUser.email?.split('@')[0] || 'external_001';
        
        // Get current case data
        const cases = window.APP_DATA?.cases || [];
        const caseData = cases.find(c => c.id === caseId);
        
        if (!caseData) {
            console.error('Case not found:', caseId);
            showErrorMessage('Error: Case not found');
            return;
        }
        
        console.log('Current case assignment:', caseData.assignedTo);
        console.log('Current user:', userEmail);
        
        // Determine if assigning or unassigning
        const isCurrentlyAssigned = caseData.assignedTo === userEmail;
        const newAssignedTo = isCurrentlyAssigned ? null : userEmail;
        const newStatus = isCurrentlyAssigned ? 'submitted' : 'in_review';
        
        // Update case in Firestore
        const db = window.db || window.firebaseDb;
        if (db) {
            const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            await updateDoc(doc(db, 'cases', caseId), {
                assignedTo: newAssignedTo,
                status: newStatus,
                updatedAt: new Date().toISOString()
            });
            
            console.log('Case assignment updated in Firestore');
        }
        
        // Update local data
        caseData.assignedTo = newAssignedTo;
        caseData.status = newStatus;
        caseData.updatedAt = new Date().toISOString();
        
        // Show success message
        const actionText = isCurrentlyAssigned ? 'unassigned from' : 'assigned to';
        showSuccessMessage(`Case ${actionText} you successfully!`);
        
        // Update the assignment button
        updateAssignmentButton(caseData, userEmail);
        
        // Show/hide feedback section
        updateFeedbackSection(caseData, userEmail);
        
        // Refresh the dashboard if we're going back
        setTimeout(() => {
            loadAndDisplayExternalCases('available');
        }, 100);
        
    } catch (error) {
        console.error('Error toggling case assignment:', error);
        showErrorMessage('Error updating case assignment. Please try again.');
    }
}

// Update the assignment button based on current state
function updateAssignmentButton(caseData, userEmail) {
    const button = document.getElementById('assign-to-me-btn');
    if (!button) return;
    
    const isAssigned = caseData.assignedTo === userEmail;
    
    if (isAssigned) {
        button.textContent = 'Unassign from Me';
        button.className = 'btn btn-secondary px-8';
    } else {
        button.textContent = 'Assign Case to Myself';
        button.className = 'btn btn-primary px-8';
    }
}

// Update feedback section visibility
function updateFeedbackSection(caseData, userEmail) {
    const feedbackSection = document.getElementById('assignment-feedback-section');
    if (!feedbackSection) return;
    
    const isAssigned = caseData.assignedTo === userEmail;
    
    if (isAssigned) {
        feedbackSection.classList.remove('hidden');
    } else {
        feedbackSection.classList.add('hidden');
    }
}

// Show case details with specific case data
function showCaseDetails(caseId) {
    console.log('Showing case details for case ID:', caseId);
    
    // Ensure we have app data
    if (!window.APP_DATA || !window.APP_DATA.cases) {
        console.error('No app data available');
        showErrorMessage('Case data not loaded. Please refresh the page.');
        return;
    }
    
    // Find the case in our data
    const cases = window.APP_DATA.cases;
    const caseData = cases.find(c => c.id === caseId);
    
    if (!caseData) {
        console.error('Case not found with ID:', caseId);
        console.log('Available cases:', cases.map(c => ({ id: c.id, title: c.title })));
        showErrorMessage('Case not found');
        return;
    }
    
    console.log('Found case data:', caseData);
    
    // Store the current case for the detail view
    window.currentCaseData = caseData;
    
    const userType = localStorage.getItem('userType');
    
    if (userType === 'external') {
        // Load case data into assignment view
        loadCaseIntoAssignmentView(caseData);
        showView('case-assignment-view');
    } else {
        // Load case data into detail view
        loadCaseIntoDetailView(caseData);
        showView('case-detail-view');
    }
}

// Load case data into detail view for internal doctors
function loadCaseIntoDetailView(caseData) {
    console.log('Loading case into detail view:', caseData);
    
    // Update case detail elements with correct IDs
    const elements = {
        'detail-case-title': caseData.title,
        'detail-case-description': caseData.description,
        'detail-case-symptoms': caseData.symptoms || 'Not specified',
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
            console.log(`Updated ${id} with:`, value);
        } else {
            console.warn(`Element not found: ${id}`);
        }
    });
    
    // Update tags if element exists
    const tagsElement = document.getElementById('detail-case-tags');
    if (tagsElement && caseData.tags && caseData.tags.length > 0) {
        tagsElement.innerHTML = caseData.tags.map(tag => 
            `<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${tag}</span>`
        ).join(' ');
        console.log('Updated tags:', caseData.tags);
    } else if (tagsElement) {
        tagsElement.innerHTML = '<span class="text-gray-500 text-sm">No tags</span>';
    }
}

// Load case data into assignment view for external doctors
function loadCaseIntoAssignmentView(caseData) {
    console.log('Loading case into assignment view:', caseData);
    
    // Store current case ID for assignment functions
    window.currentCaseId = caseData.id;
    
    // Update assignment view elements
    const elements = {
        'assign-case-title': caseData.title,
        'assign-case-description': caseData.description,
        'assign-case-symptoms': caseData.symptoms || 'Not specified',
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'TEXTAREA') {
                element.value = value;
            } else {
                element.textContent = value;
            }
            console.log(`Updated ${id} with:`, value);
        } else {
            console.warn(`Element not found: ${id}`);
        }
    });
    
    // Update tags/specialty if element exists
    const assignTagsElement = document.getElementById('assign-case-tags');
    if (assignTagsElement) {
        if (caseData.specialty) {
            assignTagsElement.innerHTML = `<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">${caseData.specialty}</span>`;
        } else if (caseData.tags && caseData.tags.length > 0) {
            assignTagsElement.innerHTML = caseData.tags.map(tag => 
                `<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">${tag}</span>`
            ).join(' ');
        } else {
            assignTagsElement.innerHTML = '<span class="text-gray-500 text-sm">No specialty specified</span>';
        }
        console.log('Updated assignment tags/specialty');
    }
    
    // Update assignment button and feedback section based on current state
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const userEmail = currentUser.email?.split('@')[0] || 'external_001';
    updateAssignmentButton(caseData, userEmail);
    updateFeedbackSection(caseData, userEmail);
}

// Submit expert review/feedback
async function submitExpertReview(status = 'final') {
    try {
        const caseId = window.currentCaseId;
        if (!caseId) {
            console.error('No case ID available');
            showErrorMessage('Error: No case selected');
            return;
        }
        
        const form = document.getElementById('expert-review-form');
        if (!form) {
            console.error('Expert review form not found');
            return;
        }
        
        const formData = new FormData(form);
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const reviewerEmail = currentUser.email?.split('@')[0] || 'external_001';
        const reviewerName = currentUser.name || 'External Doctor';
        
        // Create review object
        const review = {
            id: Date.now().toString(),
            caseId: caseId,
            reviewerEmail: reviewerEmail,
            reviewerName: reviewerName,
            diagnosis: formData.get('diagnosis'),
            additionalTests: formData.get('tests'),
            followUp: formData.get('followup'),
            urgency: formData.get('urgency'),
            confidence: formData.get('confidence'),
            status: status, // 'draft' or 'final'
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // Handle specialty reassignment
        const newSpecialty = formData.get('new_specialty');
        let specialtyChanged = false;
        
        if (newSpecialty && newSpecialty.trim()) {
            // Get current case data
            const cases = window.APP_DATA?.cases || [];
            const caseData = cases.find(c => c.id === caseId);
            
            if (caseData) {
                const currentSpecialty = caseData.specialty || (caseData.tags && caseData.tags[0]) || 'general';
                
                if (newSpecialty !== currentSpecialty) {
                    specialtyChanged = true;
                    
                    // Update case specialty in Firestore
                    const db = window.db || window.firebaseDb;
                    if (db) {
                        const { doc, updateDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                        
                        await updateDoc(doc(db, 'cases', caseId), {
                            specialty: newSpecialty,
                            specialtyChangedBy: reviewerEmail,
                            specialtyChangedAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        });
                        
                        console.log('Case specialty updated:', newSpecialty);
                    }
                    
                    // Update local data
                    caseData.specialty = newSpecialty;
                    caseData.specialtyChangedBy = reviewerEmail;
                    caseData.specialtyChangedAt = new Date().toISOString();
                    caseData.updatedAt = new Date().toISOString();
                    
                    // Add to review
                    review.specialtyReassignment = {
                        from: currentSpecialty,
                        to: newSpecialty,
                        changedAt: new Date().toISOString()
                    };
                }
            }
        }
        
        // Save review to Firestore
        const db = window.db || window.firebaseDb;
        if (db) {
            const { collection, addDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
            
            await addDoc(collection(db, 'reviews'), review);
            console.log('Review saved to Firestore');
        }
        
        // Add to local data
        if (!window.APP_DATA) window.APP_DATA = {};
        if (!window.APP_DATA.reviews) window.APP_DATA.reviews = [];
        window.APP_DATA.reviews.push(review);
        
        // Show success message
        const statusText = status === 'draft' ? 'saved as draft' : 'submitted successfully';
        let message = `Expert review ${statusText}!`;
        if (specialtyChanged) {
            message += ` Case specialty updated to ${newSpecialty}.`;
        }
        showSuccessMessage(message);
        
        // Clear form if final submission
        if (status === 'final') {
            form.reset();
            
            // Go back to assigned cases
            setTimeout(() => {
                showView('external-dashboard-view');
                setTimeout(() => { 
                    document.getElementById('my-assigned-tab')?.click(); 
                }, 200);
            }, 1000);
        }
        
    } catch (error) {
        console.error('Error submitting expert review:', error);
        showErrorMessage('Error submitting review. Please try again.');
    }
}

// Load case data into review view for providing feedback
function loadCaseIntoReviewView(caseData) {
    console.log('Loading case into review view:', caseData);
    
    if (!caseData) {
        console.error('No case data provided to review view');
        return;
    }
    
    // Store current case ID for review functions
    window.currentCaseId = caseData.id;
    
    // Update review view elements
    const elements = {
        'review-case-title': caseData.title,
        'review-case-description': caseData.description,
        'review-case-symptoms': caseData.symptoms || 'Not specified',
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            if (element.tagName === 'TEXTAREA') {
                element.value = value;
            } else {
                element.textContent = value;
            }
            console.log(`Updated ${id} with:`, value);
        } else {
            console.warn(`Element not found: ${id}`);
        }
    });
    
    // Update tags/specialty if element exists
    const reviewTagsElement = document.getElementById('review-case-tags');
    if (reviewTagsElement) {
        if (caseData.specialty) {
            reviewTagsElement.innerHTML = `<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">${caseData.specialty}</span>`;
        } else if (caseData.tags && caseData.tags.length > 0) {
            reviewTagsElement.innerHTML = caseData.tags.map(tag => 
                `<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">${tag}</span>`
            ).join(' ');
        } else {
            reviewTagsElement.innerHTML = '<span class="text-gray-500 text-sm">No specialty specified</span>';
        }
    }
    
    // Update current specialty for reassignment
    const currentSpecialtyElement = document.getElementById('current-specialty');
    if (currentSpecialtyElement) {
        const currentSpecialty = caseData.specialty || (caseData.tags && caseData.tags[0]) || 'General Medicine';
        currentSpecialtyElement.textContent = currentSpecialty;
    }
}

// Delete case with confirmation
async function deleteCase(caseId) {
    try {
        console.log('Delete case requested for:', caseId);
        
        // Find the case
        const cases = window.APP_DATA?.cases || [];
        const caseData = cases.find(c => c.id === caseId);
        
        if (!caseData) {
            showErrorMessage('Case not found');
            return;
        }
        
        // Check if user can delete this case
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userEmail = currentUser.email?.split('@')[0] || 'internal_001';
        const userType = localStorage.getItem('userType');
        
        if (userType !== 'internal' || caseData.createdBy !== userEmail) {
            showErrorMessage('You can only delete your own cases');
            return;
        }
        
        if (caseData.status !== 'draft' && caseData.status !== 'submitted') {
            showErrorMessage('You can only delete draft or submitted cases');
            return;
        }
        
        // Show custom confirmation dialog
        const confirmed = await showConfirmDialog(
            'Delete Case',
            `Are you sure you want to delete "${caseData.title}"? This action cannot be undone.`,
            'Delete',
            'Cancel'
        );
        
        if (!confirmed) {
            console.log('Case deletion cancelled');
            return;
        }
        
        console.log('Deleting case from Firestore:', caseId);
        
        // Delete from Firestore
        const db = window.db || window.firebaseDb;
        if (db) {
            try {
                const { doc, deleteDoc } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
                await deleteDoc(doc(db, 'cases', caseId));
                console.log('Case deleted from Firestore successfully');
            } catch (firestoreError) {
                console.error('Firestore delete error:', firestoreError);
                showErrorMessage('Error deleting from database');
                return;
            }
        }
        
        // Remove from local data
        if (window.APP_DATA && window.APP_DATA.cases) {
            window.APP_DATA.cases = window.APP_DATA.cases.filter(c => c.id !== caseId);
        }
        
        // Show success message
        showSuccessMessage('Case deleted successfully');
        
        // Immediately reload cases to update the UI
        await loadAndDisplayCases();
        
    } catch (error) {
        console.error('Error deleting case:', error);
        showErrorMessage('Error deleting case. Please try again.');
    }
}

// Custom confirmation dialog
function showConfirmDialog(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
    return new Promise((resolve) => {
        // Remove any existing dialog
        const existing = document.getElementById('confirm-dialog');
        if (existing) existing.remove();
        
        // Create dialog overlay
        const overlay = document.createElement('div');
        overlay.id = 'confirm-dialog';
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        
        // Create dialog content
        overlay.innerHTML = `
            <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div class="p-6">
                    <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0">
                            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                        </div>
                        <div class="flex-1">
                            <h3 class="text-lg font-medium text-gray-900 mb-2">${title}</h3>
                            <p class="text-gray-600">${message}</p>
                        </div>
                    </div>
                </div>
                <div class="px-6 py-3 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
                    <button id="confirm-cancel" class="btn btn-secondary">${cancelText}</button>
                    <button id="confirm-delete" class="btn" style="background-color: #dc2626; color: white;">${confirmText}</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Handle button clicks
        document.getElementById('confirm-cancel').addEventListener('click', () => {
            overlay.remove();
            resolve(false);
        });
        
        document.getElementById('confirm-delete').addEventListener('click', () => {
            overlay.remove();
            resolve(true);
        });
        
        // Handle escape key and overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        });
        
        document.addEventListener('keydown', function escapeHandler(e) {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escapeHandler);
                resolve(false);
            }
        });
    });
}

// Export functions for global use
window.showView = showView;
// populateMockData function removed
window.loadAndDisplayCases = loadAndDisplayCases;
window.loadAndDisplayExternalCases = loadAndDisplayExternalCases;
window.renderCases = renderCases;
window.showCaseDetails = showCaseDetails;
window.deleteCase = deleteCase; 