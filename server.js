const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const activeUsers = new Map();

// Calculate distance between two points in km using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Users connecting via socket
io.on('connection', (socket) => {
    console.log('A user connected: ' + socket.id);

    // Admin identifying themselves
    socket.on('admin_join', () => {
        socket.join('admins');
        console.log('Admin joined room');
        // Send current active users immediately
        const usersArray = Array.from(activeUsers.values());
        socket.emit('initial_locations', usersArray);
    });

    // User sending their location
    socket.on('update_location', (data) => {
        const { userId, lat, lng, timestamp } = data;
        let userData = activeUsers.get(userId) || { userId, distance: 0, lat, lng, lastLat: null, lastLng: null, history: [] };
        
        // Update distance if history > 0
        if (userData.lastLat !== null && userData.lastLng !== null) {
            const distSq = calculateDistance(userData.lastLat, userData.lastLng, lat, lng);
            // only add if > 0.01 km (10 meters) to avoid GPS scatter
            if (distSq > 0.01) {
                userData.distance += distSq;
                userData.lastLat = lat;
                userData.lastLng = lng;
            }
        } else {
            userData.lastLat = lat;
            userData.lastLng = lng;
        }

        userData.lat = lat;
        userData.lng = lng;
        userData.history.push({ lat, lng, time: timestamp });

        activeUsers.set(userId, userData);

        // Broadcast to admins
        io.to('admins').emit('user_location_update', userData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
        // We could clean up inactive users after some time if we want
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
