// API Config
const API_URL = '/api';

// State
let currentUser = null;
let token = localStorage.getItem('token');
let currentTab = 'dashboard';
let isRegisterMode = false;

// Elements
const authScreen = document.getElementById('auth-screen');
const mainScreen = document.getElementById('main-screen');
const authForm = document.getElementById('auth-form');
const authToggleText = document.getElementById('auth-toggle-text');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const authToggleLink = document.getElementById('auth-toggle-link');
const nameField = document.getElementById('name-field');
const roleField = document.getElementById('role-field');
const authError = document.getElementById('auth-error');

const userNameDisplay = document.getElementById('user-name');
const userRoleBadge = document.getElementById('user-role');
const userAvatar = document.getElementById('user-avatar');

const recordModal = document.getElementById('record-modal');
const recordForm = document.getElementById('record-form');

// Initialization
document.addEventListener('DOMContentLoaded', async () => {
    if (token) {
        await fetchUserInfo();
    } else {
        showAuth();
    }
});

// Auth Functions
function toggleAuthMode() {
    isRegisterMode = !isRegisterMode;
    if (isRegisterMode) {
        authToggleText.textContent = "Create a new account";
        authSubmitBtn.textContent = "Register";
        authToggleLink.textContent = "Already have an account? Login";
        nameField.style.display = "block";
        roleField.style.display = "block";
    } else {
        authToggleText.textContent = "Sign in to your account";
        authSubmitBtn.textContent = "Login";
        authToggleLink.textContent = "Don't have an account? Register";
        nameField.style.display = "none";
        roleField.style.display = "none";
    }
}

authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    authError.textContent = '';
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const role = document.getElementById('role').value;

    const endpoint = isRegisterMode ? '/auth/register' : '/auth/login';
    const payload = isRegisterMode ? { name, email, password, role } : { email, password };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.success) {
            token = data.token;
            localStorage.setItem('token', token);
            await fetchUserInfo();
        } else {
            authError.textContent = data.message || 'Authentication failed';
        }
    } catch (err) {
        authError.textContent = 'Server connection error';
        console.error(err);
    }
});

async function fetchUserInfo() {
    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            currentUser = data.data;
            updateUIForUser();
            showMain();
            fetchDashboard();
            fetchRecords();
        } else {
            logout();
        }
    } catch (err) {
        logout();
    }
}

function updateUIForUser() {
    userNameDisplay.textContent = currentUser.name;
    userRoleBadge.textContent = currentUser.role;
    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();

    // Toggle Admin views
    const adminElements = document.querySelectorAll('.admin-only');
    adminElements.forEach(el => {
        if (currentUser.role === 'Admin') {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });

    // Handle Analyst view specifically if needed
    const analystElements = document.querySelectorAll('.analyst-only');
    analystElements.forEach(el => {
        if (currentUser.role === 'Analyst' || currentUser.role === 'Admin') {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

function logout() {
    token = null;
    currentUser = null;
    localStorage.removeItem('token');
    showAuth();
}

function showAuth() {
    authScreen.classList.remove('hidden');
    mainScreen.classList.add('hidden');
}

function showMain() {
    authScreen.classList.add('hidden');
    mainScreen.classList.remove('hidden');
}

// Navigation
function showTab(tab) {
    currentTab = tab;
    document.querySelectorAll('.tab-content').forEach(t => t.classList.add('hidden'));
    document.getElementById(`tab-${tab}`).classList.remove('hidden');

    document.querySelectorAll('.nav-links li').forEach(l => l.classList.remove('active'));
    document.getElementById(`nav-${tab}`).classList.add('active');

    if (tab === 'dashboard') fetchDashboard();
    if (tab === 'records') fetchRecords();
}

// Dashboard Functions
async function fetchDashboard() {
    try {
        const response = await fetch(`${API_URL}/dashboard/analytics`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            const result = data.data;
            document.getElementById('total-income').textContent = `$${result.totals.totalIncome.toLocaleString()}`;
            document.getElementById('total-expenses').textContent = `$${result.totals.totalExpenses.toLocaleString()}`;
            document.getElementById('net-balance').textContent = `$${result.totals.netBalance.toLocaleString()}`;

            const categoryList = document.getElementById('category-list');
            categoryList.innerHTML = result.currentMonthCategoryTotals.map(cat => `
                <div class="list-item">
                    <span>${cat.category} (${cat.type})</span>
                    <span style="font-weight:600; color:${cat.type === 'Income' ? 'var(--success)' : 'var(--danger)'}">$${cat.total.toLocaleString()}</span>
                </div>
            `).join('');
        }
    } catch (err) {
        console.error('Error fetching dashboard', err);
    }
}

// Records Functions
async function fetchRecords() {
    try {
        const type = document.getElementById('filter-type').value;
        const category = document.getElementById('filter-category').value;
        
        let url = `${API_URL}/records?`;
        if (type) url += `type=${type}&`;
        if (category) url += `category=${category}&`;

        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
            renderRecords(data.data);
        }
    } catch (err) {
        console.error('Error fetching records', err);
    }
}

function renderRecords(records) {
    const tbody = document.querySelector('#records-table tbody');
    tbody.innerHTML = records.map(rec => `
        <tr>
            <td>${new Date(rec.date).toLocaleDateString()}</td>
            <td><span class="badge" style="background:${rec.type === 'Income' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color:${rec.type === 'Income' ? 'var(--success)' : 'var(--danger)'}">${rec.type}</span></td>
            <td>${rec.category}</td>
            <td>${rec.notes || '-'}</td>
            <td style="font-weight:600">$${rec.amount.toLocaleString()}</td>
            <td class="admin-only ${currentUser.role !== 'Admin' ? 'hidden' : ''}">
                <div class="action-btns">
                    <button onclick="editRecord('${rec._id}')" class="btn-icon">Edit</button>
                    <button onclick="deleteRecord('${rec._id}')" class="btn-icon delete">Delete</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// CRUD
function openModal(id = null) {
    recordModal.classList.remove('hidden');
    if (id) {
        document.getElementById('modal-title').textContent = 'Edit Record';
        document.getElementById('save-btn').textContent = 'Update';
    } else {
        document.getElementById('modal-title').textContent = 'Add Record';
        document.getElementById('save-btn').textContent = 'Save';
        recordForm.reset();
        document.getElementById('edit-id').value = '';
    }
}

function closeModal() {
    recordModal.classList.add('hidden');
}

recordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const payload = {
        type: document.getElementById('rec-type').value,
        category: document.getElementById('rec-category').value,
        amount: parseFloat(document.getElementById('rec-amount').value),
        date: document.getElementById('rec-date').value,
        notes: document.getElementById('rec-notes').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/records/${id}` : `${API_URL}/records`;

    try {
        const response = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.success) {
            closeModal();
            fetchRecords();
            fetchDashboard();
        } else {
            alert(data.message || 'Error saving record');
        }
    } catch (err) {
        console.error(err);
    }
});

async function editRecord(id) {
    try {
        const response = await fetch(`${API_URL}/records/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            const rec = data.data;
            document.getElementById('edit-id').value = rec._id;
            document.getElementById('rec-type').value = rec.type;
            document.getElementById('rec-category').value = rec.category;
            document.getElementById('rec-amount').value = rec.amount;
            document.getElementById('rec-date').value = new Date(rec.date).toISOString().split('T')[0];
            document.getElementById('rec-notes').value = rec.notes || '';
            openModal(id);
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteRecord(id) {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
        const response = await fetch(`${API_URL}/records/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            fetchRecords();
            fetchDashboard();
        }
    } catch (err) {
        console.error(err);
    }
}
