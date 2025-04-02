// Notification Service for browser notifications
const NotificationService = {
    // Check if notifications are supported in the browser
    isSupported: () => {
        return 'Notification' in window;
    },
    
    // Request permission for notifications
    requestPermission: async () => {
        if (!NotificationService.isSupported()) {
            console.warn('Notifications are not supported in this browser');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            return true;
        }
        
        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            return permission === 'granted';
        }
        
        return false;
    },
    
    // Send a notification
    notify: (title, message) => {
        if (!NotificationService.isSupported()) {
            console.warn('Notifications are not supported in this browser');
            NotificationService.showFallbackNotification(title, message);
            return;
        }
        
        if (Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: message,
                icon: 'https://cdn-icons-png.flaticon.com/512/2809/2809756.png' // Default crypto icon
            });
            
            // Auto-close after 5 seconds
            setTimeout(() => {
                notification.close();
            }, 5000);
            
            // Also show an in-app notification for redundancy
            NotificationService.showFallbackNotification(title, message);
        } else {
            // Fallback to in-app notification if permissions not granted
            NotificationService.showFallbackNotification(title, message);
        }
    },
    
    // Show an in-app toast notification when browser notifications aren't available
    showFallbackNotification: (title, message) => {
        // Create a toast element
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="font-medium">${title}</div>
            <div class="text-sm">${message}</div>
        `;
        
        // Add to document
        document.body.appendChild(toast);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 3000);
    }
};
