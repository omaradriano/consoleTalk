import { Socket } from 'net'
import * as readline from 'node:readline/promises';
// import { stdin as input, stdout as output } from 'node:process';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}) //Interfaz creada para leer datos por consola

//Importancion de la base de datos
import pool from './DB/dbconn.js'

/**
 * - Realizar el registro de un usuario
 * - Mejorar el login 
 * - Agregar comandos: mostrar los usuarios activos
 * - Agregar y borrar usuarios activos
 */

const socket = new Socket()
socket.connect({ host: '127.0.0.1', port: 8000 })
socket.setEncoding('utf-8')
let aciveState = false

rl.on('line', async (text) => {
    if (aciveState) {
        if (text === '!exit') {
            socket.write(text)
            socket.end()
        } else {
            socket.write(text)
            //RECODATORIO: no se debe de escribir despues de cerrar el socket por que nos va a llamar a un error.
        }
    } else if (text === '!login') {
        try {
            const user = await rl.question('User: ')
            const [checkUser] = await pool.query('select * from player where name = ?', [user])
            // console.log(checkUser[0] + 'Esto proviene de los datos de usuario en caso de que si exista '); //Imprime los datos del usuario
            if (!checkUser[0]) {
                throw new Error('---------- No existe el usuario ----------');
            }
            if (checkUser[0].user_id.length !== 0) {
                const inPass = await rl.question('Ingresar password:')
                const [pass] = await pool.query('select password from player where name = ?', [user])
                // console.log(typeof pass[0].password);
                if(inPass === pass[0].password){
                    aciveState = true
                    socket.write(`!!activeUser ${user}`)
                    console.clear()
                    console.log('---------- Envia mensaje o escribe \'!exit\' para salir ----------');
                }else
                    throw new Error('Contraseña incorrecta')
                
            }
        } catch (error) {
            console.log(error.message);
            console.log('Se necesita una accion: !login | !register from client');
        }
        // if()
    } else {
        console.log('Se necesita una accion: !login | !register from client');
    }
})

socket.on('data', async (message) => {
    console.log(message);
})

socket.on('error', (err) => {
    console.log(err);
    console.log('Se ha interrumpido la conexion inesperadamente');
    process.exit(1)
})

socket.on('close', () => {
    //Se usa esta parte para concluir con la conexion. Cuando se usa socket.end() 
    //ambos deben de esperar su confirmacion y cuando eso ocurre, se ejecuta esta funcion.
    console.log('Sesion cerrada');
    process.exit(0)
})