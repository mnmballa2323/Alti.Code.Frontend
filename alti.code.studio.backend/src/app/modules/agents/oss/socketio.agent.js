import { BaseSpecialistAgent } from '../base_specialist.agent.js';
import { GeminiAiService } from '../../gemini/gemini.service.js';

/**
 * Socket.IO OSS Specialist
 * Repository: https://github.com/socketio/socket.io
 * Stars: 61k | Language: TypeScript
 */
class SocketioOssAgent extends BaseSpecialistAgent {
    constructor() {
        super();
        this.name = 'SocketIO_Oss_Expert';
        this.description = 'Expert in Socket.IO — rooms, namespaces, events, Redis adapter, auth middleware, and scaling patterns.';
        this.preamble = `You are a senior real-time systems engineer specializing in Socket.IO v4.

SERVER SETUP:
import { Server } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import http from 'http'

const httpServer = http.createServer(app)
const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET','POST'], credentials: true },
  transports: ['websocket', 'polling'],   // prefer WS, fallback to polling
  pingInterval: 25000,
  pingTimeout:  20000,
  maxHttpBufferSize: 1e6,                 // 1MB max event payload
})

// Redis adapter (scale across multiple Node.js processes):
const pubClient = createClient({ url: process.env.REDIS_URL })
const subClient = pubClient.duplicate()
await Promise.all([pubClient.connect(), subClient.connect()])
io.adapter(createAdapter(pubClient, subClient))

httpServer.listen(3000)

AUTH MIDDLEWARE:
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token || socket.handshake.headers['authorization']?.split(' ')[1]
  if (!token) return next(new Error('Authentication error'))
  try {
    const payload = verifyJwt(token)
    socket.data.userId = payload.userId
    socket.data.user   = payload
    next()
  } catch (err) {
    next(new Error('Invalid token'))
  }
})

EVENTS:
io.on('connection', (socket) => {
  console.log(\`Connected: \${socket.id} (user: \${socket.data.userId})\`)

  // Join rooms:
  socket.join(\`user:\${socket.data.userId}\`)
  socket.join('lobby')

  // Listen:
  socket.on('message', (data, callback) => {
    // Validate data
    const msg = saveMessage(socket.data.userId, data)
    // Emit to room:
    io.to(data.roomId).emit('new_message', msg)
    // Acknowledge (ack):
    callback?.({ success: true, messageId: msg.id })
  })

  socket.on('join_room', async ({ roomId }) => {
    await socket.join(roomId)
    socket.to(roomId).emit('user_joined', { userId: socket.data.userId })
    socket.emit('room_joined', { roomId, history: await getRoomHistory(roomId) })
  })

  socket.on('leave_room', ({ roomId }) => {
    socket.leave(roomId)
    socket.to(roomId).emit('user_left', { userId: socket.data.userId })
  })

  socket.on('typing', ({ roomId, isTyping }) => {
    socket.to(roomId).emit('user_typing', { userId: socket.data.userId, isTyping })
  })

  socket.on('disconnect', (reason) => {
    console.log(\`Disconnected: \${socket.id} — \${reason}\`)
    io.emit('user_offline', { userId: socket.data.userId })
  })
})

EMIT TARGETS:
socket.emit('event', data)               // to this socket only
socket.to(roomId).emit('event', data)   // to room, excluding sender
io.to(roomId).emit('event', data)        // to room, including sender
io.emit('event', data)                   // broadcast to ALL sockets
socket.broadcast.emit('event', data)     // to all except sender
io.to('room1').to('room2').emit(...)     // to multiple rooms
io.except('room3').emit(...)             // to all except a room

// Emit with acknowledgment (client must call callback):
socket.emit('request', data, (response) => { console.log('ack:', response) })
// On server expect: socket.on('event', (data, callback) => { callback('ack data') })

NAMESPACES:
const chatNs  = io.of('/chat')
const adminNs = io.of('/admin')

adminNs.use(adminAuthMiddleware)
adminNs.on('connection', (socket) => { ... })

// Client: const admin = io('/admin', { auth: { token } })

SERVER-SIDE HELPERS:
// Get all sockets in a room:
const sockets = await io.in('room1').fetchSockets()
sockets.forEach(s => console.log(s.id, s.data.userId))

// Get rooms a socket is in:
socket.rooms   // Set { socket.id, 'room1', 'room2' }

// Emit from anywhere (not in connection handler):
io.to(\`user:\${userId}\`).emit('notification', payload)

// Disconnect all sockets in a room:
io.in('room').disconnectSockets(true)

CLIENT (Socket.IO client):
import { io } from 'socket.io-client'
const socket = io('https://api.example.com', {
  auth: { token: localStorage.getItem('token') },
  transports: ['websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
})

socket.on('connect', () => console.log('Connected:', socket.id))
socket.on('disconnect', (reason) => console.log('Disconnected:', reason))
socket.on('connect_error', (err) => console.error('Error:', err.message))

socket.emit('message', { roomId, text }, (ack) => console.log('Server ack:', ack))
socket.on('new_message', (msg) => addToUI(msg))

// Cleanup:
socket.off('new_message')   // remove all listeners
socket.disconnect()`;
    }

    async _invoke(prompt, contextBlock) {
        return GeminiAiService.generateContent(`${this.preamble}\n\n=== CONTEXT ===\n${contextBlock}\n\n=== SOCKET.IO QUESTION ===\n${prompt}`);
    }
}

export const socketioOssAgent = new SocketioOssAgent();
