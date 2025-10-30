// ==================== WEBSOCKET CLIENT ====================
// This file handles real-time connections for all dashboards

class WebSocketClient {
    constructor() {
        this.ws = null;
        this.reconnectInterval = 5000; // 5 seconds
        this.reconnectTimer = null;
        this.isIntentionalClose = false;
        this.messageHandlers = [];
    }

    connect(userId, username, role) {
        // Close existing connection
        if (this.ws) {
            this.isIntentionalClose = true;
            this.ws.close();
        }

        // Create WebSocket connection
        const wsUrl = `ws://127.0.0.1:8000/ws/${userId}?username=${encodeURIComponent(username)}&role=${role}`;

        console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);

        this.ws = new WebSocket(wsUrl);

        // Connection opened
        this.ws.onopen = () => {
            console.log('✅ WebSocket connected');
            this.isIntentionalClose = false;

            // Clear reconnect timer
            if (this.reconnectTimer) {
                clearTimeout(this.reconnectTimer);
                this.reconnectTimer = null;
            }

            // Show connection notification
            if (typeof showNotification === 'function') {
                showNotification('Connected to real-time updates', 'success');
            }
        };

        // Message received
        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('📨 WebSocket message:', data);

                // Call all registered handlers
                this.messageHandlers.forEach(handler => {
                    try {
                        handler(data);
                    } catch (error) {
                        console.error('❌ Message handler error:', error);
                    }
                });

            } catch (error) {
                console.error('❌ Failed to parse WebSocket message:', error);
            }
        };

        // Connection closed
        this.ws.onclose = (event) => {
            console.log('🔌 WebSocket disconnected', event);
            this.ws = null;

            // Attempt to reconnect (unless intentionally closed)
            if (!this.isIntentionalClose) {
                console.log(`🔄 Reconnecting in ${this.reconnectInterval / 1000} seconds...`);
                this.reconnectTimer = setTimeout(() => {
                    this.connect(userId, username, role);
                }, this.reconnectInterval);
            }
        };

        // Connection error
        this.ws.onerror = (error) => {
            console.error('❌ WebSocket error:', error);
        };
    }

    disconnect() {
        console.log('🔌 Closing WebSocket connection');
        this.isIntentionalClose = true;

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        } else {
            console.warn('⚠️ WebSocket not connected');
        }
    }

    onMessage(handler) {
        this.messageHandlers.push(handler);
    }

    removeMessageHandler(handler) {
        const index = this.messageHandlers.indexOf(handler);
        if (index > -1) {
            this.messageHandlers.splice(index, 1);
        }
    }
}

// Create global instance
window.wsClient = new WebSocketClient();

console.log('✅ WebSocket client loaded');
