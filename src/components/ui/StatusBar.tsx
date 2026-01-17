export default function StatusBar() {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-2 pb-1 text-xs">
        <span className="text-black">{currentTime}</span>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            <div className="h-1 w-1 rounded-full bg-black"></div>
            <div className="h-1 w-1 rounded-full bg-black"></div>
            <div className="h-1 w-1 rounded-full bg-black"></div>
          </div>
          <svg className="h-3 w-3 text-black" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
          </svg>
          <span className="text-black">50</span>
        </div>
      </div>
      <div className="px-4 pb-2 text-xs text-gray-600">usp-services.com</div>
    </>
  );
}
