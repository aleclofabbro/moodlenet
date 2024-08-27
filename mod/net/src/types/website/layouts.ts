export type layoutSlotItem = string

export interface Layouts {
  pages: PageLayouts
  roots: RootLayouts
}

export interface RootLayouts {
  main: {
    header: {
      slots: { left: layoutSlotItem[]; center: layoutSlotItem[]; right: layoutSlotItem[] }
    }
    footer: {
      slots: {
        left: layoutSlotItem[]
        center: layoutSlotItem[]
        right: layoutSlotItem[]
        bottom: layoutSlotItem[]
      }
    }
  }
  simple: {
    header: {
      slots: { left: layoutSlotItem[]; center: layoutSlotItem[]; right: layoutSlotItem[] }
    }
    footer: {
      slots: {
        left: layoutSlotItem[]
        center: layoutSlotItem[]
        right: layoutSlotItem[]
        bottom: layoutSlotItem[]
      }
    }
  }
}

export interface PageLayouts {
  landing: {
    slots: { head: layoutSlotItem[]; content: layoutSlotItem[] }
  }
  login: {
    methods: { label: layoutSlotItem; panel: layoutSlotItem }[]
  }
  signup: {
    methods: { label: layoutSlotItem; panel: layoutSlotItem }[]
    slots: { subCard: layoutSlotItem[] }
  }
}