import { mkdirSync } from 'fs'
import { join } from 'path'
import '../../../../../../../../dotenv'

export const SUBJECTS_AMOUNT = Number(process.env.SUBJECTS_AMOUNT) || 30
export const USERS_AMOUNT = Number(process.env.USERS_AMOUNT) || 1000

export const PARALLEL_MONKEYS = Number(process.env.PARALLEL_MONKEYS) || 100
export const MONKEYS_WAIT = Number(process.env.MONKEYS_WAIT) || 10

export const GEN_DIR = process.env.GEN_DIR || join(__dirname, '_gen')

try {
  mkdirSync(GEN_DIR)
} catch {}
