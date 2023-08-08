import { Server } from 'net'
import colors from 'colors/safe.js'

const activeConnections = new Map()

const listen = (port) => {
    const server = new Server()
    server.listen({ port, host: '0.0.0.0' }, () => {
        console.log(`Connected on port ${port}`);
    })

    //Cuando haya una nueva conexión con el servidor
    server.on('connection', (socket) => {
        // console.log(`Nuevo intento de conexion desde ${socket.remoteAddress}:${socket.remotePort}`);
        socket.write('Se necesita una accion: !login | !register:')
        socket.setEncoding('utf-8')

        const adminReg = /^(!|!!)(?=\w)/g

        const user = `${socket.remoteAddress}:${socket.remotePort}`
        console.log(`Nuevo intento de conexion: ${user}`);

        socket.on('data', (data) => {
            let { username, message, status } = JSON.parse(data)
            if (status === 'online') {
                activeConnections.set(socket, username)
                sendAdvice(`${username} se ha unido`, socket)
                process.stdout.write(`${username} se ha unido\n`)
            } //Solo se usa cuando un usuario se loggea
            if (status === 'offline') {
                sendAdvice(`${username} ha salido`, socket)
                process.stdout.write(`${username} ha salido\n`)
                activeConnections.delete(socket)
                return
            } //Solo se usa cuando un usuario se loggea
            const [prefix, command, text] = message.replace(adminReg, message.match(adminReg) + ' ').split(' ')
            if (prefix === '!') {
                switch (command) {
                    case 'test':
                        process.stdout.write('Ingresado comando test\n')
                        socket.write('Ingresado comando test')
                        break;
                    case 'exit':
                        socket.end()
                        // sendMessages(`${activeConnections.get(socket)} ha salido`, socket)
                        break;
                    case 'connections':
                        for(let item of activeConnections.values()){
                            socket.write(item)
                        }
                        break;
                    default:
                        socket.write('Comando desconocido')
                        // process.stdout.write('Comando desconocido')
                        break
                }
            } else {
                if (message.length !== 0) {
                    sendMessages(message, socket) //Envía mensajes a los demás clientes
                    process.stdout.write(`${activeConnections.get(socket)} -> ${message}\n`) //Imprime el mensaje en el servidor
                }
            }
        })
    })
    server.on('error', (err) => {
        error(err.message)
    })
    server.on('close', () => {
        activeConnections.delete(socket)
        console.log(`${colors.red(socket.remoteAddress)} ha salido`);
    })
}


const sendMessages = (message, originUser) => {
    //Enviar mensaje a todos menos a origin
    for (let user of activeConnections.keys()) {
        if (originUser !== user) {
            user.write(`${activeConnections.get(originUser)} -> ${message}`)
        }
    }
}

const sendAdvice = (message, originUser) => {
    //Enviar mensaje a todos menos a origin
    for (let user of activeConnections.keys()) {
        if (originUser !== user) {
            user.write(`${message}`)
        }
    }
}

//Correr el servidor, esta parte ya no se toca de momento
const main = () => {
    console.log(process.argv);
    if (process.argv.length !== 3) {
        error('Faltan argumentos en la expresion')
    } else {
        let port = process.argv[2]
        if (isNaN(port)) {
            error(`${port} no es un puerto correcto`)
        } else {
            port = Number(port)
            listen(port)
        }
    }
}

const error = (err) => {
    console.error(err)
    process.exit(1)
}
main()

