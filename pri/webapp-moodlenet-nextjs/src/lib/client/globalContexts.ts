import { AllSchemaConfigs, env, lib } from '@moodle/domain'
import { createContext, useContext } from 'react'

export const GlobalCtx = createContext<GlobalCtx>(null as any)
export type GlobalCtx = {
  deployments: env.appDeployments
  allSchemaConfigs: AllSchemaConfigs
}

function useGlobalCtx() {
  return useContext(GlobalCtx)
}
export function useAllSchemaConfigs() {
  return useGlobalCtx().allSchemaConfigs
}
export function useDeployments() {
  return useGlobalCtx().deployments
}

export function useAllPrimarySchemas() {
  const allSchemaConfigs = useAllSchemaConfigs()
  const primarySchemas = lib.makeAllPrimarySchemas(allSchemaConfigs)
  return primarySchemas
}
