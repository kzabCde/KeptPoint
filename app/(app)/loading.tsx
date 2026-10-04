export default function AppLoading() {
  return (
    <main className="px-5 py-6" aria-busy="true" aria-label="Loading KeptPoint">
      <div className="flex items-center justify-between"><div className="h-10 w-36 animate-pulse rounded-2xl bg-zinc-200/80 dark:bg-white/10"/><div className="size-11 animate-pulse rounded-full bg-zinc-200/80 dark:bg-white/10"/></div>
      <div className="mt-7 h-52 animate-pulse rounded-[30px] bg-mint-soft"/>
      <div className="mt-7 grid grid-cols-4 gap-2">{Array.from({length:4},(_,index)=><div key={index} className="h-20 animate-pulse rounded-[22px] bg-zinc-200/60 dark:bg-white/5"/>)}</div>
      <div className="mt-8 h-5 w-28 animate-pulse rounded-full bg-zinc-200/80 dark:bg-white/10"/>
      <div className="mt-3 grid gap-3">{Array.from({length:2},(_,index)=><div key={index} className="h-44 animate-pulse rounded-[26px] bg-zinc-200/60 dark:bg-white/5"/>)}</div>
    </main>
  );
}
