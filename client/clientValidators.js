// !register validators

// ----- Regex -----
export const regUserTest = /^(?=\w*\d)(?=\w*[A-Z])(?=\w*[a-z])\S{8,20}$/g;
export const regCapitalLetters = /[A-Z]+/g
export const regNumbers = /\d+/g

//----- Error messages -----
export const lessThanLength = 'La contraseña no debe tener menos de 8 caracteres'
export const moreThanLength = 'La contraseña no debe tener más de 20 caracteres'
export const capitalLettersValidator = 'La contraseña debe contener letras masyúsculas'
export const numbersValidator = 'La contraseña debe contener almenos un número'
export const noValidPass = 'La contraseña no es válida'
export const passDoesntMatch = 'Las contraseñas no coinciden'
export const needsAnAction = 'Se necesita una accion: !login | !register from client'

// !login

//Error messages
export const userDoesntExist = 'No existe el usuario en la base de datos'
export const incorrectPass = 'Contraseña incorrecta'