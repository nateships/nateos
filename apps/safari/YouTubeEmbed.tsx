'use client'

export function YouTubeEmbed({ videoId, label }: { videoId: string; label: string }) {
  return (
    <div className="h-full w-full bg-black flex flex-col">
      <iframe
        src={`https://www.youtube.com/embed/${encodeURIComponent(videoId)}?rel=0`}
        title={label}
        className="flex-1 w-full border-0"
        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
