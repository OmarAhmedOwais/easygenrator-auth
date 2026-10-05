# Spec 001: Authentication module (sign up, sign in, protected app page)

|             |                                                                                                                                                                                                                                                             |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Status**  | Implemented                                                                                                                                                                                                                                                 |
| **Author**  | Omar Ahmed Owais                                                                                                                                                                                                                                            |
| **Created** | 2026-10-05                                                                                                                                                                                                                                                  |
| **Source**  | Easygenerator _Full Stack Test Task_ (PDF)                                                                                                                                                                                                                  |
| **Related** | [plan](./plan.md) · [tasks](./tasks.md) · [research](./research.md) · [data model](./data-model.md) · [OpenAPI](./contracts/openapi.json) · ADRs [0002](../../docs/adr/0002-mongodb-with-mongoose.md)–[0007](../../docs/adr/0007-same-origin-deployment.md) |

## 1. Problem & goal

Users need an account to use the application. We need a production-ready module that lets a
person **sign up**, **sign in**, reach an **application page** only while signed in, and **log
out**. It must follow industry security practice on both front end and back end. The task is
meant to take a few hours, so the scope is deliberately tight.

## 2. User stories

- **US-1** As a visitor, I want to create an account with my email, name and a password, so that I can access the application.
- **US-2** As a registered user, I want to sign in with my email and password, so that I can return to the application.
- **US-3** As a signed-in user, I want to see the application page with a welcome message.
- **US-4** As a signed-in user, I want to log out, so that nobody else can use my session on this device.
- **US-5** As a signed-in user, I want to stay signed in when I reload the page.

## 3. Functional requirements

| ID    | Requirement                                                                 | Priority |
| ----- | --------------------------------------------------------------------------- | -------- |
| FR-1  | Sign-up form with **Email**, **Name**, **Password** fields                  | Must     |
| FR-2  | Email must be a valid email format                                          | Must     |
| FR-3  | Name must have **at least 3 characters** (upper bound 50 as a sanity limit) | Must     |
| FR-4  | Password: **≥ 8 characters, ≥ 1 letter, ≥ 1 number, ≥ 1 special character** | Must     |
| FR-5  | The same rules are enforced by the **API** (the client is never trusted)    | Must     |
| FR-6  | An email can only be registered once (case-insensitive)                     | Must     |
| FR-7  | Sign-in form with **Email** and **Password**                                | Must     |
| FR-8  | Application page shows exactly **"Welcome to the application."**            | Must     |
| FR-9  | Application page is only reachable when signed in                           | Must     |
| FR-10 | Logout button that ends the session (optional in the task)                  | Should   |
| FR-11 | At least one **protected API endpoint**                                     | Must     |
| FR-12 | The session survives a page reload                                          | Should   |
| FR-13 | Live feedback on which password rules are met                               | Could    |

## 4. Acceptance criteria

Each criterion maps to at least one automated test (see [tasks.md](./tasks.md) for the mapping).

**Sign up**

- **AC-1** (FR-2, FR-5) Given an invalid email, when I submit sign-up, then the form shows "Please enter a valid email address" and the API answers `400` if called directly.
- **AC-2** (FR-3) Given a name shorter than 3 characters, then the form and the API reject it.
- **AC-3** (FR-4) Given a password missing any one rule (length, letter, number, special), then it is rejected with a message naming the rule.
- **AC-4** (FR-6) Given an email that already exists in any letter case, when I sign up, then I see "already registered" on the email field (API `409`).
- **AC-5** (FR-1) Given valid data, when I sign up, then my account is created, I'm signed in, and I land on the application page.
- **AC-6** (FR-5) Given extra fields in the payload (e.g. `"role": "admin"`), then the API rejects the request (`400`).

**Sign in**

- **AC-7** (FR-7) Given correct credentials, when I sign in, then I land on the page I originally asked for (default `/app`).
- **AC-8** (FR-7) Given a wrong password **or** an unknown email, then I see the same message, "Invalid email or password" (API `401`).
- **AC-9** Given an object instead of a string (e.g. `{ "$gt": "" }`), then the API rejects it with `400` (NoSQL injection).

**Application page & session**

- **AC-10** (FR-8) Given I'm signed in, when I open `/app`, then I see "Welcome to the application." and my name.
- **AC-11** (FR-9) Given I'm signed out, when I open `/app`, then I'm redirected to `/signin`.
- **AC-12** (FR-11) Given no or an invalid access token, `GET /api/users/me` answers `401`. With a valid one it returns my profile without any secret fields.
- **AC-13** (FR-12) Given I'm signed in, when I reload, then I'm still signed in.
- **AC-14** (FR-10) Given I'm signed in, when I log out, then I'm sent to `/signin` and my refresh token no longer works on the server.
- **AC-15** Given a refresh token that was already used (replayed), then the API answers `401` and revokes the session.

## 5. Non-functional requirements

| ID     | Category        | Requirement                                                                                                   |
| ------ | --------------- | ------------------------------------------------------------------------------------------------------------- |
| NFR-1  | Security        | Passwords hashed with a memory-hard KDF (argon2id). Hashes and tokens never appear in responses or logs       |
| NFR-2  | Security        | No account enumeration via messages or timing on sign-in                                                      |
| NFR-3  | Security        | Brute-force protection on auth endpoints (rate limit)                                                         |
| NFR-4  | Security        | Long-lived credentials not readable by JavaScript (httpOnly cookie). CSRF-safe (SameSite=Strict, path-scoped) |
| NFR-5  | Security        | Standard security headers (Helmet / nginx CSP)                                                                |
| NFR-6  | Reliability     | Config validated at boot. Health endpoint for orchestration                                                   |
| NFR-7  | Observability   | Structured logs with a request id, returned as `x-request-id`                                                 |
| NFR-8  | Accessibility   | Labelled inputs, errors announced (`role="alert"`, `aria-invalid`, `aria-describedby`), keyboard usable       |
| NFR-9  | UX              | Responsive from 360 px. Loading states on submit                                                              |
| NFR-10 | Maintainability | TypeScript strict on both sides, lint-clean, tests at every layer, git-hook quality gates                     |
| NFR-11 | API docs        | OpenAPI/Swagger generated from code                                                                           |

## 6. Edge cases & error states

- Leading/trailing spaces in email or name are trimmed. Email is lower-cased before storage and lookup.
- Two concurrent sign-ups with the same email: the unique index guarantees one `201` and one `409`.
- Two concurrent refreshes (StrictMode double effect, two tabs): serialised on the client; on the server a compare-and-swap ensures at most one wins.
- Access token expired mid-session: the client refreshes once, replays the request, and falls back to sign-in if the refresh fails.
- API down or unreachable: a friendly message, no crash. `429` and `5xx` get dedicated messages.
- A token for a deleted user: `404` from `/users/me`, never a `500`.

## 7. Out of scope / non-goals

Email verification, password reset, account lockout, multi-device session management, OAuth/SSO,
roles/permissions, account deletion, i18n. These are listed as next steps in the README.

## 8. Open questions

- [x] React or Vue? **React** (team stack in the reference projects; see research R-1).
- [x] ORM? **Mongoose** ([ADR-0002](../../docs/adr/0002-mongodb-with-mongoose.md)).
- [x] Token transport? **Memory + httpOnly refresh cookie** ([ADR-0003](../../docs/adr/0003-token-strategy-access-in-memory-refresh-cookie.md)).
