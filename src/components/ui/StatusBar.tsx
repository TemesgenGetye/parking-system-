export default function StatusBar() {
  const currentTime = new Date().toLocaleTimeString('en-ET', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-2 pb-1 text-xs">
        <span className="text-black">{currentTime}</span>
      </div>
    
    </>
  );
}
