// Notification Service for browser notifications
const NotificationService = {
    // Audio for alarm sounds
    alarmAudio: null,
    
    // Current active alarms (including coin data and UI elements)
    activeAlarms: {},
    
    // Interval for checking active alarms
    alarmCheckInterval: null,
    
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
    
    // Initialize alarm system
    initAlarmSystem: () => {
        // Create audio element for alarm
        if (!NotificationService.alarmAudio) {
            NotificationService.alarmAudio = new Audio();
            
            // Use a high-pitched alarm sound
            NotificationService.alarmAudio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq3EuKm6q7vX6vYVTLCdErfH//b94PRkSJIDO/f/9rFQfBgUShabt+PvhorB6WCcYB36q+//yvGI7LyhKo/z/+rFELzgqT53j8fvtsG5VOSlMmPP//8F5QDYxWKLw/vDBdkU5M1af1+f1tXNeTT00YKDm7fO5fWBMOjNnot/l77d/Y1I+Mmak1d/wwYJjUkE2ZqG2zODGjnBZRT84Y5uywODNnH1jU0U9ZZ/CzdfAlHpiVUdBZZ7M2OC+iXRdT0lEYJnM3OW8hm9cUEpHXJK/zt/Gk3tjVkxLWYrbx8/OmYBpXFJQWoCrtMbjrIdxZFhVXHyepbXN47mTfm1jX2ZzkJ6xweG8jntsZmZsdo2aqb3fvY+AcWppb3KFjJOhvNjGlIZ4cHF1eICLkZunxdy/jX93dHd8gIaNlJ+24MSplId/fH+Ah4qRmqGu0tajmI2FgIGDhomNlZ+lvtnAlY6JhoSEhoiLkZmfq9XhrZSSjYeGhYaJjpScorHT1KufmZGLiIaHiY2SmqCn06GompmUjouJiIqNkpieoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgo=';
            NotificationService.alarmAudio.loop = true;
        }
        
        // Start the interval to check for active alarms from the backend
        if (!NotificationService.alarmCheckInterval) {
            NotificationService.alarmCheckInterval = setInterval(
                NotificationService.checkForActiveAlarms, 
                5000  // Check every 5 seconds
            );
        }
    },
    
    // Check for any active alarms on the backend
    checkForActiveAlarms: async () => {
        try {
            const response = await fetch('/api/alarms');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const activeAlarms = await response.json();
            
            if (activeAlarms.length > 0) {
                // Sound the alarm for new alerts
                activeAlarms.forEach(alarm => {
                    if (!NotificationService.activeAlarms[alarm.id]) {
                        // This is a new alarm that we haven't seen before
                        NotificationService.startAlarm(alarm);
                    }
                });
            } else {
                // No active alarms, stop any currently playing alarm
                NotificationService.stopAllAlarms();
            }
        } catch (error) {
            console.error('Error checking for active alarms:', error);
        }
    },
    
    // Start the alarm for a specific alert
    startAlarm: (alert) => {
        // Begin playing the alarm sound
        if (NotificationService.alarmAudio && !NotificationService.alarmAudio.paused) {
            // Already playing for another alarm
            console.log('Alarm already playing, adding notification for new alert');
        } else {
            try {
                // Start the audio alarm
                NotificationService.alarmAudio.play()
                    .then(() => console.log('Alarm started'))
                    .catch(error => {
                        console.error('Error playing alarm sound:', error);
                        // On iOS, audio can only be played after user interaction
                        alert('Tap the screen to enable alarm sounds');
                    });
            } catch (e) {
                console.error('Error playing alarm:', e);
            }
        }
        
        // Send a notification
        const title = 'Cryptocurrency Price Alert!';
        const message = `${alert.coinName || alert.symbol} has reached your target price of $${alert.targetPrice}`;
        
        NotificationService.showAlarmNotification(alert.id, title, message, alert);
        
        // Keep track of this active alarm
        NotificationService.activeAlarms[alert.id] = {
            alert,
            timestamp: new Date()
        };
    },
    
    // Show a persistent alarm notification that includes a stop button
    showAlarmNotification: (id, title, message, alertData) => {
        // First send a normal browser notification if possible
        if (NotificationService.isSupported() && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: message,
                icon: 'https://cdn-icons-png.flaticon.com/512/2809/2809756.png', // Default crypto icon
                requireInteraction: true // Make notification persistent until user dismisses it
            });
            
            notification.onclick = () => {
                // Focus on our app when user clicks the notification
                window.focus();
                notification.close();
            };
        }
        
        // Also create an in-app persistent notification
        const alarmElement = document.createElement('div');
        alarmElement.className = 'alarm-notification';
        alarmElement.innerHTML = `
            <div class="alarm-content">
                <div class="alarm-title">${title}</div>
                <div class="alarm-message">${message}</div>
                <div class="current-price" id="current-price-${id}"></div>
                <button class="alarm-stop-btn" id="stop-alarm-${id}">Stop Alarm</button>
            </div>
        `;
        
        // Add custom styles for the alarm notification
        const style = document.createElement('style');
        style.textContent = `
            .alarm-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 90%;
                background-color: #ff3b30;
                color: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 1000;
                animation: pulse 1.5s infinite;
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            
            .alarm-title {
                font-weight: bold;
                font-size: 18px;
                margin-bottom: 8px;
            }
            
            .alarm-message {
                margin-bottom: 12px;
            }
            
            .current-price {
                margin-bottom: 12px;
                font-weight: bold;
            }
            
            .alarm-stop-btn {
                background-color: white;
                color: #ff3b30;
                border: none;
                padding: 8px 16px;
                border-radius: 4px;
                font-weight: bold;
                cursor: pointer;
                width: 100%;
            }
            
            .alarm-stop-btn:hover {
                background-color: #f9f9f9;
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(alarmElement);
        
        // Add a click event listener to the stop button
        const stopButton = document.getElementById(`stop-alarm-${id}`);
        if (stopButton) {
            stopButton.addEventListener('click', async () => {
                await NotificationService.stopAlarm(id, alarmElement);
            });
        }
        
        // Update the current price every 10 seconds
        const updatePrice = async () => {
            try {
                // Fetch the latest price for this coin
                const response = await fetch(`/api/coins/price/${alertData.symbol}`);
                if (response.ok) {
                    const data = await response.json();
                    const priceElement = document.getElementById(`current-price-${id}`);
                    if (priceElement && data.price) {
                        priceElement.textContent = `Current price: $${data.price}`;
                    }
                }
            } catch (error) {
                console.error('Error updating price:', error);
            }
        };
        
        // Update price immediately and then every 10 seconds
        updatePrice();
        const priceUpdateInterval = setInterval(updatePrice, 10000);
        
        // Store the interval ID so we can clear it when stopping the alarm
        NotificationService.activeAlarms[id].priceUpdateInterval = priceUpdateInterval;
        NotificationService.activeAlarms[id].alarmElement = alarmElement;
    },
    
    // Stop a specific alarm
    stopAlarm: async (id, alarmElement) => {
        try {
            // Call the backend to mark this alarm as stopped
            const response = await fetch(`/api/alarms/${id}/stop`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Remove the alarm UI element
            if (alarmElement && document.body.contains(alarmElement)) {
                document.body.removeChild(alarmElement);
            } else if (NotificationService.activeAlarms[id] && NotificationService.activeAlarms[id].alarmElement) {
                // Remove by reference stored in activeAlarms
                const element = NotificationService.activeAlarms[id].alarmElement;
                if (document.body.contains(element)) {
                    document.body.removeChild(element);
                }
            }
            
            // Clear the price update interval
            if (NotificationService.activeAlarms[id] && NotificationService.activeAlarms[id].priceUpdateInterval) {
                clearInterval(NotificationService.activeAlarms[id].priceUpdateInterval);
            }
            
            // Remove from active alarms
            delete NotificationService.activeAlarms[id];
            
            // If no more active alarms, stop the audio
            if (Object.keys(NotificationService.activeAlarms).length === 0) {
                NotificationService.stopAllAlarms();
            }
            
            return true;
        } catch (error) {
            console.error('Error stopping alarm:', error);
            return false;
        }
    },
    
    // Stop all alarms
    stopAllAlarms: () => {
        // Stop the audio
        if (NotificationService.alarmAudio && !NotificationService.alarmAudio.paused) {
            NotificationService.alarmAudio.pause();
            NotificationService.alarmAudio.currentTime = 0;
        }
        
        // Clean up UI elements and intervals for all active alarms
        Object.keys(NotificationService.activeAlarms).forEach(id => {
            const alarm = NotificationService.activeAlarms[id];
            
            // Clear interval
            if (alarm.priceUpdateInterval) {
                clearInterval(alarm.priceUpdateInterval);
            }
            
            // Remove UI element
            if (alarm.alarmElement && document.body.contains(alarm.alarmElement)) {
                document.body.removeChild(alarm.alarmElement);
            }
        });
        
        // Clear the active alarms object
        NotificationService.activeAlarms = {};
    },
    
    // Standard notification method (non-alarm)
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
