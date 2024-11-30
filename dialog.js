export class DialogManager {
  constructor() {
    this.init();
  }

  init() {
    const style = document.createElement('style');
    style.textContent = `
      .dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(15, 23, 42, 0.3);
        backdrop-filter: blur(4px);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .dialog-overlay.visible {
        opacity: 1;
      }

      .dialog-container {
        background: #ffffff;
        border-radius: 12px;
        padding: 28px;
        max-width: 440px;
        width: 90%;
        transform: scale(0.95) translateY(-20px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
        border: 1px solid rgba(226, 232, 240, 0.8);
      }

      .dialog-overlay.visible .dialog-container {
        transform: scale(1) translateY(0);
      }

      .dialog-title {
        font-size: 1.25rem;
        font-weight: 600;
        margin: 0 0 16px 0;
        color: #1e293b;
        letter-spacing: -0.025em;
      }

      .dialog-message {
        margin: 0 0 28px 0;
        color: #475569;
        line-height: 1.6;
        font-size: 0.95rem;
      }

      .dialog-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
      }

      .dialog-btn {
        padding: 10px 20px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
        font-size: 0.925rem;
        font-weight: 500;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
      }

      .dialog-btn::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 120%;
        height: 120%;
        background: rgba(255, 255, 255, 0.2);
        transform: translate(-50%, -50%) scale(0);
        border-radius: 50%;
        transition: transform 0.4s ease-out;
      }

      .dialog-btn:active::after {
        transform: translate(-50%, -50%) scale(1);
      }

      .dialog-btn:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
      }

      .dialog-btn-confirm {
        background-color: #ef4444;
        color: white;
      }

      .dialog-btn-confirm:hover {
        background-color: #dc2626;
        transform: translateY(-1px);
      }

      .dialog-btn-cancel {
        background-color: #f1f5f9;
        color: #475569;
      }

      .dialog-btn-cancel:hover {
        background-color: #e2e8f0;
        transform: translateY(-1px);
      }

      @media (max-width: 640px) {
        .dialog-container {
          padding: 24px;
          width: 95%;
        }

        .dialog-buttons {
          flex-direction: column-reverse;
        }

        .dialog-btn {
          width: 100%;
          padding: 12px 20px;
        }
      }
    `;
    document.head.appendChild(style);
  }

  confirm(options = {}) {
    const {
      title = 'Confirm',
      message = 'Are you sure?',
      confirmText = 'Confirm',
      cancelText = 'Cancel',
      type = 'danger'
    } = options;

    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'dialog-overlay';
      
      overlay.innerHTML = `
        <div class="dialog-container" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
          <h3 class="dialog-title" id="dialog-title">${title}</h3>
          <p class="dialog-message">${message}</p>
          <div class="dialog-buttons">
            <button class="dialog-btn dialog-btn-cancel" type="button">${cancelText}</button>
            <button class="dialog-btn dialog-btn-confirm" type="button">${confirmText}</button>
          </div>
        </div>
      `;

      const handleKeydown = (event) => {
        if (event.key === 'Escape') {
          closeDialog(false);
        }
      };

      const closeDialog = (result) => {
        overlay.classList.remove('visible');
        document.removeEventListener('keydown', handleKeydown);
        setTimeout(() => {
          overlay.remove();
          resolve(result);
        }, 300);
      };

      overlay.querySelector('.dialog-btn-confirm').addEventListener('click', () => closeDialog(true));
      overlay.querySelector('.dialog-btn-cancel').addEventListener('click', () => closeDialog(false));
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          closeDialog(false);
        }
      });
      
      document.addEventListener('keydown', handleKeydown);
      document.body.appendChild(overlay);
      requestAnimationFrame(() => {
        overlay.classList.add('visible');
      });
    });
  }
}
