import { Link } from "react-router-dom";
import { Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import EazeLogo from "@/components/EazeLogo";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

const Success = () => {
  useScrollToTop();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/">
            <EazeLogo className="h-12" />
          </Link>
          <a href="mailto:docs@eazeconsulting.com" className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Need help? Contact Us</span>
          </a>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-8">
            <Check className="w-12 h-12 text-success" />
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-4">Application Submitted!</h1>
          
          <p className="text-muted-foreground mb-8">
            Thank you for your application. Our team will review your information and contact you within 24 hours.
          </p>

          <div className="space-y-4">
            <div className="bg-muted rounded-xl p-4 text-sm">
              <p className="text-foreground font-medium mb-1">What happens next?</p>
              <ul className="text-muted-foreground text-left space-y-2">
                <li>• Our team reviews your application</li>
                <li>• We'll contact you within 24 hours</li>
                <li>• You'll receive loan offers to review</li>
                <li>• Choose the best option for you</li>
                <li>• Get approved</li>
                <li>• Receive funds</li>
              </ul>
            </div>

            <p className="text-sm text-muted-foreground">
              Questions? Contact us at{" "}
              <a href="mailto:docs@eazeconsulting.com" className="text-primary font-medium hover:underline">
                docs@eazeconsulting.com
              </a>
            </p>

            <Link to="/">
              <Button variant="outline" className="mt-4">
                Return to Home
              </Button>
            </Link>
          </div>
        </div>
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

export default Success;
