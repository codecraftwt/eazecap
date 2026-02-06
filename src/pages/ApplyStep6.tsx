import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "@/store/applicationStore";
import ApplicationLayout from "@/components/ApplicationLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Check, FileText, User, Briefcase, Home, Users, Shield } from "lucide-react";
import { toast } from "sonner";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";
import { fetchSalesforceToken, submitEazeCapData } from "@/store/api";

const ApplyStep6 = () => {
  const navigate = useNavigate();
  const { formData, updateFormData, setCurrentStep, resetForm } = useApplicationStore();

  useScrollToTop();

  const isValid =
    formData.consentCredit &&
    formData.consentElectronic &&
    formData.consentTerms;

  const handleBack = () => {
    setCurrentStep(5);
    navigate('/apply/step-5');
  };

  const dispatch = useDispatch<AppDispatch>();
  const { salesforceToken, status } = useSelector((state: RootState) => state.salesforce);

  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();

    console.log("Submitting application:", formData);
    let currentToken = salesforceToken;

    // STEP 1: Fetch Token if missing
    if (!currentToken) {
      const tokenResult = await dispatch(fetchSalesforceToken());
      if (fetchSalesforceToken.fulfilled.match(tokenResult)) {
        currentToken = tokenResult.payload.access_token;
      } else {
        return; // Stop if token fails
      }
    }
    console.log(currentToken, 'currentToken')

    // STEP 2: Submit and WAIT for result
    // Use .unwrap() or .match() to verify success
    const submitResult = await dispatch(submitEazeCapData({
      accountId: formData.businessAccountId || "0015w00002PoGAnAAN",
      userData: { ...formData }
    }));

    if (submitEazeCapData.fulfilled.match(submitResult)) {
      // ONLY run these if the API call actually succeeded
      toast.success("Application submitted successfully!");
      resetForm();
      navigate('/apply/success');
    } else {
      // If it failed, the error toast from your slice's handleAxiosError 
      // will show up automatically. No need to navigate.
      const errorPayload = submitResult.payload as string;

      // Check if the error message indicates a 500 or server crash
      if (errorPayload?.includes("500") || errorPayload?.includes("Unexpected error")) {
        toast.error("Server Error (500): We're having trouble reaching Salesforce. Please try again later.");
      } else {
        // Default error for 400s or other issues
        toast.error(errorPayload || "Submission failed. Please check your details.");
      }

      console.error("Submission failed:", errorPayload);
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(num);
  };

  const getEmployeeTypeLabel = (type: string) => {
    switch (type) {
      case 'w2': return 'W2 Employee';
      case '1099': return '1099 Contract Employee';
      case 'self': return 'Self Employed';
      default: return type;
    }
  };

  const getHousingLabel = (type: string) => {
    switch (type) {
      case 'own': return 'Own';
      case 'rent': return 'Rent';
      case 'other': return 'Other';
      default: return type;
    }
  };

  const maskSSN = (ssn: string) => {
    if (ssn.length < 4) return '***-**-****';
    return `***-**-${ssn.slice(-4)}`;
  };

  return (
    <ApplicationLayout currentStep={7} totalSteps={7}>
      <div className="max-w-2xl mx-auto">
        <div className="card-clean p-6 sm:p-8">
          <h2 className="text-xl font-bold text-foreground mb-2">Review & Consent</h2>
          <p className="text-muted-foreground mb-6">
            Please review your information and agree to the terms before submitting.
          </p>

          {/* Summary Sections */}
          <div className="space-y-6 mb-8">
            {/* Personal Information */}
            <div className="border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Personal Information</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Name:</span>
                  <p className="font-medium text-foreground">{formData.firstName} {formData.lastName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium text-foreground">{formData.email}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium text-foreground">{formData.phone}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">SSN:</span>
                  <p className="font-medium text-foreground">{maskSSN(formData.ssn)}</p>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-muted-foreground">Address:</span>
                  <p className="font-medium text-foreground">
                    {formData.address}, {formData.city}, {formData.state} {formData.zipCode}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Loan Amount:</span>
                  <p className="font-medium text-foreground">{formatCurrency(formData.loanAmount)}</p>
                </div>
              </div>
            </div>

            {/* Identity */}
            <div className="border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Identity Verification</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">ID Type:</span>
                  <p className="font-medium text-foreground capitalize">{formData.idType.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">ID Number:</span>
                  <p className="font-medium text-foreground">***{formData.idNumber.slice(-4)}</p>
                </div>
              </div>
            </div>

            {/* Employment */}
            <div className="border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Briefcase className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Employment & Income</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Employment Type:</span>
                  <p className="font-medium text-foreground">{getEmployeeTypeLabel(formData.employeeType)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Monthly Income:</span>
                  <p className="font-medium text-foreground">{formatCurrency(formData.monthlyIncome)}</p>
                </div>
                {formData.employerName && (
                  <div>
                    <span className="text-muted-foreground">Employer:</span>
                    <p className="font-medium text-foreground">{formData.employerName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Financial */}
            <div className="border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">Financial Details</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Housing:</span>
                  <p className="font-medium text-foreground">{getHousingLabel(formData.housingSituation)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Monthly Payment:</span>
                  <p className="font-medium text-foreground">{formatCurrency(formData.monthlyHousingPayment)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Bank:</span>
                  <p className="font-medium text-foreground">{formData.bankName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Account:</span>
                  <p className="font-medium text-foreground">***{formData.accountNumber.slice(-4)}</p>
                </div>
              </div>
            </div>

            {/* References */}
            <div className="border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-foreground">References</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-foreground">{formData.reference1Name}</p>
                  <p className="text-muted-foreground">{formData.reference1Phone}</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">{formData.reference2Name}</p>
                  <p className="text-muted-foreground">{formData.reference2Phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Consent Section */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-primary" />
              <h3 className="font-semibold text-foreground">Agreements & Consent</h3>
            </div>

            <label className="flex items-start gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.consentCredit}
                onChange={(e) => updateFormData("consentCredit", e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Credit Authorization</p>
                <p className="text-xs text-muted-foreground">
                  I authorize EAZE Consulting to obtain my credit report and verify the information provided in this application.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.consentElectronic}
                onChange={(e) => updateFormData("consentElectronic", e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Electronic Communications</p>
                <p className="text-xs text-muted-foreground">
                  I consent to receive electronic communications regarding my application and any related services.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 border border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
              <input
                type="checkbox"
                checked={formData.consentTerms}
                onChange={(e) => updateFormData("consentTerms", e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              <div>
                <p className="text-sm font-medium text-foreground">Terms & Conditions</p>
                <p className="text-xs text-muted-foreground">
                  I confirm that all information provided is accurate and complete. I have read and agree to the Terms of Service and Privacy Policy.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-between pt-6 border-t border-border">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={handleSubmit} disabled={!isValid} className="gap-2">
              Submit Application <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </ApplicationLayout>
  );
};

export default ApplyStep6;
