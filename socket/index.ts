import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {});

io.engine.generateId = req => {
    return uuidv4();
}

io.on('connection', socket => {
    console.log(`\n`)
    // console.log(`socket: `, socket.);
    socket.on('/sys/status', async (data) => {
        const memory = process.memoryUsage();
        const engineCnt = io.engine.clientsCount;
        const socketSize = io.of('/').sockets.size;
        const sockets = await io.fetchSockets();
        let cnt = 0
        console.log(`\n`)
        for (const socket of sockets) {
            console.log(`cnt:`, ++cnt)
            console.log(`socketid: `, socket.id)
            console.log(`rooms: `, socket.rooms)
            console.log(`data: `, socket.data)
        }
        console.log(`\n`)
        const roomSockets = await io.in('admin').fetchSockets();
        cnt = 0
        for (const socket of roomSockets) {
            console.log(`cnt:`, ++cnt)
            console.log(`socketid: `, socket.id)
        }
        console.log(`\n`)
        let params = {
            env: {
                memory: {
                    rss: `${(memory.rss/1024/1024).toFixed(2)}MB`,
                    heapTotal: `${(memory.heapTotal/1024/1024).toFixed(2)}MB`,
                    heapUsed: `${(memory.heapUsed/1024/1024).toFixed(2)}MB`,
                    external: `${(memory.external/1024/1024).toFixed(2)}MB`,
                }
            },
            socket: {
                engineCnt: engineCnt,
                socketSize: socketSize,
            },
            // socketsClients: sockets
        }
        console.log(JSON.stringify(params));
        socket.emit('/sys/status', params);
    })
    socket.on('/user/join', data => {
        // console.log(`data: `, data);
        socket.join(data)
    })
    socket.on('/admin/broadcast', data => {
        socket.local.emit('/admin/broadcast', data);
    })
})

httpServer.listen(3600, () => {
    console.log(`Server on PORT 3600`)
});