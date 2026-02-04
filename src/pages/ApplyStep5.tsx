import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "@/store/applicationStore";
import ApplicationLayout from "@/components/ApplicationLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft, Users } from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";

// --- CONSTANTS OUTSIDE ---
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

const RELATIONSHIPS = [
  { value: "friend", label: "Friend" },
  { value: "family", label: "Family Member" },
  { value: "coworker", label: "Coworker" },
  { value: "neighbor", label: "Neighbor" },
  { value: "other", label: "Other" },
];

// --- HELPER OUTSIDE ---
const formatPhone = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

// --- SUB-COMPONENT OUTSIDE (THIS IS THE FIX) ---
const ReferenceForm = ({ 
  num, 
  formData, 
  updateFormData 
}: { 
  num: 1 | 2, 
  formData: any, 
  updateFormData: (field: string, value: any) => void 
}) => {
  const prefix = `reference${num}` as const;

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-foreground flex items-center gap-2">
        <Users className="w-4 h-4" />
        Reference {num}
      </h4>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Full Name <span className="text-destructive">*</span>
          </label>
          <input
            type="text"
            value={formData[`${prefix}Name`] || ''}
            onChange={(e) => updateFormData(`${prefix}Name`, e.target.value)}
            className="input-clean w-full"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Phone Number <span className="text-destructive">*</span>
          </label>
          <input
            type="tel"
            value={formData[`${prefix}Phone`] || ''}
            onChange={(e) => updateFormData(`${prefix}Phone`, formatPhone(e.target.value))}
            className="input-clean w-full"
            placeholder="(555) 123-4567"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Relationship <span className="text-destructive">*</span>
        </label>
        <select
          value={formData[`${prefix}Relationship`] || ''}
          onChange={(e) => updateFormData(`${prefix}Relationship`, e.target.value)}
          className="input-clean w-full"
        >
          <option value="">Select relationship...</option>
          {RELATIONSHIPS.map((rel) => (
            <option key={rel.value} value={rel.value}>{rel.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Street Address <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          value={formData[`${prefix}Address`] || ''}
          onChange={(e) => updateFormData(`${prefix}Address`, e.target.value)}
          className="input-clean w-full"
          placeholder="123 Main Street"
        />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">City *</label>
          <input
            type="text"
            value={formData[`${prefix}City`] || ''}
            onChange={(e) => updateFormData(`${prefix}City`, e.target.value)}
            className="input-clean w-full"
            placeholder="City"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">State *</label>
          <select
            value={formData[`${prefix}State`] || ''}
            onChange={(e) => updateFormData(`${prefix}State`, e.target.value)}
            className="input-clean w-full"
          >
            <option value="">State</option>
            {US_STATES.map((state) => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">ZIP *</label>
          <input
            type="text"
            value={formData[`${prefix}ZipCode`] || ''}
            onChange={(e) => updateFormData(`${prefix}ZipCode`, e.target.value.replace(/\D/g, '').slice(0, 5))}
            className="input-clean w-full"
            placeholder="12345"
            maxLength={5}
          />
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const ApplyStep5 = () => {
  const navigate = useNavigate();
  const { formData, updateFormData, setCurrentStep } = useApplicationStore();

  useScrollToTop();

  // --- VALIDATION LOGIC ---
  const isValid = 
    formData.reference1Name.trim() !== '' &&
    formData.reference1Phone.replace(/\D/g, '').length === 10 &&
    formData.reference1Relationship !== '' &&
    formData.reference1Address.trim() !== '' &&
    formData.reference1City.trim() !== '' &&
    formData.reference1State !== '' &&
    formData.reference1ZipCode.length === 5 &&
    formData.reference2Name.trim() !== '' &&
    formData.reference2Phone.replace(/\D/g, '').length === 10 &&
    formData.reference2Relationship !== '' &&
    formData.reference2Address.trim() !== '' &&
    formData.reference2City.trim() !== '' &&
    formData.reference2State !== '' &&
    formData.reference2ZipCode.length === 5;

  const handleBack = () => {
    setCurrentStep(4);
    navigate('/apply/step-4');
  };

  const handleContinue = () => {
    setCurrentStep(6);
    navigate('/apply/step-6');
  };

  return (
    <ApplicationLayout currentStep={6} totalSteps={7}>
      <div className="max-w-2xl mx-auto">
        <div className="card-clean p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground mb-2">Personal References</h2>
          <p className="text-muted-foreground mb-6">
            Please provide two personal references who do not live with you.
          </p>

          <div className="space-y-8">
            <ReferenceForm num={1} formData={formData} updateFormData={updateFormData} />
            <div className="border-t border-border pt-6">
              <ReferenceForm num={2} formData={formData} updateFormData={updateFormData} />
            </div>
          </div>

          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={handleContinue}  disabled={!isValid} className="gap-2">
              Continue <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </ApplicationLayout>
  );
};

export default ApplyStep5;