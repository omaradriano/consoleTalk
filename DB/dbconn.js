import mysql from 'mysql2/promise'
import {database, host, password, port,user} from '../config.js'

const pool = mysql.createPool({
    host,
    database,
    port,
    password,
    user
})

export default pool