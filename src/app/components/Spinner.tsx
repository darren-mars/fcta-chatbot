const Spinner = () => {
  return (
    <div className="flex space-x-1 p-2">
      <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-200"></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-200"></div>
      <div className="h-2 w-2 animate-pulse rounded-full bg-zinc-200"></div>
    </div>
  );
};

export default Spinner;
