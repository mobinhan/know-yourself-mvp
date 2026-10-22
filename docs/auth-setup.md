# Know Yourself authentication setup (feature/auth-signin)

This feature establishes a Supabase Auth session only. It does not create a profile table, dashboard, report entitlement, saved-report workflow, or billing path. The existing guest chart journey stays available without signing in.

## Application environment

Set these on the API/web runtime that serves `/v1/auth/config`:

- `SUPABASE_URL`: project URL, e.g. `https://<project-ref>.supabase.co`.
- `SUPABASE_PUBLISHABLE_KEY`: preferred browser-safe publishable key. If the project still uses a legacy anon key, set `SUPABASE_ANON_KEY` instead.
- `KY_AUTH_EMAIL_PASSWORD_ENABLED=true`: enable email/password after enabling Email in Supabase Auth.
- `KY_AUTH_GOOGLE_ENABLED=true`: show Google only after Google is configured in Supabase Auth.
- `KY_AUTH_APPLE_ENABLED=true`: show Apple only after Apple is configured in Supabase Auth.
- `KY_AUTH_FACEBOOK_ENABLED=true`: show Facebook only after Facebook is configured in Supabase Auth.

Provider flags default to false. The public config endpoint returns only the Supabase URL, public key and flags. Do not add service-role/secret API keys to the browser. Google/Apple/Facebook OAuth client secrets are entered in Supabase Auth provider settings, not in frontend source or this environment file.

## Supabase Auth dashboard

1. Open **Authentication → URL Configuration**.
2. Set **Site URL** to the actual KY web-app origin.
3. Add the exact web-app origin and local development origins to **Redirect URLs**. Include the path/query behavior used by this app, or an appropriately scoped wildcard for development. Do not use a broad production wildcard.
4. Enable **Email** provider and require email confirmation. Configure SMTP/delivery so confirmation and reset emails reliably arrive.
5. In **Authentication → Providers**, configure Google, Apple and Facebook with the credentials described below. Only then set the matching `KY_AUTH_*_ENABLED=true` flag.

The OAuth callback URI to register at each provider is:

```
https://<project-ref>.supabase.co/auth/v1/callback
```

Use the exact callback shown by the Supabase dashboard if the project uses a custom auth domain.

## Google developer console

- Create an OAuth 2.0 client of type **Web application**.
- Add the KY web origin under **Authorized JavaScript origins**.
- Add the Supabase callback URI above under **Authorized redirect URIs**.
- Copy the OAuth **Client ID** and **Client secret** into Supabase Dashboard → Authentication → Providers → Google.
- Do not commit the client secret.

## Apple developer console

- An active Apple Developer Program membership is required.
- Create/configure an **App ID** with **Sign in with Apple** capability.
- Create a **Services ID** for web OAuth; configure its domain and return URL to match the Supabase callback.
- Create a Sign in with Apple key. Record **Team ID**, **Key ID**, and the private `.p8` key.
- Configure the Apple provider in Supabase Auth with the Services ID/client identifier and the generated client secret/JWT using the Team ID, Key ID and private key, following the current Supabase Apple-provider instructions.
- Store the private key securely and rotate the Apple client secret/JWT at least every six months for the web OAuth flow.

## Facebook developer console

- Create/configure a Facebook app and add the **Facebook Login** product for web.
- Set the KY web origin/domain and add the Supabase callback URI under **Valid OAuth Redirect URIs**.
- Copy the **App ID** and **App Secret** into Supabase Dashboard → Authentication → Providers → Facebook.
- Complete the app privacy policy/contact details and any required app review/business verification before public release.

## Manual acceptance checklist

After setting the environment and provider credentials in a dev/staging environment:

- [ ] Open Account and confirm Google, Apple, Facebook and email controls are all on one responsive screen.
- [ ] Verify each provider remains visibly disabled with a short note when its feature flag is off.
- [ ] Complete Google OAuth and return to the same app view.
- [ ] Complete Apple OAuth and return to the same app view, including on iOS Safari/device.
- [ ] Complete Facebook OAuth and return to the same app view.
- [ ] Sign up with email; verify the confirmation email link and successful return.
- [ ] Sign in with email/password; refresh and verify the session persists.
- [ ] Request a password reset, follow the email link, save a new password and sign in.
- [ ] Sign out and verify the session is cleared.
- [ ] Create/use a guest chart and navigate My Chart, Today, Explore, Ask and Library while logged out; confirm the existing journey remains ungated.
- [ ] Inspect source and browser network/config response: no OAuth client secret, Supabase service-role key or secret key is returned to the browser.

Live provider round-trips require real provider credentials and an approved staging deployment; unit tests and JavaScript syntax checks do not substitute for those checks.
