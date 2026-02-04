const EazeLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <span className="text-2xl font-bold tracking-tight text-[hsl(222,47%,20%)]">
        E
      </span>
      {/* Pyramid Icon */}
      <svg 
        viewBox="0 0 40 36" 
        className="w-5 h-5 -mx-0.5"
        fill="none"
      >
        {/* Left face - darker */}
        <polygon 
          points="20,0 0,36 20,28" 
          fill="hsl(222, 47%, 25%)"
        />
        {/* Right face - lighter purple */}
        <polygon 
          points="20,0 40,36 20,28" 
          fill="hsl(240, 35%, 55%)"
        />
        {/* Bottom face - medium */}
        <polygon 
          points="0,36 40,36 20,28" 
          fill="hsl(240, 30%, 65%)"
        />
      </svg>
      <span className="text-2xl font-bold tracking-tight text-[hsl(222,47%,20%)]">
        ZECAP
      </span>
    </div>
  );
};

export default EazeLogo;
