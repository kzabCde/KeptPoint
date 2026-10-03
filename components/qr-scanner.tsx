"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CameraOff, CheckCircle2 } from "lucide-react";
import { acceptQrToken } from "@/app/actions/loyalty";

type Detector = { detect(source: HTMLVideoElement): Promise<Array<{ rawValue?: string }>> };
type DetectorCtor = new (options: { formats: string[] }) => Detector;

function extractToken(raw: string) {
  try {
    const url=new URL(raw);
    return url.searchParams.get("token") || url.searchParams.get("qr") || raw;
  } catch {
    return raw.trim();
  }
}

export function QrScanner({ initialToken="", locale }: { initialToken?: string; locale: "th"|"en" }) {
  const videoRef=useRef<HTMLVideoElement>(null);
  const streamRef=useRef<MediaStream|null>(null);
  const frameRef=useRef<number|null>(null);
  const [token,setToken]=useState(initialToken);
  const [running,setRunning]=useState(false);
  const [message,setMessage]=useState("");
  const th=locale==="th";

  function stop(){
    if(frameRef.current) cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach(track=>track.stop());
    streamRef.current=null;
    setRunning(false);
  }

  useEffect(()=>()=>stop(),[]);

  async function start(){
    setMessage("");
    const DetectorClass=(window as unknown as {BarcodeDetector?:DetectorCtor}).BarcodeDetector;
    if(!DetectorClass){
      setMessage(th?"เบราว์เซอร์นี้ยังไม่รองรับตัวอ่าน QR ในตัว กรุณาวางโทเคนด้านล่าง":"This browser does not support native QR scanning. Paste the token below.");
      return;
    }
    try{
      const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:"environment"}},audio:false});
      streamRef.current=stream;
      const video=videoRef.current;
      if(!video) return;
      video.srcObject=stream;
      await video.play();
      setRunning(true);
      const detector=new DetectorClass({formats:["qr_code"]});
      const scan=async()=>{
        if(!videoRef.current||!streamRef.current) return;
        try{
          const codes=await detector.detect(videoRef.current);
          const raw=codes[0]?.rawValue;
          if(raw){
            setToken(extractToken(raw));
            setMessage(th?"อ่าน QR สำเร็จ ตรวจสอบแล้วกดยืนยัน":"QR detected. Review and confirm below.");
            stop();
            return;
          }
        }catch{}
        frameRef.current=requestAnimationFrame(scan);
      };
      frameRef.current=requestAnimationFrame(scan);
    }catch{
      setMessage(th?"ไม่สามารถเปิดกล้องได้ กรุณาอนุญาตสิทธิ์กล้องหรือวางโทเคนแทน":"Camera could not be opened. Allow camera access or paste a token.");
      stop();
    }
  }

  return <div className="mt-8">
    <div className="relative aspect-square overflow-hidden rounded-[32px] border border-emerald-900/20 bg-[radial-gradient(circle_at_top,#0a5d50,#062f2a_62%)] shadow-xl shadow-emerald-950/10">
      <video ref={videoRef} playsInline muted className={"h-full w-full object-cover " + (running?"block":"hidden")}/>
      {!running&&<div className="grid h-full place-items-center p-6 text-center text-white"><div><Camera className="mx-auto size-14 text-emerald-300"/><p className="mx-auto mt-4 max-w-xs text-sm leading-6 text-white/70">{th?"ใช้กล้องหลังเพื่ออ่าน KeptPoint QR หรือวางโทเคนด้วยตนเอง":"Use the rear camera to scan a KeptPoint QR, or paste the token manually."}</p><button type="button" onClick={start} className="mt-5 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-emerald-950">{th?"เปิดกล้อง":"Open camera"}</button></div></div>}
      {running&&<button type="button" onClick={stop} className="absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-semibold text-white backdrop-blur"><CameraOff className="size-4"/>{th?"ปิดกล้อง":"Stop"}</button>}
    </div>
    {message&&<p className="mt-3 rounded-2xl bg-zinc-100 px-4 py-3 text-sm leading-6 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">{message}</p>}
    <form action={acceptQrToken} className="mt-5 grid gap-3">
      <label className="grid gap-2 text-sm font-medium">QR token<input name="token" value={token} onChange={e=>setToken(e.target.value)} required minLength={16} maxLength={256} placeholder={th?"วาง QR token":"Paste QR token"} className="h-12 min-w-0 rounded-2xl border border-zinc-200 bg-white px-4 text-sm outline-none focus:border-emerald-500 dark:border-zinc-800 dark:bg-zinc-900"/></label>
      <button className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 font-semibold text-white dark:bg-emerald-400 dark:text-emerald-950"><CheckCircle2 className="size-4"/>{th?"ยืนยัน QR":"Accept QR"}</button>
    </form>
  </div>;
}
