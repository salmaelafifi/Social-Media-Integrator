export default function Loader() {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-8 border-yellow-300"></div>
        <div className="absolute inset-0 rounded-full h-16 w-16 blur-md bg-pink-500 opacity-40"></div>
      </div>
    </div>
  );
}
