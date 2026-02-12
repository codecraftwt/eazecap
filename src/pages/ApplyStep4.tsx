import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "@/store/applicationStore";
import ApplicationLayout from "@/components/ApplicationLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft, Home, Building2 } from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

const HOUSING_OPTIONS = [
  { value: "own", label: "Own", icon: Home },
  { value: "rent", label: "Rent", icon: Building2 },
  { value: "other", label: "Other", icon: Home },
];

const ACCOUNT_TYPES = [
  { value: "checking", label: "Checking Account" },
  { value: "savings", label: "Savings Account" },
];

const ApplyStep4 = () => {
  const navigate = useNavigate();
  const { formData, updateFormData, setCurrentStep } = useApplicationStore();

  useScrollToTop();

  const isValid = 
    formData.housingSituation !== '' &&
    formData.monthlyHousingPayment !== '' &&
    formData.bankName.trim() !== '' &&
    formData.accountType !== '' &&
    formData.routingNumber.length === 9 &&
    formData.accountNumber.trim() !== '';

  const handleBack = () => {
    setCurrentStep(3);
    navigate('/apply/step-3');
  };

  const handleContinue = () => {
    setCurrentStep(5);
    navigate('/apply/step-5');
  };

  return (
    <ApplicationLayout currentStep={5} totalSteps={7}>
      <div className="max-w-2xl mx-auto px-1">
        <div className="card-clean p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1 sm:mb-2">Financial Details</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Tell us about your housing and bank account</p>
          
          <div className="space-y-4 sm:space-y-6">
            {/* Housing Section */}
            <div>
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-3 sm:mb-4">Housing Information</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-foreground mb-2 sm:mb-3">
                  Housing Situation <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {HOUSING_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => updateFormData("housingSituation", option.value)}
                        className={`p-3 sm:p-4 rounded-xl border-2 text-center transition-all touch-manipulation ${
                          formData.housingSituation === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border bg-card hover:border-primary/50"
                        }`}
                      >
                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-1 sm:mb-2 ${
                          formData.housingSituation === option.value ? "text-primary" : "text-muted-foreground"
                        }`} />
                        <span className="text-xs sm:text-sm font-medium text-foreground">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                  Monthly Housing Payment <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-sm sm:text-base">$</span>
                  {/* <input
                    type="number"
                    value={formData.monthlyHousingPayment}
                    onChange={(e) => updateFormData("monthlyHousingPayment", e.target.value)}
                    className="input-clean w-full pl-8 text-sm sm:text-base"
                    placeholder="1,500"
                  /> */}
                  <input
    type="text"
    inputMode="numeric"
    value={formData.monthlyHousingPayment ? Number(formData.monthlyHousingPayment).toLocaleString() : ""}
    onChange={(e) => {
      // Strip out everything except digits to keep the state clean
      const rawValue = e.target.value.replace(/\D/g, "");
      updateFormData("monthlyHousingPayment", rawValue);
    }}
    className="input-clean w-full pl-8 text-sm sm:text-base"
    placeholder="1,500"
  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.housingSituation === 'own' ? 'Mortgage payment' : 
                   formData.housingSituation === 'rent' ? 'Monthly rent' : 'Monthly housing cost'}
                </p>
              </div>
            </div>

            {/* Bank Account Section */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold text-foreground text-sm sm:text-base mb-3 sm:mb-4">Bank Account for Disbursement</h3>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                This is where your funds will be deposited if approved.
              </p>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                    Bank Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => updateFormData("bankName", e.target.value)}
                    className="input-clean w-full text-sm sm:text-base"
                    placeholder="Bank of America, Chase, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                    Account Type <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => updateFormData("accountType", e.target.value)}
                    className="input-clean w-full text-sm sm:text-base"
                  >
                    <option value="">Select account type...</option>
                    {ACCOUNT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                      Routing Number <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.routingNumber}
                      onChange={(e) => updateFormData("routingNumber", e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className="input-clean w-full text-sm sm:text-base"
                      placeholder="9 digits"
                      maxLength={9}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5 sm:mb-2">
                      Account Number <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.accountNumber}
                      onChange={(e) => updateFormData("accountNumber", e.target.value.replace(/\D/g, '').slice(0, 17))}
                      className="input-clean w-full text-sm sm:text-base"
                      placeholder="Account number"
                      maxLength={17}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
              <p><strong>Security Note:</strong> Your banking information is encrypted and will only be used for fund disbursement if your application is approved.</p>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
            <Button variant="ghost" onClick={handleBack} className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={handleContinue} disabled={!isValid} className="gap-2 w-full sm:w-auto">
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </ApplicationLayout>
  );
};

export default ApplyStep4;
