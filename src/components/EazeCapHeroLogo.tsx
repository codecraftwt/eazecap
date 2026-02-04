const EazeCapHeroLogo = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`flex flex-col items-center ${className}`}>
      {/* Logo with pyramid icon */}
      <div className="flex items-center gap-0.5 sm:gap-1">
        <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[hsl(222,47%,20%)]">
          E
        </span>
        {/* Pyramid Icon */}
        <svg 
          viewBox="0 0 40 36" 
          className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 -mx-0.5"
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
        <span className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[hsl(222,47%,20%)]">
          ZECAP
        </span>
      </div>
    </div>
  );
};

export default EazeCapHeroLogo;
