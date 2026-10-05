# Functional Requirements Document (FRD)

Source: *Full Stack Test Task* (Easygenerator). Status column reflects this repository.

## 1. Sign up

| # | Requirement | Status |
|---|---|---|
| F1.1 | Form with **Email**, **Name**, **Password** | Done |
| F1.2 | Email must be a valid format | Done (client zod + server class-validator) |
| F1.3 | Name minimum 3 characters | Done (max 50 added as a sanity bound) |
| F1.4 | Password ≥ 8 chars, ≥ 1 letter, ≥ 1 number, ≥ 1 special character | Done, with a live checklist |
| F1.5 | Duplicate email is rejected with a clear message | Done (409 → shown on the email field) |
| F1.6 | Successful sign-up signs the user in and opens the application page | Done |

## 2. Sign in

| # | Requirement | Status |
|---|---|---|
| F2.1 | Form with **Email** and **Password** | Done |
| F2.2 | Wrong email *or* password → one generic error (no account enumeration) | Done |
| F2.3 | After sign-in, return to the page the user originally requested | Done |

## 3. Application page

| # | Requirement | Status |
|---|---|---|
| F3.1 | Shows **"Welcome to the application."** | Done |
| F3.2 | (Optional) Logout button that ends the session | Done (server-side revocation, not just client) |
| F3.3 | Only reachable when signed in; otherwise redirect to sign in | Done |
| F3.4 | Session survives a page reload | Done (refresh cookie) |

## 4. Non-functional

- **Security:** hashed passwords, short-lived tokens, rate-limited auth endpoints, no secrets in responses or logs.
- **Accessibility:** labelled inputs, `aria-invalid`/`aria-describedby` on errors, keyboard-only usable, password visibility toggle.
- **Responsive:** split-screen on desktop, single column on mobile.
- **Observability:** structured JSON logs with request ids; health endpoint.

## 5. Out of scope (possible next steps)

Email verification, password reset, "remember me", multi-device session list, OAuth/SSO, account deletion.
