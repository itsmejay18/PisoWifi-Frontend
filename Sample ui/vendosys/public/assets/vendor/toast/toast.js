class ToastNotification {
    constructor() {
        // Create container if it doesn't exist
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
        this.container = document.querySelector('.toast-container');
    }

    show(title, message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type} br-1`;
        
        toast.innerHTML = `
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close">&times;</button>
        `;

        this.container.appendChild(toast);

        // Auto remove
        const autoClose = setTimeout(() => this.remove(toast), duration);

        // Manual remove
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(autoClose);
            this.remove(toast);
        });
    }

    remove(toast) {
        toast.classList.add('removing');
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }
}

// Initialize the Toast System
const toast = new ToastNotification();