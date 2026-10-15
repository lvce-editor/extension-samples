import {
  activate,
  createOutputChannel,
  executeAuthenticationProviderCreateSession,
  executeAuthenticationProviderGetSessions,
  executeAuthenticationProviderRemoveSession,
  openOutputView,
  registerAuthenticationProvider,
  registerCommand,
  showQuickPick,
  type AuthenticationSession,
} from '@lvce-editor/api'

const providerId = 'sample-local-authentication'
const scopes = ['read:demo']
const sessions = new Map<string, AuthenticationSession>()
const state = { nextId: 0 }
const output = createOutputChannel('sample-authentication')

const ready = activate().then(() => {
  registerAuthenticationProvider({
    createSession(requestedScopes) {
      const session: AuthenticationSession = {
        accessToken: 'demonstration-token',
        account: { id: 'demo', label: 'Demo Reader' },
        id: String(++state.nextId),
        scopes: [...requestedScopes],
      }
      sessions.set(session.id, session)
      return session
    },
    getSessions(requestedScopes) {
      return sessions
        .values()
        .filter((session) => requestedScopes.every((scope) => session.scopes.includes(scope)))
        .toArray()
    },
    id: providerId,
    label: 'Local Demonstration',
    removeSession(id) {
      sessions.delete(id)
    },
  })
})

const listSessions = async (): Promise<void> => {
  await ready
  const current = await executeAuthenticationProviderGetSessions(providerId, scopes)
  await output.appendLine(`Sessions: ${String(current.length)}`)
  await openOutputView({ channel: 'sample-authentication' })
}

registerCommand({
  async execute() {
    await ready
    const confirmed = await showQuickPick({
      items: [{ description: 'Create an in-memory demonstration session', label: 'Demo Reader', value: true }],
      placeholder: 'Choose a local account (Escape cancels)',
    })
    if (confirmed !== true) return
    const session = await executeAuthenticationProviderCreateSession(providerId, scopes)
    await output.appendLine(`Signed in: ${session.account.label}`)
    await listSessions()
  },
  id: 'sample.signIn',
})
registerCommand({ execute: listSessions, id: 'sample.listSessions' })
registerCommand({
  async execute() {
    await ready
    const current = await executeAuthenticationProviderGetSessions(providerId, scopes)
    for (const session of current) {
      await executeAuthenticationProviderRemoveSession(providerId, session.id)
    }
    await listSessions()
  },
  id: 'sample.signOut',
})

ready.catch(console.error)
