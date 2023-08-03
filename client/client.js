import { Socket } from 'net'
import * as readline from 'node:readline/promises';
const rl = readline.createInterface({ //Interfaz creada para leer datos por consola
    input: process.stdin,
    output: process.stdout
})
import colors from 'colors/safe.js' //Mostrar colores por consola
import { v4 as uuid_v4 } from 'uuid' //Generador de ids para registrar usuarios

/**
 *  green: se ha unido
 *  magenta: mensaje
 *  red: ha salido
 */


import pool from '../DB/dbconn.js' //Importar la base de datos

const socket = new Socket()
socket.connect({ host: '127.0.0.1', port: 8000 })
socket.setEncoding('utf-8')
let activeState = false

rl.on('line', async (text) => {
    if (activeState) {
        switch (text) {
            case '!exit':
                socket.write(text)
                socket.end()
                break;
            default:
                socket.write(text)
                break;
        }
        //RECODATORIO: no se debe de escribir despues de cerrar el socket por que nos va a llamar a un error.
    } else if (text === '!login') {
        try { //Bloque trycatch que abarca un error en la conexion a la bdd
            const user = await rl.question('User: ')
            if (user.length === 0) {
                throw new Error('El campo se encuentra vacio')
            }
            const [checkUser] = await pool.query('select * from player where username = ?', [user])
            // console.log(checkUser);
            try { //este bloque abarca errores bajo las condiciones de usuario inexistente
                if (checkUser.length === 0) {
                    activeState = false
                    throw new Error('No existe el usuario en la base de datos')
                }
                if (checkUser[0].username.length !== 0) {
                    const inPass = await rl.question('Ingresar password:')
                    const [pass] = await pool.query('select pass from player where username = ?', [user])
                    if (inPass === pass[0].pass) {
                        activeState = true
                        socket.write(`!!activeUser ${user}`)
                        console.log('Pasa por aqui');
                        rl.write('Mensaje escrito')
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
            console.log(err.message);
            console.error(`----- Ha habido un error de la conexion a la base de datos -----`)
        }
    } else if (text === '!register') {
        const name = await rl.question('Name: ')
        const username = await rl.question('Username: ')
        let pass = await rl.question('Password: ')
        const regUserTest = /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,20}$/g;
        const regCapitalLetters = /[A-Z]+/g
        const regNumbers = /\d+/g
        let passtester = false
        const uuid = uuid_v4().substring(0, 8)
        if (pass.length > 0) { //Validar que se haya escrito una constraseña
            let passCapitalLettersTester = regCapitalLetters.test(pass)
            let passNumbersTester = regNumbers.test(pass)
            try {
                if (pass.length < 8) { //No pasa si tiene menos de 8 caracteres
                    console.clear()
                    throw new Error('La contraseña no debe tener menos de 8 caracteres')
                } else if (pass.length > 20) { //No pasa si tiene más de 8 caracteres
                    console.clear()
                    throw new Error('La contraseña no debe tener más de 20 caracteres')
                }
                if (!passCapitalLettersTester) { //No pasa si no contiene mayúsculas
                    throw new Error('La contraseña debe contener letras masyúsculas')
                } else {
                    if (!passNumbersTester) { //No pasa si no contiene números
                        throw new Error('La contraseña debe contener almenos un número')

                    } else {
                        if (regUserTest.test(pass)) { //Una ultima validación con regUserTest
                            passtester = true
                        } else {
                            throw new Error('La contraseña no es válida')
                        }
                    }
                }
                if (passtester) {
                    const confirmPass = await rl.question(`${colors.green('Confirm password: ')}`)
                    if (pass === confirmPass) {
                        console.clear()
                        await pool.query('insert into player (u_id, name, pass, username) values (?,?,?,?)', [uuid, name, confirmPass, username])
                        // console.log(colors.green('Registrado :D'));
                        rl.write(colors.green('Registrado :D'))
                    } else {
                        console.clear()
                        throw new Error('Las constraseñas no coinciden')
                    }
                }
            } catch (error) {
                console.clear()
                console.log(colors.yellow(error.message));
                console.log('Se necesita una accion: !login | !register from client');
            }

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