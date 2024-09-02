import { mod } from '../../../types'
import { Configs } from './types'

export type module = mod<{
  V0_1: {
    pri: {
      read: {
        configs(): Promise<{ configs: Configs }>
      }
    }
    sec: {
      read: {
        configs(): Promise<{ configs: Configs }>
      }
    }
    prm: { a: { b: number } }
  }
}>
