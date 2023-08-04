import * as readline from 'node:readline/promises';
const rl = readline.createInterface({ //Interfaz creada para leer datos por consola
    input: process.stdin,
    output: process.stdout
})

import socket from './socket.js' //Importar configuración de socket

import colors from 'colors/safe.js' //Mostrar colores por consola
import { v4 as uuid_v4 } from 'uuid' //Generador de ids para registrar usuarios

import pool from '../DB/dbconn.js' //Importar la base de datos

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
    } else if (text === '!login') { //SE NECESITA REAJUSTAR EL BLOQUE SIGUIENTE CON TRY CATCH
        try { //Bloque trycatch que abarca un error en la conexion a la bdd
            const user = await rl.question('User: ')
            if (user.length === 0) throw new Error('El campo se encuentra vacio\n')
            const [checkUser] = await pool.query('select * from player where username = ?', [user])
            // console.log(checkUser);
            try { //este bloque abarca errores bajo las condiciones de usuario inexistente
                if (checkUser.length === 0) {
                    throw new Error('No existe el usuario en la base de datos\n')
                }
                if (checkUser[0].username.length !== 0) {
                    const inPass = await rl.question('Ingresar password:')
                    const [pass] = await pool.query('select pass from player where username = ?', [user])
                    if (inPass === pass[0].pass) {
                        activeState = true
                        socket.write(`!!activeUser ${user}`)
                        // console.log('Pasa por aqui');
                        process.stdout.write('\x1Bc');
                        process.stdout.write('---------- Envia mensaje o escribe \'!exit\' para salir ----------\n');
                    } else {
                        throw new Error('Contraseña incorrecta\n')
                    }
                }
            } catch (err) {
                process.stdout.write('\x1Bc');
                process.stdout.write(err.message + '');
                process.stdout.write('Se necesita una accion: !login | !register\n');
            }
        } catch (err) {
            process.stdout.write('\x1Bc');
            process.stdout.write(err.message);
            console.error(`----- Ha habido un error de la conexion a la base de datos -----`)
        }
    } else if (text === '!register') {
        const name = await rl.question('Name: ')
        const username = await rl.question('Username: ')
        let pass = await rl.question('Password: ')
        const regUserTest = /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,20}$/g; //Las regex no admiten letra ñ 
        const regCapitalLetters = /[A-Z]+/g
        const regNumbers = /\d+/g
        let passtester = false
        const uuid = uuid_v4().substring(0, 8)
        try {
            if (pass.length === 0) throw new Error('Debe de ingresarse una contraseña') //En caso de que no haya un texto ingresado
            let passCapitalLettersTester = regCapitalLetters.test(pass)
            let passNumbersTester = regNumbers.test(pass)
            if (pass.length < 8) { //No pasa si tiene menos de 8 caracteres
                throw new Error('La contraseña no debe tener menos de 8 caracteres')
            }
            if (pass.length > 20) { //No pasa si tiene más de 8 caracteres
                throw new Error('La contraseña no debe tener más de 20 caracteres')
            }
            if (!passCapitalLettersTester) { //No pasa si no contiene mayúsculas
                throw new Error('La contraseña debe contener letras masyúsculas')
            }
            if (!passNumbersTester) { //No pasa si no contiene números
                throw new Error('La contraseña debe contener almenos un número')
            }
            passtester = true
            if (!regUserTest.test(pass) || !passtester) { //Una ultima validación con regUserTest
                throw new Error('La contraseña no es válida')
            }
            const confirmPass = await rl.question(`${colors.green('Confirm password: ')}`)
            if (confirmPass.length === 0) {
                throw new Error('Se debe ingresar la confirmación de la contraseña')
            }
            if (pass !== confirmPass) { //Comparar la contraseña del usuario existente y la recíen ingresada
                throw new Error('Las contraseñas no coinciden')
            }
            await pool.query('insert into player (u_id, name, pass, username) values (?,?,?,?)', [uuid, name, confirmPass, username])
            // console.log(colors.green('Registrado :D'));
            process.stdout.write('\x1Bc');
            process.stdout.write(colors.green('Registrado, usa comando !login\n'))
        } catch (error) {
            process.stdout.write('\x1Bc');
            process.stdout.write(colors.yellow(error.message) + '\n');
            process.stdout.write('Se necesita una accion: !login | !register\n');
        }
    } else {
        process.stdout.write('\x1Bc');
        process.stdout.write('Comando inexistente\n')
        process.stdout.write('Se necesita una accion: !login | !register\n');
    }
})

socket.on('data', async (message) => {
    // const allMessage = message.replace(adminReg, message.match(adminReg) + ' ').split(' ')

    process.stdout.write(message + '\n');
})

socket.on('error', (err) => {
    process.stdout.write(err + '');
    process.stdout.write('Se ha interrumpido la conexion inesperadamente');
    process.exit(1)
})

socket.on('close', () => {
    //Se usa esta parte para concluir con la conexion. Cuando se usa socket.end() 
    //ambos deben de esperar su confirmacion y cuando eso ocurre, se ejecuta esta funcion.
    process.stdout.write('\x1Bc');
    process.stdout.write('Sesion cerrada');
    process.exit(0)
})