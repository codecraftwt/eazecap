import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useApplicationStore, FormData } from "@/store/applicationStore";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, Check, Mail, ArrowLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import EazeLogo from "@/components/EazeLogo";

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa",
  "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan",
  "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire",
  "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
  "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota",
  "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia",
  "Wisconsin", "Wyoming"
];

const NON_FUNDED_STATES = [
  "Montana", "New York", "Delaware", "Indiana", "Mississippi", 
  "California", "Nevada", "West Virginia", "Connecticut", "Washington", "Maine"
];

const EMPLOYEE_TYPES = [
  { value: "w2", label: "W2 Employee" },
  { value: "self", label: "Self Employed" },
  { value: "retired", label: "Retired" },
] as const;

const PreQualify = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { formData, updateFormData, setCurrentStep } = useApplicationStore();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  // Scroll to top and check for bus_code/disclaimer trigger
  useEffect(() => {
    // Scroll both #root (mobile) and window
    const root = document.getElementById("root");
    if (root) root.scrollTo(0, 0);
    window.scrollTo(0, 0);
    
    const busCode = searchParams.get('bus_code');
    if (busCode && !formData.businessAccountId) {
      updateFormData('businessAccountId', busCode);
    }
    
    // Show disclaimer if coming from Apply Now - always show on fresh navigation
    const fromApplyButton = searchParams.get('apply') === 'true';
    
    if (fromApplyButton) {
      setShowDisclaimer(true);
    }
  }, [searchParams, formData.businessAccountId, updateFormData]);

  const handleDisclaimerAccept = () => {
    sessionStorage.setItem('eazecap-disclaimer-accepted', 'true');
    setShowDisclaimer(false);
  };

  const isW2 = formData.employeeType === 'w2';
  const isSelfEmployed = formData.employeeType === 'self';
  const isRetired = formData.employeeType === 'retired';

  // Check eligibility answers
  const w2Eligible = isW2 && 
    formData.hasCheckingAccount === true &&
    formData.hasValidId === true &&
    formData.hasPayStubs === true &&
    formData.hasReferences === true;

  const selfEmployedEligible = isSelfEmployed &&
    formData.hasCheckingAccount === true &&
    formData.hasDriversLicense === true &&
    formData.hasBankStatements === true &&
    formData.hasTaxReturns === true &&
    formData.hasSeparateReferences === true;

  // Retired uses same eligibility as self-employed
  const retiredEligible = isRetired &&
    formData.hasCheckingAccount === true &&
    formData.hasDriversLicense === true &&
    formData.hasBankStatements === true &&
    formData.hasTaxReturns === true &&
    formData.hasSeparateReferences === true;

  const isEligible = w2Eligible || selfEmployedEligible || retiredEligible;
  
  // Check if all questions are answered
  const w2QuestionsAnswered = isW2 &&
    formData.hasCheckingAccount !== null &&
    formData.hasValidId !== null &&
    formData.hasPayStubs !== null &&
    formData.hasReferences !== null;

  const selfQuestionsAnswered = isSelfEmployed &&
    formData.hasCheckingAccount !== null &&
    formData.hasDriversLicense !== null &&
    formData.hasBankStatements !== null &&
    formData.hasTaxReturns !== null &&
    formData.hasSeparateReferences !== null;

  const retiredQuestionsAnswered = isRetired &&
    formData.hasCheckingAccount !== null &&
    formData.hasDriversLicense !== null &&
    formData.hasBankStatements !== null &&
    formData.hasTaxReturns !== null &&
    formData.hasSeparateReferences !== null;

  const allQuestionsAnswered = w2QuestionsAnswered || selfQuestionsAnswered || retiredQuestionsAnswered;
  
  // Check if state is fundable
  const isStateEligible = formData.state === '' || !NON_FUNDED_STATES.includes(formData.state);
  
  // Validation: all basic fields required + eligibility questions answered + state eligible
  const basicFieldsValid = 
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.state !== '' &&
    formData.loanAmount !== '' &&
    formData.employeeType !== '';
  
  const isValid = basicFieldsValid && allQuestionsAnswered && isEligible && isStateEligible;

  const handleContinue = () => {
    setCurrentStep(1);
    navigate('/apply');
  };

  const YesNoButtons = ({ field, value }: { field: keyof FormData; value: boolean | null }) => (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={() => updateFormData(field, true)}
        className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
          value === true
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-foreground hover:border-primary/50"
        }`}
      >
        Yes
      </button>
      <button
        type="button"
        onClick={() => updateFormData(field, false)}
        className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
          value === false
            ? "border-destructive bg-destructive text-destructive-foreground"
            : "border-border bg-card text-foreground hover:border-destructive/50"
        }`}
      >
        No
      </button>
    </div>
  );

  return (
    <>
      {/* Disclaimer Modal */}
      <Dialog open={showDisclaimer} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-lg w-[calc(100%-2rem)] max-h-[80vh] overflow-y-auto p-4 sm:p-6 rounded-xl" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-base sm:text-xl font-bold">
              Important Disclaimer
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-muted-foreground py-2 sm:py-4">
            <p className="text-xs sm:text-sm">
              By proceeding with your loan application, you acknowledge and agree to the following:
            </p>
            <ul className="list-disc pl-4 space-y-1.5 sm:space-y-2 text-xs sm:text-sm">
              <li>
                <strong className="text-foreground">Credit Check:</strong> You authorize a soft credit inquiry. This will not affect your credit score.
              </li>
              <li>
                <strong className="text-foreground">Accuracy:</strong> All information must be accurate. False information may result in denial.
              </li>
              <li>
                <strong className="text-foreground">Privacy:</strong> Your information will be securely stored and shared with lending partners.
              </li>
              <li>
                <strong className="text-foreground">No Guarantee:</strong> Approval is based on creditworthiness and verification.
              </li>
              <li>
                <strong className="text-foreground">Communications:</strong> You consent to electronic communications about your application.
              </li>
            </ul>
            <p className="text-[10px] sm:text-xs pt-1">
              By clicking "I Agree & Continue", you confirm that you have read and agree to these terms.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={handleDisclaimerAccept} className="w-full gap-2 text-sm">
              I Agree & Continue <ChevronRight className="w-4 h-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              {Array.from({ length: 7 }, (_, i) => (
                <div key={i} className="flex items-center gap-1 sm:gap-2">
                  <div 
                    className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold transition-colors ${
                      i === 0 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </div>
                  {i < 6 && (
                    <div className="w-4 sm:w-12 h-0.5 sm:h-1 rounded bg-muted" />
                  )}
                </div>
              ))}
            </div>
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3">1 of 7</p>
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
          <div className="max-w-2xl mx-auto">
            <div className="card-clean p-5 sm:p-8">
              {/* Personal Information Section */}
              <div className="space-y-5 mb-8">
                <h3 className="font-semibold text-foreground text-lg">Personal Information</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => updateFormData("firstName", e.target.value)}
                      className="input-clean"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => updateFormData("lastName", e.target.value)}
                      className="input-clean"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateFormData("email", e.target.value)}
                    className="input-clean"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    What state do you currently live in? <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => updateFormData("state", e.target.value)}
                    className={`input-clean ${!isStateEligible ? 'border-destructive' : ''}`}
                  >
                    <option value="">Select state...</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {!isStateEligible && (
                    <p className="text-sm text-destructive mt-2">
                      Unfortunately, we are not currently able to fund loans in {formData.state}. We apologize for the inconvenience.
                    </p>
                  )}
                </div>


                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Loan Amount <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">$</span>
                    <input
                      type="number"
                      value={formData.loanAmount}
                      onChange={(e) => updateFormData("loanAmount", e.target.value)}
                      className="input-clean pl-8"
                    />
                  </div>
                </div>
              </div>

              {/* Employment Information Section */}
              <div className="space-y-5 mb-8">
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Employment Information</h3>
                  <p className="text-sm text-muted-foreground mt-1">Tell us about your current and recent employment</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Employee Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.employeeType}
                    onChange={(e) => updateFormData("employeeType", e.target.value)}
                    className="input-clean"
                  >
                    <option value="">Select type...</option>
                    {EMPLOYEE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* W2 Eligibility Questions */}
                {isW2 && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Do you have an active checking account?
                      </label>
                      <YesNoButtons field="hasCheckingAccount" value={formData.hasCheckingAccount} />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Can you provide a valid driver's license or passport?
                      </label>
                      <YesNoButtons field="hasValidId" value={formData.hasValidId} />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Can you provide 30 days of recent pay stubs?
                      </label>
                      <YesNoButtons field="hasPayStubs" value={formData.hasPayStubs} />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Can you provide two personal references who do not live with you?
                      </label>
                      <YesNoButtons field="hasReferences" value={formData.hasReferences} />
                    </div>
                  </div>
                )}

                {/* Self-Employed / Retired Eligibility Questions */}
                {(isSelfEmployed || isRetired) && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Do you have an active checking account?
                      </label>
                      <YesNoButtons field="hasCheckingAccount" value={formData.hasCheckingAccount} />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Can you provide a valid driver's license?
                      </label>
                      <YesNoButtons field="hasDriversLicense" value={formData.hasDriversLicense} />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Can you provide your last 2 months of bank statements?
                      </label>
                      <YesNoButtons field="hasBankStatements" value={formData.hasBankStatements} />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Have you filed your 2023 and 2024 tax returns?
                      </label>
                      <YesNoButtons field="hasTaxReturns" value={formData.hasTaxReturns} />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-foreground">
                        Can you provide two personal references at separate addresses?
                      </label>
                      <YesNoButtons field="hasSeparateReferences" value={formData.hasSeparateReferences} />
                    </div>
                  </div>
                )}

                {/* Eligibility Result */}
                {allQuestionsAnswered && !isEligible && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 text-sm">
                    <p className="font-medium text-destructive">Based on your answers, you may not qualify at this time.</p>
                    <p className="text-muted-foreground mt-1">Please ensure you can provide all required documentation to proceed.</p>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-6 border-t border-border">
                <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button onClick={handleContinue} disabled={!isValid} className="gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
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
    </>
  );
};

export default PreQualify;
