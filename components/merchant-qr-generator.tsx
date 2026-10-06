"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, QrCode, RefreshCw } from "lucide-react";
import QRCode from "qrcode";
import { createQrSession } from "@/app/actions/loyalty";
import { qrEntryPath } from "@/lib/share-links";

type QrAction = "join" | "earn_points" | "earn_stamp";

export function MerchantQrGenerator({ programId, programType, locale }: { programId: string; programType: string; locale: "th" | "en" }) {
  const th = locale === "th";
  const [action, setAction] = useState<QrAction>(programType === "stamps" ? "earn_stamp" : "earn_points");
  const [amount, setAmount] = useState(1);
  const [dataUrl, setDataUrl] = useState("");
  const [scanUrl, setScanUrl] = useState("");
  const [expiresAt, setExpiresAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setDataUrl("");
    setScanUrl("");
    setExpiresAt(0);
    setSecondsLeft(0);
    setCopied(false);
    setError("");
  }, [action, amount]);

  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  async function generate() {
    setBusy(true);
    setError("");
    setCopied(false);
    try {
      const result = await createQrSession(programId, action, action === "join" ? undefined : amount) as { token?: string; expires_in?: number } | null;
      if (!result?.token) throw new Error("QR token was not returned");

      const url = new URL(qrEntryPath(result.token), window.location.origin).toString();
      const image = await QRCode.toDataURL(url, {
        width: 360,
        margin: 2,
        errorCorrectionLevel: "Q",
        color: { dark: "#0F2D46", light: "#FFFFFFFF" },
      });
      const ttl = Number(result.expires_in ?? (action === "join" ? 3600 : 90));
      setScanUrl(url);
      setDataUrl(image);
      setExpiresAt(Date.now() + ttl * 1000);
    } catch {
      setDataUrl("");
      setScanUrl("");
      setError(th ? "สร้าง QR ไม่สำเร็จ กรุณาตรวจสิทธิ์ของบัญชีและการตั้งค่าโปรแกรมแล้วลองใหม่" : "Could not create the QR. Check your program permissions and settings, then try again.");
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!scanUrl || secondsLeft <= 0) return;
    await navigator.clipboard.writeText(scanUrl);
    setCopied(true);
  }

  const options: Array<{ value: QrAction; label: string; allowed: boolean }> = [
    { value: "earn_points", label: th ? "ให้แต้ม" : "Award points", allowed: programType !== "stamps" },
    { value: "earn_stamp", label: th ? "ให้สแตมป์" : "Add stamp", allowed: programType !== "points" },
    { value: "join", label: th ? "เข้าร่วมโปรแกรม" : "Join program", allowed: true },
  ];

  const expiryLabel = action === "join"
    ? (th ? "QR เข้าร่วมมีอายุสูงสุด 60 นาที เพื่อให้ลูกค้ามีเวลาสมัครและยืนยันอีเมล" : "Join QR codes last up to 60 minutes so new customers can sign up and verify email.")
    : (th ? "QR รับแต้ม/สแตมป์มีอายุ 90 วินาทีและใช้ได้ครั้งเดียว" : "Points/stamp QR codes expire after 90 seconds and can be used once.");

  return <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr]">
    <section className="cute-card p-5 shadow-none">
      <h2 className="font-semibold">{th ? "ตั้งค่า QR" : "QR setup"}</h2>
      <p className="mt-1 text-sm leading-6 text-slate-500">{expiryLabel}</p>
      <label className="mt-5 grid gap-2 text-sm font-semibold">{th ? "การทำงาน" : "Action"}<select value={action} onChange={(event) => setAction(event.target.value as QrAction)} className="cute-input h-12 px-3 outline-none">{options.filter((option) => option.allowed).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
      {action !== "join" && <label className="mt-4 grid gap-2 text-sm font-semibold">{action === "earn_points" ? (th ? "จำนวนแต้ม" : "Points") : (th ? "จำนวนสแตมป์" : "Stamps")}<input value={amount} onChange={(event) => setAmount(Math.max(1, Number(event.target.value) || 1))} type="number" min="1" max={action === "earn_points" ? 1000000 : 100} className="cute-input h-12 px-4 outline-none" /></label>}
      <button type="button" onClick={generate} disabled={busy} className="cute-primary mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl font-bold disabled:opacity-50">{busy ? <RefreshCw className="size-4 animate-spin" /> : <QrCode className="size-4" />}{dataUrl ? (th ? "สร้าง QR ใหม่" : "Generate new QR") : (th ? "สร้าง QR" : "Generate QR")}</button>
      {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-200">{error}</p>}
    </section>

    <section className="cute-card grid min-h-[390px] place-items-center p-6 text-center shadow-none">
      {!dataUrl ? <div><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-[#E6FAF6] text-[#087F6E]"><QrCode className="size-8" /></span><h2 className="mt-4 font-semibold">{th ? "QR จะปรากฏตรงนี้" : "Your QR will appear here"}</h2><p className="mt-2 text-sm text-slate-500">{th ? "QR ที่สร้างจะเป็นลิงก์ PumpPoint จริง ลูกค้าสแกนด้วยกล้องมือถือทั่วไปได้" : "Generated codes contain a real PumpPoint link and can be scanned with a normal phone camera."}</p></div> : <div className="w-full max-w-sm">
        <div className={`mx-auto w-fit rounded-[20px] border bg-white p-3 shadow-sm ${secondsLeft === 0 ? "opacity-40 grayscale" : "border-slate-200"}`}><Image src={dataUrl} alt={th ? "QR สำหรับลูกค้าสแกน" : "Customer scan QR"} width={300} height={300} unoptimized /></div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2"><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${secondsLeft > 15 ? "bg-[#E6FAF6] text-[#087F6E]" : "bg-amber-100 text-amber-700"}`}>{secondsLeft > 0 ? (th ? `หมดอายุใน ${secondsLeft} วินาที` : `Expires in ${secondsLeft}s`) : (th ? "QR หมดอายุแล้ว" : "QR expired")}</span><button type="button" onClick={copyLink} disabled={secondsLeft <= 0} className="cute-secondary inline-flex min-h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold disabled:opacity-40">{copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}{copied ? (th ? "คัดลอกแล้ว" : "Copied") : (th ? "คัดลอกลิงก์" : "Copy link")}</button></div>
        {scanUrl && <a href={scanUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[#087F6E]"><ExternalLink className="size-3.5"/>{th ? "ทดสอบเปิดลิงก์ QR" : "Test QR link"}</a>}
        <p className="mt-3 text-[11px] leading-5 text-slate-500">{action === "join" ? (th ? "เมื่อลูกค้าสแกน ระบบจะพา Login/Signup แล้วกลับมารับสิทธิ์จาก QR เดิม" : "Scanning preserves the QR through sign-in/signup so the customer can finish joining.") : (th ? "แต้ม/สแตมป์จะถูกให้เฉพาะสมาชิกที่ active และ QR ใช้ซ้ำไม่ได้" : "Points/stamps are awarded only to active members and the QR cannot be reused.")}</p>
      </div>}
    </section>
  </div>;
}
