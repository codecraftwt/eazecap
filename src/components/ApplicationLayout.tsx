import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import EazeLogo from "./EazeLogo";

interface ApplicationLayoutProps {
  children: ReactNode;
  currentStep: number;
  totalSteps?: number;
}

const ApplicationLayout = ({ children, currentStep, totalSteps = 7 }: ApplicationLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <EazeLogo className="h-12" />
          </Link>
          <a 
            href="mailto:docs@eazeconsulting.com" 
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Need help? Contact Us</span>
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-4 sm:py-6 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1">EazeCap</h1>
          <p className="text-sm sm:text-base text-primary-foreground/80">Apply for a personal loan with confidence.</p>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="bg-card border-b border-border py-3 px-2 sm:py-4 sm:px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center gap-1 sm:gap-2">
                <div 
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors ${
                    i + 1 < currentStep 
                      ? 'bg-accent text-accent-foreground' 
                      : i + 1 === currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`w-4 sm:w-12 h-0.5 sm:h-1 rounded ${i + 1 < currentStep ? 'bg-accent' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">{currentStep} of {totalSteps}</p>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-muted py-6 px-4 border-t border-border">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} EAZE Consulting. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ApplicationLayout;
