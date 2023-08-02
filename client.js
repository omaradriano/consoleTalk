import { Socket } from 'net'
import * as readline from 'node:readline/promises';
// import { stdin as input, stdout as output } from 'node:process';
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
}) //Interfaz creada para leer datos por consola
import colors from 'colors/safe.js'
import { v4 as uuid_v4 } from 'uuid'
console.log(uuid_v4());

/**
 *  green: se ha unido
 *  magenta: mensaje
 *  red: ha salido
 */

//Importancion de la base de datos
import pool from './DB/dbconn.js'

/**
 * - Realizar el registro de un usuario
 * - Mejorar el login 
 * - Agregar comandos: mostrar los usuarios activos (A medias, aún no se como visualizarlo)
 * - Agregar y borrar usuarios activos
 */

const socket = new Socket()
socket.connect({ host: '127.0.0.1', port: 8000 })
socket.setEncoding('utf-8')
let activeState = false

rl.on('line', async (text) => {
    if (activeState) {
        if (text === '!exit') {
            socket.write(text)
            socket.end()
        } else {
            socket.write(text)
            //RECODATORIO: no se debe de escribir despues de cerrar el socket por que nos va a llamar a un error.
        }
    } else if (text === '!login') {
        try { //Bloque trycatch que abarca un error en la conexion a la bdd
            const user = await rl.question('User: ')
            const [checkUser] = await pool.query('select * from player where name = ?', [user])
            // console.log(checkUser);
            // console.log(checkUser[0] + 'Esto proviene de los datos de usuario en caso de que si exista '); //Imprime los datos del usuario
            try { //este bloque abarca errores bajo las condiciones de usuario inexistente
                if (checkUser.length === 0) {
                    activeState = false
                    throw new Error('No existe el usuario en la base de datos')
                }
                if (checkUser[0].user_id.length !== 0) {
                    const inPass = await rl.question('Ingresar password:')
                    const [pass] = await pool.query('select password from player where name = ?', [user])
                    // console.log(typeof pass[0].password);
                    if (inPass === pass[0].password) {
                        activeState = true
                        socket.write(`!!activeUser ${user}`)
                        console.clear()
                        console.log('---------- Envia mensaje o escribe \'!exit\' para salir ----------');
                    } else {
                        activeState = false
                        throw new Error('Contraseña incorrecta')
                    }
                }
            } catch (err) {
                console.clear()
                console.log(err.message);
                console.log('Se necesita una accion: !login | !register from client');
            }
        } catch (err) {
            console.clear()
            console.error(`----- Ha habido un error de la conexion a la base de datos -----`)
        }
        // if()
    } else if (text === '!register') {
        // const name = await rl.question('Name: ')
        // const username = await rl.question('Username: ')
        let pass = await rl.question('Password: ')
        const regUserTest = /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,20}$/g;
        const regCapitalLetters = /[A-Z]+/g
        const regNumbers = /\d+/g
        let passtester = false
        //Validador de contraseña
        if (pass.length > 0) {
            // let passNumbersTester = pass.split('').some((elem, _, arr) => { //Validar si tiene números
            //     let item = Number(elem)
            //     return !Number.isNaN(item) ? true : false
            // })
            let passCapitalLettersTester = regCapitalLetters.test(pass)
            let passNumbersTester = regNumbers.test(pass)
            try {
                if (pass.length < 8) {
                    console.clear()
                    throw new Error('La contraseña no debe tener menos de 8 caracteres')
                } else if (pass.length > 20) {
                    console.clear()
                    throw new Error('La contraseña no debe tener más de 20 caracteres')
                }
                if (!passCapitalLettersTester) {
                    throw new Error('La contraseña debe contener letras masyúsculas')
                } else {
                    if (!passNumbersTester) {
                        throw new Error('La contraseña debe contener almenos un número')

                    } else {
                        if (regUserTest.test(pass)) {
                            // console.log('En este punto si jala');
                            passtester = true
                        } else {
                            throw new Error('La contraseña no es válida')
                        }
                    }
                }
            } catch (error) {
                console.clear()
                console.log(colors.yellow(error.message));
                console.log('Se necesita una accion: !login | !register from client');
                return
            }
            if (passtester) {
                const confirmPass = await rl.question(`${colors.green('Confirm password: ')}`)
                if (pass === confirmPass) {
                    console.clear()
                    console.log(colors.green('Registrado :D'));
                    // console.log('Las contraseñas coinciden');
                } else {
                    console.clear()
                    console.log(colors.red('Las contraseñas no coinciden'));
                    console.log('Se necesita una accion: !login | !register from client');
                    return
                }
            } else {
                console.log('Apartado donde no sé que pasa');
            }
            // console.log(passTester);

        }

    } else {
        console.log('Se necesita una accion: !login | !register from client');
    }
})

socket.on('data', async (message) => {
    // const allMessage = message.replace(adminReg, message.match(adminReg) + ' ').split(' ')

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