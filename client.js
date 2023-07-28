import { Socket } from 'net'
import * as readline from 'node:readline/promises';
// import { stdin as input, stdout as output } from 'node:process';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}) //Interfaz creada para leer datos por consola

const socket = new Socket()
socket.connect({host: '127.0.0.1', port:8000})
socket.setEncoding('utf-8')

rl.on('line', (text) => {
    socket.write(text)
})

socket.on('data', (message) => {
    console.log(message);
})

socket.on('error', (err)=>{
    console.log(err);
    console.log('Se ha cerrado la conexion inesperadamente');
    process.exit(0)
})

socket.on('close', ()=>{
    //Se usa esta parte para concluir con la conexion. Cuando se usa socket.end() 
    //ambos deben de esperar su confirmacion y cuando eso ocurre, se ejecuta esta funcion.
    console.log('Cerrando socket');
})