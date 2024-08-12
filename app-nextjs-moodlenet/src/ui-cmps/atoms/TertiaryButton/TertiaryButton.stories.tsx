'use client'
import type { Meta as ComponentMeta, StoryFn as ComponentStory } from '@storybook/react'
import { TertiaryButton } from './TertiaryButton.jsx'

const meta: ComponentMeta<typeof TertiaryButton> = {
  title: 'Atoms/TertiaryButton',
  component: TertiaryButton,
  parameters: {
    layout: 'centered',
  },
}

const TertiaryButtonStory: ComponentStory<typeof TertiaryButton> = () => (
  <TertiaryButton>Tertiary Button</TertiaryButton>
)

export const Default: typeof TertiaryButtonStory = TertiaryButtonStory.bind({})

export default meta