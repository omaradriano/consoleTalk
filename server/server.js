import { Server } from 'net'


const listen = (port) => {
    const server = new Server()
    server.listen({ port, host: '0.0.0.0' }, () => {
        console.log(`Connected on port ${port}`);
    })

    //Cuando haya una nueva conexión con el servidor
    server.on('connection', (socket) => {
        console.log(`Nuevo intento de conexion desde ${socket.remoteAddress}:${socket.remotePort}`);
        socket.write('Se necesita una accion: !login | !register:')
        socket.setEncoding('utf-8')

        const user =  `${socket.remoteAddress}:${socket.remotePort}`

        socket.on('data', (message) => {
            if(message === 'exit'){
                console.log(`${user} ha salido`);
                socket.end()
            }else{
                console.log(`${user} -> ${message}`);
            }
        })
    })
    server.on('error', (err)=>{
        error(err.message)
    })
    server.on('close', ()=>{
        console.log(`${socket.remoteAddress} ha salido`);
    })
}

const activeConnections = new Map()

const sendMessage = (message, originUser) => {
    //Enviar mensaje a todos menos a origin
}

//Correr el servidor, esta parte ya no se toca de momento
const main = () => {
    console.log(process.argv);
    if(process.argv.length !== 3){
        error('Faltan argumentos en la expresion')
    }else{
        let port = process.argv[2]
        if(isNaN(port)){ 
            error(`${port} no es un puerto correcto`)
        }else{
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

