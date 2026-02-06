import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore, type FormData } from "@/store/applicationStore"; // Ensure type is imported
import ApplicationLayout from "@/components/ApplicationLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft, Check, Upload, CheckCircle2, X, Loader2 } from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { uploadFileToS3, uploadFileToS32 } from "@/lib/s3Service"; // Import your S3 utility
import { waitForSafeScan } from "@/lib/malwareService";
import { fetchDocumentUploadUrl, fetchSalesforceToken } from "@/store/api";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

const EMPLOYMENT_LENGTHS = [
  { value: "less_than_1", label: "Less than 1 year" },
  { value: "1_to_2", label: "1-2 years" },
  { value: "2_to_5", label: "2-5 years" },
  { value: "5_plus", label: "5+ years" },
];

const PAY_FREQUENCIES = [
  { value: "weekly", label: "Weekly", stubCount: 4 },
  { value: "biweekly", label: "Bi-Weekly", stubCount: 2 },
  { value: "monthly", label: "Monthly", stubCount: 1 },
];

const ApplyStep3 = () => {
  const navigate = useNavigate();
  const { formData, updateFormData, setCurrentStep } = useApplicationStore();

  // Track uploading state for each field to show loading spinners
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  useScrollToTop();

  const getPayStubCount = () => {
    const freq = PAY_FREQUENCIES.find(f => f.value === formData.payFrequency);
    return freq?.stubCount || 0;
  };

  const isW2 = formData.employeeType === 'w2';
  const isSelfEmployed = formData.employeeType === 'self';
  const isRetired = formData.employeeType === 'retired';
  const usesSelfEmployedDocs = isSelfEmployed || isRetired;

  // Validation now checks for the presence of the S3 URL in formData
  const w2Valid = isW2 &&
    formData.employerName.trim() !== '' &&
    formData.jobTitle.trim() !== '' &&
    formData.employmentLength !== '' &&
    formData.payFrequency !== '' &&
    formData.monthlyIncome !== '' &&
    (formData.payFrequency === 'weekly' ?
      (formData.payStub1Url && formData.payStub2Url && formData.payStub3Url && formData.payStub4Url) :
      formData.payFrequency === 'biweekly' ?
        (formData.payStub1Url && formData.payStub2Url) :
        formData.payFrequency === 'monthly' ?
          formData.payStub1Url : false);

  const selfEmployedValid = isSelfEmployed &&
    formData.businessName?.trim() !== '' &&
    formData.businessType?.trim() !== '' &&
    formData.selfEmploymentLength !== '' &&
    formData.monthlyIncome !== '' &&
    formData.taxTranscript2023Url &&
    formData.taxTranscript2024Url &&
    formData.bankStatement1Url &&
    formData.bankStatement2Url;

  const retiredValid = isRetired &&
    formData.monthlyIncome !== '' &&
    formData.taxTranscript2023Url &&
    formData.taxTranscript2024Url &&
    formData.bankStatement1Url &&
    formData.bankStatement2Url;

  const isValid = w2Valid || selfEmployedValid || retiredValid;

  const handleBack = () => {
    setCurrentStep(2);
    navigate('/apply/step-2');
  };

  const handleContinue = () => {
    setCurrentStep(4);
    navigate('/apply/step-4');
  };
  const dispatch = useDispatch<AppDispatch>();
  const { salesforceToken, status } = useSelector((state: RootState) => state.salesforce);


  // UPDATED: AWS Upload Logic
  const handleFileChange = (field: keyof FormData, folder: string) => async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
    if (file) {
      // try {
      //   const fieldKey = String(field);
      //   setUploading(prev => ({ ...prev, [fieldKey]: true }));

      //   // 1. Upload to S3
      //   const s3Url = await uploadFileToS3(file, folder);

      //   // 2. Update Zustand store with the returned URL
      //   updateFormData(field as keyof FormData, s3Url);

      // } catch (error) {
      //   console.error("Upload failed:", error);
      //   alert("Failed to upload file. Please try again.");
      // } finally {
      //   setUploading(prev => ({ ...prev, [String(field)]: false }));
      // }

      try {
        const fieldKey = String(field);
        setUploading(prev => ({ ...prev, [fieldKey]: true }));

        // 1. Upload to S3
        // const s3Url = await uploadFileToS3(file, folder);

        // 3. Wait for Malware Scan Result
        // This calls your Node.js backend to check for the GuardDuty tags
        const fileKey = await uploadFileToS32(file, folder);
        const fileName = fileKey.split('/').pop();
        console.log(fileName, 'fileName');
        // 2. Update Zustand store with the returned URL
        const isSafe = await waitForSafeScan(fileKey);

        if (isSafe) {
          // 4. Success: Update Zustand store with the final S3 path/URL
          // const s3Url = await uploadFileToS3(file, folder);
          const s3Url = `https://eazecap-uploads-2026.s3.amazonaws.com/${fileKey}`;
          // updateFormData(field as keyof FormData, s3Url);


          const response = await dispatch(
            fetchDocumentUploadUrl({
              fileName: fileName,
              contentType: file.type,
            })
          ).unwrap();

          // // --- LOGGING THE RESPONSE ---
          console.log("Salesforce API Response:", response);
          console.log("Upload URL:", response.uploadUrl);
          console.log("S3 Key:", response.s3Key);
          const fieldKeyName = String(field);
          const keyField = fieldKeyName.replace('Url', 'Key') as keyof FormData;
          updateFormData(field as keyof FormData, s3Url);
          updateFormData(keyField, response.s3Key);
          // setIdPhoto({ name: file.name, size: file.size });
        } else {
          // 5. Security Block: Clear the input and alert the user
          alert("⚠️ Security Alert: This file was flagged as a potential threat and has been blocked.");
          e.target.value = ""; // Reset file input
        }

      } catch (error) {
        console.error("Upload failed:", error);
        alert("Failed to upload file. Please try again.");
      } finally {
        setUploading(prev => ({ ...prev, [String(field)]: false }));
      }
    }
  };

  const removeFile = (field: keyof FormData) => {
    const fieldKeyName = String(field);
    const keyField = fieldKeyName.replace('Url', 'Key') as keyof FormData;
    updateFormData(field, "");
    updateFormData(keyField, "");
  };

  const FileUploadField = ({
    field,
    label,
    folder
  }: {
    field: keyof FormData;
    label: string;
    folder: string;
  }) => {
    const fileUrl = formData[field] as string;
    const isUploading = uploading[String(field)];
    const inputId = `upload-${String(field)}`;

    return (
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-foreground">
          {label} <span className="text-destructive">*</span>
        </label>

        {isUploading ? (
          <div className="flex flex-col items-center justify-center h-[100px] border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl">
            <Loader2 className="w-5 h-5 text-primary animate-spin mb-1" />
            <span className="text-[10px] font-medium">Uploading...</span>
          </div>
        ) : fileUrl ? (
          <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent rounded-xl h-[100px]">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-accent flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">File Uploaded</p>
                <p className="text-[10px] text-muted-foreground truncate">Stored in S3</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(field)}
              className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
              aria-label="Remove file"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <label
            htmlFor={inputId}
            className="flex flex-col items-center justify-center h-[100px] border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all active:bg-muted/70"
          >
            <Upload className="w-5 h-5 text-muted-foreground mb-1" />
            <span className="text-xs font-medium text-foreground">Tap to upload</span>
            <span className="text-[10px] text-muted-foreground">Max 10MB</span>
            <input
              id={inputId}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange(field, folder)}
              className="hidden"
            />
          </label>
        )}
      </div>
    );
  };

  return (
    <ApplicationLayout currentStep={4} totalSteps={7}>
      <div className="max-w-2xl mx-auto px-1">
        <div className="card-clean p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1">Employment & Income</h2>
          <p className="text-sm text-muted-foreground mb-4">
            {isW2 ? "Provide details about your W2 employment" : isSelfEmployed ? "Provide details about your self-employment" : isRetired ? "Provide details about your retirement income" : "Please complete pre-qualification first"}
          </p>

          <div className="space-y-4">
            {/* Employment Type Badge */}
            {formData.employeeType && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                <Check className="w-3 h-3" />
                {isW2 ? "W2 Employee" : isSelfEmployed ? "Self Employed" : "Retired"}
              </div>
            )}

            {/* W2 Employee Fields */}
            {isW2 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Employer Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.employerName}
                      onChange={(e) => updateFormData("employerName", e.target.value)}
                      className="input-clean"
                      placeholder="Company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Job Title <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      onChange={(e) => updateFormData("jobTitle", e.target.value)}
                      className="input-clean"
                      placeholder="Your position"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Employment Length <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={formData.employmentLength}
                      onChange={(e) => updateFormData("employmentLength", e.target.value)}
                      className="input-clean"
                    >
                      <option value="">Select...</option>
                      {EMPLOYMENT_LENGTHS.map((length) => (
                        <option key={length.value} value={length.value}>{length.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Pay Frequency <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={formData.payFrequency}
                      onChange={(e) => updateFormData("payFrequency", e.target.value)}
                      className="input-clean"
                    >
                      <option value="">Select...</option>
                      {PAY_FREQUENCIES.map((freq) => (
                        <option key={freq.value} value={freq.value}>{freq.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Monthly Income (Gross) <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <input
                      type="number"
                      value={formData.monthlyIncome}
                      onChange={(e) => updateFormData("monthlyIncome", e.target.value)}
                      className="input-clean pl-7"
                      placeholder="5,000"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Self-Employed Fields */}
            {isSelfEmployed && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Business Name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.businessName || ''}
                      onChange={(e) => updateFormData("businessName", e.target.value)}
                      className="input-clean"
                      placeholder="Your business name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Type of Business <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.businessType || ''}
                      onChange={(e) => updateFormData("businessType", e.target.value)}
                      className="input-clean"
                      placeholder="e.g., Consulting"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Self-Employment Length <span className="text-destructive">*</span>
                    </label>
                    <select
                      value={formData.selfEmploymentLength || ''}
                      onChange={(e) => updateFormData("selfEmploymentLength", e.target.value)}
                      className="input-clean"
                    >
                      <option value="">Select...</option>
                      {EMPLOYMENT_LENGTHS.map((length) => (
                        <option key={length.value} value={length.value}>{length.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Monthly Income (Gross) <span className="text-destructive">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                      <input
                        type="number"
                        value={formData.monthlyIncome}
                        onChange={(e) => updateFormData("monthlyIncome", e.target.value)}
                        className="input-clean pl-7"
                        placeholder="5,000"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Retired Fields */}
            {isRetired && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Monthly Retirement Income <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                  <input
                    type="number"
                    value={formData.monthlyIncome}
                    onChange={(e) => updateFormData("monthlyIncome", e.target.value)}
                    className="input-clean pl-7"
                    placeholder="3,000"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Include Social Security, pension, and other retirement income</p>
              </div>
            )}

            {/* Document Upload Section */}
            {formData.employeeType && (
              <div className="pt-3 border-t border-border">
                <h3 className="font-semibold text-foreground text-sm mb-3">Required Documents</h3>

                {isW2 && !formData.payFrequency && (
                  <p className="text-sm text-muted-foreground">
                    Please select your pay frequency above to see required documents.
                  </p>
                )}

                {isW2 && formData.payFrequency && (
                  <div className="space-y-3">
                    <p className="text-xs text-muted-foreground">
                      Based on your {formData.payFrequency} pay schedule, please upload {getPayStubCount()} pay stub{getPayStubCount() > 1 ? 's' : ''}.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: getPayStubCount() }, (_, i) => {
                        const fieldName = `payStub${i + 1}Url` as keyof FormData;
                        return (
                          <FileUploadField
                            key={i}
                            field={fieldName}
                            label={`Pay Stub ${i + 1}`}
                            folder="pay-stubs"
                          />
                        );
                      })}
                    </div>
                  </div>
                )}

                {usesSelfEmployedDocs && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Tax Transcripts</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <FileUploadField
                          field="taxTranscript2023Url"
                          label="2023 Tax Transcript"
                          folder="tax-returns"
                        />
                        <FileUploadField
                          field="taxTranscript2024Url"
                          label="2024 Tax Transcript"
                          folder="tax-returns"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Bank Statements (Last 2 Months)</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <FileUploadField
                          field="bankStatement1Url"
                          label="Month 1"
                          folder="bank-statements"
                        />
                        <FileUploadField
                          field="bankStatement2Url"
                          label="Month 2"
                          folder="bank-statements"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 mt-5 pt-4 border-t border-border">
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

export default ApplyStep3;