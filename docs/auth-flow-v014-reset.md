# KeptPoint v0.1.4 auth reset

Target flow:

1. Create account with Username + Email + Password.
2. Verify the new account with the signup confirmation email link.
3. Continue to Home.
4. Sign out.
5. Sign in with Email + Password without sending an email.
6. Forgot Password sends a recovery link.
7. Reset Password sets a new password.
8. Sign in with the new password.
9. Settings → Security → Change Password.

Magic Link sign-in is intentionally not part of the product. Email links are reserved for account verification and password recovery.
