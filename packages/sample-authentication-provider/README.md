# Authentication Provider

This provider creates local demonstration sessions with a fixed demonstration token. It makes no network requests and stores no credentials. Sessions live only in the extension worker; a rebuild or page reload starts with an empty list.

Open the Authentication Provider playground sample. Focus the preview, press F1, and run **Sample: Sign In Locally**. Escape cancels; choosing **Demo Reader** creates a session with the `read:demo` scope. The Output panel displays the account and session count, without printing the token. **Sample: List Local Sessions** filters by scope. **Sample: Sign Out Locally** removes all matching sessions; repeat it to see that removal is safe when already signed out.

The sample registers `createSession`, `getSessions`, and `removeSession` with `registerAuthenticationProvider`. Commands exercise them through the public `executeAuthenticationProvider*` APIs. A production provider would implement its service's sign-in flow and return a service-issued token. This sample does not call the separate host-level `getAccessToken` API.

Save `src/main.ts` with Ctrl+S to reload the provider. **Reset sample** restores its original source. Every reload owns a fresh provider registry and session map.
