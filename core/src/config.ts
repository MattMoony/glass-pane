import * as dotenv from 'dotenv'

dotenv.config()

export const HTTP_HOST: string = process.env.HTTP_HOST || '0.0.0.0'
export const HTTP_PORT: number = Number(process.env.HTTP_PORT || 3000)
export const NODE_ENV: string = process.env.NODE_ENV as string
export const NEO_USER: string = process.env.NEO_USER!
export const NEO_PASS: string = process.env.NEO_PASS!
export const NEO_URL: string = process.env.NEO_URL!
