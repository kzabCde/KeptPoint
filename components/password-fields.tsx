"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";

export function PasswordFields({ locale }: { locale: "th" | "en" }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const th = locale === "th";

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  const strengthText = [
    th ? "เริ่มพิมพ์รหัสผ่าน" : "Start typing a password",
    th ? "พอใช้" : "Fair",
    th ? "ดี" : "Good",
    th ? "แข็งแรง" : "Strong",
    th ? "แข็งแรงมาก" : "Very strong",
  ][strength];

  return (
    <div className="grid gap-4">
      <label className="grid gap-2 text-sm font-semibold">
        {th ? "รหัสผ่านใหม่" : "New password"}
        <div className="cute-input flex items-center gap-2 px-4">
          <LockKeyhole className="size-4 shrink-0 text-emerald-600" />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            required
            className="h-12 min-w-0 flex-1 bg-transparent outline-none"
            placeholder={th ? "อย่างน้อย 8 ตัวอักษร" : "At least 8 characters"}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="grid size-10 shrink-0 place-items-center rounded-full text-zinc-500 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:hover:bg-emerald-950/40"
            aria-label={showPassword ? (th ? "ซ่อนรหัสผ่าน" : "Hide password") : (th ? "แสดงรหัสผ่าน" : "Show password")}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>

      <div>
        <div className="grid grid-cols-4 gap-1.5" aria-hidden="true">
          {[1, 2, 3, 4].map((item) => (
            <span
              key={item}
              className={`h-1.5 rounded-full transition ${item <= strength ? "bg-emerald-500" : "bg-zinc-200 dark:bg-zinc-800"}`}
            />
          ))}
        </div>
        <p className="mt-2 text-xs text-zinc-500">{strengthText} · {th ? "แนะนำให้ใช้ตัวพิมพ์ใหญ่ ตัวเลข หรือสัญลักษณ์ร่วมด้วย" : "Mix uppercase letters, numbers or symbols for a stronger password."}</p>
      </div>

      <label className="grid gap-2 text-sm font-semibold">
        {th ? "ยืนยันรหัสผ่าน" : "Confirm password"}
        <div className="cute-input flex items-center gap-2 px-4">
          <LockKeyhole className="size-4 shrink-0 text-emerald-600" />
          <input
            name="confirmPassword"
            type={showConfirm ? "text" : "password"}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            required
            className="h-12 min-w-0 flex-1 bg-transparent outline-none"
            placeholder={th ? "พิมพ์รหัสผ่านอีกครั้ง" : "Repeat your password"}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((value) => !value)}
            className="grid size-10 shrink-0 place-items-center rounded-full text-zinc-500 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 dark:hover:bg-emerald-950/40"
            aria-label={showConfirm ? (th ? "ซ่อนรหัสผ่านยืนยัน" : "Hide confirmation") : (th ? "แสดงรหัสผ่านยืนยัน" : "Show confirmation")}
          >
            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </label>

      {confirm && password !== confirm && (
        <p role="alert" className="text-sm font-medium text-rose-600 dark:text-rose-300">
          {th ? "รหัสผ่านทั้งสองช่องยังไม่ตรงกัน" : "The passwords do not match yet."}
        </p>
      )}
    </div>
  );
}
