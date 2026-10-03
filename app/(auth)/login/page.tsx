import { loginWithEmail, loginWithGoogle, sendMagicLink, signUpWithEmail } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { getLocale } from "@/lib/preferences";
import { messages } from "@/lib/i18n";

export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const locale = await getLocale();
  const m = messages[locale].login;
  return (
    <main className="mx-auto flex min-h-dvh max-w-md items-center px-5 py-10">
      <div className="w-full">
        <Brand />
        <h1 className="mt-10 text-4xl font-semibold tracking-[-0.05em]">{m.title}</h1>
        <p className="mt-2 text-zinc-500">{m.tagline}</p>
        <form className="mt-8 grid gap-3">
          <input name="email" type="email" required placeholder={m.email} className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"/>
          <input name="password" type="password" minLength={8} placeholder={m.password} className="h-12 rounded-2xl border border-zinc-200 bg-white px-4 outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"/>
          <button formAction={loginWithEmail} className="h-12 rounded-2xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700 dark:bg-emerald-400 dark:text-emerald-950">{m.signIn}</button>
          <button formAction={signUpWithEmail} className="h-12 rounded-2xl border border-zinc-200 font-semibold dark:border-zinc-800">{m.createAccount}</button>
          <button formAction={sendMagicLink} className="h-12 rounded-2xl border border-zinc-200 font-semibold dark:border-zinc-800">{m.magic}</button>
          <button formAction={loginWithGoogle} className="h-12 rounded-2xl border border-zinc-200 font-semibold dark:border-zinc-800">{m.google}</button>
        </form>
      </div>
    </main>
  );
}
