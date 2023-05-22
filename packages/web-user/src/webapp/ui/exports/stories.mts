// @index(['../!(exports)/**/*.stories.*'], f => `export * as ${f.name.replace('.stories','Stories')} from '${f.path}${f.ext==='.tsx'?'.js':f.ext==='.mts'?'.mjs':f.ext}'`)
export * as AccessButtonsStories from '../components/molecules/AccessButtons/AccessButtons.stories.js'
export * as AvatarMenuStories from '../components/molecules/AvatarMenu/AvatarMenu.stories.js'
export * as MinimalisticAccessButtonsStories from '../components/molecules/MinimalisticAccessButtons/MinimalisticAccessButtons.stories.js'
export * as MainProfileCardStories from '../components/organisms/MainProfileCard/MainProfileCard.stories.js'
export * as ProfileCardStories from '../components/organisms/ProfileCard/ProfileCard.stories.js'
export * as UsersStories from '../components/organisms/Roles/Users.stories.js'
export * as MessageReceivedEmailStories from '../components/pages/emails/MessageReceivedEmail/MessageReceivedEmail.stories.js'
export * as NewUserRequestEmailStories from '../components/pages/emails/NewUserRequestEmail/NewUserRequestEmail.stories.js'
export * as RecoverPasswordEmailStories from '../components/pages/emails/RecoverPasswordEmail/RecoverPasswordEmail.stories.js'
// @endindex
