import { Socket } from 'net'

const socket = new Socket()
socket.connect({ host: '127.0.0.1', port: 8000 })
socket.setEncoding('utf-8')

export default socket