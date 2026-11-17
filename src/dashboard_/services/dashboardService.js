import { SOCKET_BASE_URL } from "../../config";
class DashboardService {
    constructor() {
        this.socket = null;
        this.listeners = [];

        this.connected = false;

        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 10;

        this.shouldReconnect = true;

        this.latestData = null;

        this.currentToken = null;
    }

    connect() {
        this.shouldReconnect = true;

        const token = localStorage.getItem("access");

        if (!token) {
            console.error("Dashboard: JWT Token not found.");
            return;
        }

        // If token/user changed, close old connection
        if (
            this.currentToken &&
            this.currentToken !== token
        ) {
            this.disconnect();
            this.latestData = null;
        }

        this.currentToken = token;

        if (
            this.socket &&
            (
                this.socket.readyState === WebSocket.OPEN ||
                this.socket.readyState === WebSocket.CONNECTING
            )
        ) {
            return;
        }

        const url =
            `${SOCKET_BASE_URL}/ws/dashboard/?token=${encodeURIComponent(token)}`;

        // console.log(
        //     "Connecting dashboard WebSocket:",
        //     url
        // );

        this.socket = new WebSocket(url);

        this.socket.onopen = () => {
            // console.log(
            //     "Dashboard WebSocket connected."
            // );

            this.connected = true;
            this.reconnectAttempts = 0;

            // Ask backend for current dashboard
            this.socket.send(
                JSON.stringify({
                    action: "get_summary"
                })
            );
        };

        this.socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log(
                    "========== DASHBOARD RAW API RESPONSE =========="
                );

                console.log(data);

                console.log(
                    "========== DASHBOARD SUMMARY =========="
                );

                console.log(data?.summary);

                console.log(
                    "========== DASHBOARD ROLE =========="
                );

                console.log(data?.role);
                // console.log(
                //     "Dashboard WebSocket data:",
                //     data
                // );

                this.latestData = data;

                this.listeners.forEach(
                    (listener, index) => {
                        try {
                            listener(data);
                        } catch (err) {
                            console.error(
                                `Dashboard listener #${index + 1} failed:`,
                                err
                            );
                        }
                    }
                );

            } catch (err) {
                console.error(
                    "Dashboard WebSocket parse error:",
                    err
                );
            }
        };

        this.socket.onerror = (err) => {
            console.error(
                "Dashboard WebSocket error:",
                err
            );
        };

        this.socket.onclose = (event) => {
            console.warn(
                "Dashboard WebSocket disconnected.",
                event.code,
                event.reason
            );

            this.connected = false;

            if (this.shouldReconnect) {
                this.reconnect();
            }
        };
    }

    reconnect() {
        if (
            this.reconnectAttempts >=
            this.maxReconnectAttempts
        ) {
            console.error(
                "Dashboard WebSocket: maximum reconnect attempts reached."
            );

            return;
        }

        const delay = Math.min(
            1000 *
            Math.pow(
                2,
                this.reconnectAttempts
            ),
            30000
        );

        this.reconnectAttempts++;

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    subscribe(listener) {
        if (!this.listeners.includes(listener)) {
            this.listeners.push(listener);
        }

        if (this.latestData) {
            listener(this.latestData);
        }
    }

    unsubscribe(listener) {
        this.listeners =
            this.listeners.filter(
                (l) => l !== listener
            );
    }

    disconnect() {
        this.shouldReconnect = false;

        if (this.socket) {
            this.socket.close();
        }

        this.socket = null;
        this.connected = false;
    }

    getLatestData() {
        return this.latestData;
    }

    isConnected() {
        return this.connected;
    }
}

const dashboardService =
    new DashboardService();

export default dashboardService;