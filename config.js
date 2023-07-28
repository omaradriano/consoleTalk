import env from 'dotenv'

env.config()

export const host = process.env.HOST
export const user = process.env.USER
export const port = process.env.PORT
export const password = process.env.PASSWORD
export const database = process.env.DATABASE
export const serverPort = process.env.SERVERPORT