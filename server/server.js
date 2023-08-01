import { Server } from 'net'

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

        const user =  `${socket.remoteAddress}:${socket.remotePort}`

        socket.on('data', (message) => {
            const allMessage = message.replace(adminReg, message.match(adminReg)+' ').split(' ')
            // console.log(allMessage);
            if(allMessage[0] === '!!'){
                if(allMessage[1] === 'activeUser'){
                    console.log(`${allMessage[2]} se ha unido`);
                    activeConnections.set(socket, allMessage[2])
                    // console.log(activeConnections);
                }
            }else if(allMessage[0] === '!'){
                if(allMessage[1] === 'exit'){
                    activeConnections.delete(socket)
                    socket.end()
                    console.log(`${user} ha salido`);
                }else if(allMessage[1] === 'test'){
                    console.log('Comando test');
                }else if(allMessage[1] === 'showUsers'){
                    for(let user of activeConnections.values()){
                        console.log(`Name: ${user}`);
                    }
                }
            }else{
                console.log(`${user} -> ${message}`);
                sendMessages(message, socket)
            }
        })
    })
    server.on('error', (err)=>{
        error(err.message)
        activeConnections.delete(socket)
    })
    server.on('close', ()=>{
        console.log(`${socket.remoteAddress} ha salido`);
    })
}


const sendMessages = (message, originUser) => {
    //Enviar mensaje a todos menos a origin
    for(let user of activeConnections.keys()){
        if(originUser !== user){
            user.write(`${activeConnections.get(user)} -> ${message}`)
        }
    }

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

