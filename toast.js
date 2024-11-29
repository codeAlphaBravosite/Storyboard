export class ToastManager {
  constructor() {
    this.init();
  }

  init() {
    // Create toast container
    const container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      #toastContainer {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 1000;
      }

      .toast {
        background: white;
        border-radius: 8px;
        padding: 16px 24px;
        margin: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
        transition: all 0.3s ease-out;
      }

      .toast.hiding {
        opacity: 0;
        transform: translateX(100%);
      }

      .toast-success {
        border-left: 4px solid #4caf50;
      }

      .toast-error {
        border-left: 4px solid #f44336;
      }

      .toast-info {
        border-left: 4px solid #2196f3;
      }

      .toast-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
      }

      .toast-content {
        flex-grow: 1;
      }

      .toast-close {
        flex-shrink: 0;
        background: none;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 4px;
        font-size: 18px;
        opacity: 0.7;
      }

      .toast-close:hover {
        opacity: 1;
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
  }

  createToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Get icon based on type
    const icon = this.getIconSvg(type);

    toast.innerHTML = `
      ${icon}
      <div class="toast-content">${message}</div>
      <button class="toast-close">×</button>
    `;

    const container = document.getElementById('toastContainer');
    container.appendChild(toast);

    // Add click handler to close button
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', () => this.removeToast(toast));

    // Auto remove after 5 seconds
    setTimeout(() => this.removeToast(toast), 5000);

    return toast;
  }

  removeToast(toast) {
    toast.classList.add('hiding');
    setTimeout(() => toast.remove(), 300);
  }

  getIconSvg(type) {
    const icons = {
      success: `<svg class="toast-icon" viewBox="0 0 24 24" fill="#4caf50">
        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
      </svg>`,
      error: `<svg class="toast-icon" viewBox="0 0 24 24" fill="#f44336">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
      </svg>`,
      info: `<svg class="toast-icon" viewBox="0 0 24 24" fill="#2196f3">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
      </svg>`
    };
    return icons[type] || icons.info;
  }

  success(message) {
    return this.createToast(message, 'success');
  }

  error(message) {
    return this.createToast(message, 'error');
  }

  info(message) {
    return this.createToast(message, 'info');
  }
}
