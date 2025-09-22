class AdminPanel {
    constructor() {
        this.accessToken = null;
        this.users = [];
        this.filteredUsers = [];
        this.init();
    }

    init() {
        this.accessToken = localStorage.getItem('adminToken');
        this.bindEvents();
        
        if (this.accessToken) {
            this.showAdminPanel();
        }
    }

    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        
        // Admin panel buttons
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadUsers());
        
        // Filters
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('searchInput').addEventListener('input', () => this.applyFilters());
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        
        this.setLoading(loginBtn, true, 'Logging in...');
        this.hideError('loginError');
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.accessToken = data.accessToken;
                localStorage.setItem('adminToken', this.accessToken);
                this.showToast('Login successful!', 'success');
                this.showAdminPanel();
            } else {
                this.showError('loginError', data.error || 'Login failed');
            }
        } catch (error) {
            this.showError('loginError', 'Network error. Please try again.');
        } finally {
            this.setLoading(loginBtn, false, 'Login');
        }
    }

    async showAdminPanel() {
        document.getElementById('loginSection').classList.add('hidden');
        document.getElementById('adminPanel').classList.remove('hidden');
        await this.loadUsers();
    }

    async loadUsers() {
        this.showLoading(true);
        
        try {
            const response = await fetch('/api/admin/users', {
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.users = data.users;
                this.updateStats();
                this.applyFilters();
            } else if (response.status === 401) {
                this.logout();
            } else {
                this.showToast('Failed to load users', 'error');
            }
        } catch (error) {
            this.showToast('Network error while loading users', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        
        this.filteredUsers = this.users.filter(user => {
            const matchesStatus = statusFilter === 'all' || 
                (statusFilter === 'active' && user.isActive) || 
                (statusFilter === 'inactive' && !user.isActive);
                
            const matchesSearch = user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm);
                
            return matchesStatus && matchesSearch;
        });
        
        this.displayUsers();
    }

    displayUsers() {
        const tbody = document.getElementById('usersTableBody');
        const noUsers = document.getElementById('noUsers');
        const usersTable = document.getElementById('usersTable');
        
        if (this.filteredUsers.length === 0) {
            usersTable.classList.add('hidden');
            noUsers.classList.remove('hidden');
            return;
        }
        
        usersTable.classList.remove('hidden');
        noUsers.classList.add('hidden');
        tbody.innerHTML = '';
        
        this.filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <strong>${this.escapeHtml(user.name)}</strong>
                </td>
                <td>${this.escapeHtml(user.email)}</td>
                <td>${this.formatDate(user.createdAt)}</td>
                <td>
                    <span class="status-${user.isActive ? 'active' : 'inactive'}">
                        ${user.isActive ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>
                    <button class="toggle-btn ${user.isActive ? 'deactivate' : 'activate'}" 
                            onclick="adminPanel.toggleUser('${user._id}')"
                            data-user-id="${user._id}">
                        ${user.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async toggleUser(userId) {
        const button = document.querySelector(`[data-user-id="${userId}"]`);
        const user = this.users.find(u => u._id === userId);
        
        if (!user || !button) return;
        
        const originalText = button.textContent;
        this.setLoading(button, true, 'Updating...');
        
        try {
            const response = await fetch(`/api/admin/users/${userId}/toggle`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.accessToken}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                this.showToast(data.message, 'success');
                await this.loadUsers();
            } else if (response.status === 401) {
                this.logout();
            } else {
                const data = await response.json();
                this.showToast(data.error || 'Failed to update user', 'error');
            }
        } catch (error) {
            this.showToast('Network error while updating user', 'error');
        } finally {
            this.setLoading(button, false, originalText);
        }
    }

    updateStats() {
        const total = this.users.length;
        const active = this.users.filter(u => u.isActive).length;
        const inactive = total - active;
        
        document.getElementById('totalUsers').textContent = total;
        document.getElementById('activeUsers').textContent = active;
        document.getElementById('inactiveUsers').textContent = inactive;
    }

    logout() {
        localStorage.removeItem('adminToken');
        this.accessToken = null;
        this.users = [];
        this.filteredUsers = [];
        
        document.getElementById('loginSection').classList.remove('hidden');
        document.getElementById('adminPanel').classList.add('hidden');
        
        // Reset form
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        this.hideError('loginError');
        
        this.showToast('Logged out successfully', 'success');
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const table = document.getElementById('usersTable');
        const noUsers = document.getElementById('noUsers');
        
        if (show) {
            spinner.classList.remove('hidden');
            table.classList.add('hidden');
            noUsers.classList.add('hidden');
        } else {
            spinner.classList.add('hidden');
        }
    }

    setLoading(button, loading, text) {
        button.disabled = loading;
        button.textContent = text;
        if (loading) {
            button.style.opacity = '0.7';
        } else {
            button.style.opacity = '1';
        }
    }

    showError(elementId, message) {
        const element = document.getElementById(elementId);
        element.textContent = message;
        element.classList.remove('hidden');
    }

    hideError(elementId) {
        const element = document.getElementById(elementId);
        element.classList.add('hidden');
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize admin panel
const adminPanel = new AdminPanel()