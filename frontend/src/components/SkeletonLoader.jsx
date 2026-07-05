function Bone({ className = "" }) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-lg bg-slate-700/50
        before:absolute before:inset-0
        before:bg-gradient-to-r
        before:from-transparent before:via-slate-600/30 before:to-transparent
        before:animate-shimmer before:bg-[length:200%_100%]
        ${className}
      `}
    />
  );
}

function SectionHead() {
  return (
    <div className="flex items-center gap-3 mb-3">
      <Bone className="w-5 h-5 rounded-full" />
      <Bone className="h-3 w-28" />
    </div>
  );
}

export default function SkeletonLoader({ rightOnly = false }) {
  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">

      {/* ── LEFT COLUMN ────────────────────────────────────── */}
      {!rightOnly && (
        <div className="lg:w-2/5 space-y-5">

          {/* Company + role block */}
          <div className="card p-5 space-y-4">
            <Bone className="h-3 w-20" />                    {/* "Company" label */}
            <Bone className="h-6 w-48" />                    {/* Company name */}
            <Bone className="h-3 w-16 mt-2" />               {/* "Role" label */}
            <Bone className="h-5 w-64" />                    {/* Job title */}

            {/* Status badge */}
            <div className="flex items-center gap-2 mt-2">
              <Bone className="h-6 w-24 rounded-full" />
            </div>
          </div>

          {/* Applied date + salary block */}
          <div className="card p-5 space-y-3">
            <SectionHead />
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Bone className="h-3 w-20" />
                <Bone className="h-5 w-28" />
              </div>
              <div className="space-y-2">
                <Bone className="h-3 w-20" />
                <Bone className="h-5 w-24" />
              </div>
            </div>
          </div>

          {/* Notes block */}
          <div className="card p-5 space-y-3">
            <SectionHead />
            <Bone className="h-3 w-full" />
            <Bone className="h-3 w-5/6" />
            <Bone className="h-3 w-4/5" />
          </div>

          {/* Analyse button skeleton */}
          <Bone className="h-11 w-full rounded-xl" />
        </div>
      )}

      {/* ── RIGHT COLUMN ───────────────────────────────────── */}
      <div className="lg:flex-1 space-y-5">

        {/* Score gauge placeholder */}
        <div className="card p-6 flex flex-col items-center gap-4">
          <Bone className="h-3 w-32 mb-2" />
          {/* Circle */}
          <div className="relative w-40 h-40">
            <Bone className="w-40 h-40 rounded-full" />
            {/* Inner circle cutout */}
            <div className="absolute inset-5 rounded-full bg-slate-800" />
          </div>
          <Bone className="h-3 w-24" />
        </div>

        {/* Dos card skeleton */}
        <div className="card p-5 space-y-3">
          <SectionHead />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <Bone className="w-4 h-4 rounded-full mt-0.5 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Bone className={`h-3 ${i === 1 ? "w-4/5" : "w-full"}`} />
                {i === 0 && <Bone className="h-3 w-3/5" />}
              </div>
            </div>
          ))}
        </div>

        {/* Don'ts card skeleton */}
        <div className="card p-5 space-y-3">
          <SectionHead />
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <Bone className="w-4 h-4 rounded-full mt-0.5 shrink-0" />
              <Bone className={`flex-1 h-3 ${i === 0 ? "w-full" : "w-4/5"}`} />
            </div>
          ))}
        </div>

        {/* Missing keywords cloud skeleton */}
        <div className="card p-5 space-y-3">
          <SectionHead />
          <div className="flex flex-wrap gap-2">
            {[80, 64, 96, 56, 72, 88, 60, 76].map((w, i) => (
              <Bone key={i} className={`h-7 rounded-full`} style={{ width: `${w}px` }} />
            ))}
          </div>
        </div>

        {/* Tailoring suggestions skeleton */}
        <div className="card p-5 space-y-3">
          <SectionHead />
          {[...Array(4)].map((_, i) => {
            const widths = ["w-full", "w-11/12", "w-5/6", "w-2/3"];
            return <Bone key={i} className={`h-3 ${widths[i]}`} />;
          })}
        </div>
      </div>
    </div>
  );
}
