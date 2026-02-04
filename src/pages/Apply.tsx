import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "@/store/applicationStore";
import ApplicationLayout from "@/components/ApplicationLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

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

const CITIZENSHIP_OPTIONS = [
  { value: "us_citizen", label: "U.S. Citizen" },
  { value: "permanent_resident", label: "Permanent Resident" },
  { value: "visa_holder", label: "Visa Holder" },
];

const Apply = () => {
  const navigate = useNavigate();
  const { formData, updateFormData, setCurrentStep } = useApplicationStore();

  useScrollToTop();

  const isValid = 
    formData.phone.replace(/\D/g, '').length === 10 &&
    formData.address.trim() !== '' &&
    formData.city.trim() !== '' &&
    formData.state !== '' &&
    formData.zipCode.length === 5 &&
    formData.citizenship !== '' &&
    formData.ssn.replace(/\D/g, '').length === 9;

  const handleBack = () => {
    navigate('/pre-qualify');
  };

  const handleContinue = () => {
    setCurrentStep(2);
    navigate('/apply/step-2');
  };

  const formatSSN = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 9);
    if (digits.length <= 3) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 5)}-${digits.slice(5)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  return (
    <ApplicationLayout currentStep={2} totalSteps={7}>
        <div className="max-w-2xl mx-auto px-1">
          <div className="card-clean p-4 sm:p-6 lg:p-8">
            <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1 sm:mb-2">Complete Your Information</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
              Welcome back, {formData.firstName}! Please provide additional details to continue.
            </p>
            
            <div className="space-y-5">
              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Phone <span className="text-destructive">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData("phone", formatPhone(e.target.value))}
                  className="input-clean"
                  placeholder="(555) 123-4567"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Street Address <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => updateFormData("address", e.target.value)}
                  className="input-clean"
                  placeholder="123 Main Street"
                />
              </div>

              {/* City, State (pre-filled), Zip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    City <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    className="input-clean"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    State <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => updateFormData("state", e.target.value)}
                    className="input-clean"
                  >
                    <option value="">Select...</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    ZIP Code <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => updateFormData("zipCode", e.target.value.replace(/\D/g, '').slice(0, 5))}
                    className="input-clean"
                    placeholder="10001"
                    maxLength={5}
                  />
                </div>
              </div>

              {/* Citizenship */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Citizenship Status <span className="text-destructive">*</span>
                </label>
                <select
                  value={formData.citizenship}
                  onChange={(e) => updateFormData("citizenship", e.target.value)}
                  className="input-clean"
                >
                  <option value="">Select your citizenship status...</option>
                  {CITIZENSHIP_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              {/* SSN */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Social Security Number <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ssn}
                  onChange={(e) => updateFormData("ssn", formatSSN(e.target.value))}
                  className="input-clean"
                  placeholder="XXX-XX-XXXX"
                />
                <p className="text-xs text-muted-foreground mt-1">Your SSN is encrypted and securely stored</p>
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

export default Apply;