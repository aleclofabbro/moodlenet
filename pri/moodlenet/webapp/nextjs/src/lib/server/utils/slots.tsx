import { lib_moodle_net_webapp_nextjs } from '@moodle/lib-domain'
import { PropsWithChildren, ReactElement } from 'react'
import { clientSlotItem } from '../../common/pages'
import { _any } from '@moodle/lib-types'
type layoutSlotItem = lib_moodle_net_webapp_nextjs.v0_1.layoutSlotItem
// export type layoutPropsWithChildren = PropsWithChildren<map<ReactElement>>
export type layoutPropsWithChildren = PropsWithChildren<_any>
export function slotsMap<S extends Record<string, layoutSlotItem[]>>(
  props: layoutPropsWithChildren,
  slots: S,
) {
  return Object.entries(slots).reduce(
    (_, [k, items]) => ((_[k as keyof S] = slotItems(props, items)), _),
    {} as Record<keyof S, clientSlotItem[]>,
  )
}

export function slotItems<S extends layoutSlotItem[]>(
  props: layoutPropsWithChildren,
  items: S | null | undefined,
) {
  const res = (items ?? []).map(item => slotItem(props, item))

  return res
}

export function isLayoutSlotItem(value: layoutSlotItem | undefined): value is layoutSlotItem {
  return !!value
}

export function slotItem(
  props: layoutPropsWithChildren,
  item: layoutSlotItem,
  //_default: ReactElement = <>{`SHOULD NEVER HAPPEN: NO SLOT ITEM for [${item}]`}</>,
) {
  const camelCaseItem = item.replace(/-([a-z])/g, g => (g[1] ? g[1].toUpperCase() : ''))
  return (props as any)[camelCaseItem] ? (
    ((props as any)[camelCaseItem] as ReactElement)
  ) : (
    <div key={item} dangerouslySetInnerHTML={{ __html: item }} />
  )
}

// export function isParallelRouteItem(item: layoutSlotItem): item is parallelRouteItem {
//   return typeof item === 'object' && '@' in item && typeof item['@'] === 'string'
// }
// export function slotItem(
//   props: layoutProps,
//   item: layoutSlotItem,
//   _default: clientSlotItem = `SHOULD NEVER HAPPEN: NO SLOT ITEM for ${isParallelRouteItem(item) ? item['@'] : String(item)}`,
// ) {
//   return isParallelRouteItem(item)
//     ? (props[item['@']] ?? _default)
//     : typeof item === 'string'
//       ? item
//       : createElement(item.type, { key: item.key, ...item.props })
// }

// export function isParallelRouteItem(item: layoutSlotItem): item is parallelRouteItem {
//   return typeof item === 'object' && '@' in item && typeof item['@'] === 'string'
// }