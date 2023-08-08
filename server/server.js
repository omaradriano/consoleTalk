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

        socket.on('data', (data) => {
            const [prefix, command, message] = data.replace(adminReg, data.match(adminReg) + ' ').split(' ')
            // console.log(prefix, command, message);
            switch (prefix) {
                case '!!':
                    if (command === 'activeUser') {
                        console.log(`${colors.blue(message)} se ha unido`);
                        activeConnections.set(socket, message)
                    }
                    break;
                case '!':
                    if (command === 'exit') {
                        console.log(`${colors.red(activeConnections.get(socket))} ha salido`);
                        activeConnections.delete(socket)
                        socket.end()
                    } else if (command === 'test') {
                        socket.write('Comando test');
                    } else if (command === 'showUsers') {
                        for (let user of activeConnections.values()) {
                            socket.write(`Name: ${user}\n`);
                        }
                    } else if (command === 'important') {
                        socket.write(`${colors.magenta(activeConnections.get(socket))} -> ${message}\n`)
                    }
                    else {
                        socket.write('Comando desconocido');
                    }
                    break; 
                default:
                    process.stdout.write(`${colors.magenta(activeConnections.get(socket))} -> ${data}\n`);
                    sendMessages(data, socket)
                    break
            }
        })
    })
    server.on('error', (err) => {
        error(err.message)
        activeConnections.delete(socket)
    })
    server.on('close', () => {
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

