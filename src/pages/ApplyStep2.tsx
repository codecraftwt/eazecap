import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApplicationStore } from "@/store/applicationStore";
import ApplicationLayout from "@/components/ApplicationLayout";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft, Upload, CheckCircle2, X, Loader2 } from "lucide-react";
import { useScrollToTop } from "@/hooks/use-scroll-to-top";
import { uploadFileToS3, uploadFileToS32 } from "@/lib/s3Service";
import { waitForSafeScan } from "@/lib/malwareService";
import { fetchDocumentUploadUrl, fetchSalesforceToken } from "@/store/api";
import { AppDispatch, RootState } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { uploadBinaryToS3 } from "@/lib/s3Upload";
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

const ID_TYPES = [
  { value: "drivers_license", label: "Driver's License" },
  { value: "passport", label: "Passport" },
  { value: "state_id", label: "State ID" },
];

type UploadedFile = {
  name: string;
  size: number;
};

const ApplyStep2 = () => {
  const navigate = useNavigate();
  const { formData, updateFormData, setCurrentStep } = useApplicationStore();
  const [isUploading, setIsUploading] = useState(false);
  const [idPhoto, setIdPhoto] = useState<UploadedFile | null>(null);

  useScrollToTop();

  const isValid =
    formData.idType !== '' &&
    formData.idNumber.trim() !== '' &&
    (formData.idType === 'passport' || formData.idState !== '') &&
    formData.idExpiration !== '' &&
    formData.idAddressMatch !== null &&
    idPhoto !== null;

  const handleBack = () => {
    setCurrentStep(1);
    navigate('/apply');
  };

  const handleContinue = () => {
    setCurrentStep(3);
    navigate('/apply/step-3');
  };
  const dispatch = useDispatch<AppDispatch>();
  const { salesforceToken, status } = useSelector((state: RootState) => state.salesforce);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // const file = e.target.files?.[0];
    // if (file) {
    //   setIdPhoto({ name: file.name, size: file.size });
    // }
    const file = e.target.files?.[0];
    if (!file) return;

    //   try {
        // setIsUploading(true);

    //     // Call our utility - specifying the folder "identity-photos"
    //     const s3Url = await uploadFileToS3(file, "identity-photos");

    //     // Save the resulting URL string to your Zustand store
    //     updateFormData("idPhotoUrl", s3Url);
    //     // updateFormData("idPhotoUrl", 's3Url');
    //     setIdPhoto({ name: file.name, size: file.size });

    //   } catch (error) {
    //     alert("Failed to upload to AWS. Check your CORS settings.");
    //   } finally {
        
    // };
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
    // console.log(currentToken, 'currentToken')
    try {
      // 1. Show the user we are busy (Uploading + Scanning)
      setIsUploading(true);

      // 2. Upload to S3
      // Note: uploadFileToS3 should return the fileKey (e.g., "identity-photos/filename.jpg")
      const fileKey = await uploadFileToS32(file, "identity-photos");

      // 3. Security Check: Polling your Node.js backend
      // This waits for GuardDuty tags: NO_THREATS_FOUND or THREATS_FOUND
      const isSafe = await waitForSafeScan(fileKey);
      // console.log(fileKey, 'fileKey')
      const fileName = fileKey.split('/').pop();
      // console.log(fileName, 'fileName');
      if (isSafe) {
        // 4. Success: Update store and UI only after scan passes
        const s3Url = `https://eazecap-uploads-2026.s3.amazonaws.com/${fileKey}`;
        // const s3Url = await uploadFileToS3(file, "identity-photos");
        // updateFormData("idPhotoUrl", s3Url);
        // setIdPhoto({ name: file.name, size: file.size });


        const response = await dispatch(
          fetchDocumentUploadUrl({
            fileName: fileName,
            contentType: file.type,
          })
        ).unwrap();

        // // --- LOGGING THE RESPONSE ---
        // console.log("Salesforce API Response:", response);
        // console.log("Upload URL:", response.uploadUrl);
        // console.log("S3 Key:", response.s3Key);

        // updateFormData("idPhotoUrl", s3Url);
        updateFormData("idPhotofileKey", response.s3Key);
        updateFormData("idPhotofilename", fileName);
        // updateFormData("idPhotoUrl", response.uploadUrl);
        setIdPhoto({ name: file.name, size: file.size });

       await uploadBinaryToS3(response.uploadUrl, file);

        // const { uploadUrl, s3Key } = response;
      } else {
        // 5. Security Failure: Block the file
        alert("⚠️ Malware detected! This file has been blocked for security reasons.");
        e.target.value = ""; // Clear the file input for the user
      }

    } catch (error: any) {
      console.error("Process failed:", error);
      alert(error.message || "Upload failed. Please check your connection.");
      e.target.value = "";
    } finally {
      // 6. Finish loading state
      setIsUploading(false);
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <ApplicationLayout currentStep={3} totalSteps={7}>
      <div className="max-w-2xl mx-auto px-1">
        <div className="card-clean p-4 sm:p-6 lg:p-8">
          <h2 className="text-lg sm:text-xl font-bold text-foreground mb-1 sm:mb-2">Identity Verification</h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Please provide your identification details</p>

          <div className="space-y-5">
            {/* ID Type */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                ID Type <span className="text-destructive">*</span>
              </label>
              <select
                value={formData.idType}
                onChange={(e) => updateFormData("idType", e.target.value)}
                className="input-clean"
              >
                <option value="">Select ID type...</option>
                {ID_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* ID Number & State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  ID Number <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => updateFormData("idNumber", e.target.value)}
                  className="input-clean"
                  placeholder="Enter your ID number"
                />
              </div>
              {formData.idType !== 'passport' && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Issuing State <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.idState}
                    onChange={(e) => updateFormData("idState", e.target.value)}
                    className="input-clean"
                  >
                    <option value="">Select state...</option>
                    {US_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Expiration Date */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Expiration Date <span className="text-destructive">*</span>
              </label>
              <input
                type="date"
                value={formData.idExpiration}
                onChange={(e) => updateFormData("idExpiration", e.target.value)}
                className="input-clean"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Address Match */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Does the address on your ID match your current address? <span className="text-destructive">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateFormData("idAddressMatch", true)}
                  className={`flex-1 h-12 px-4 rounded-xl border-2 text-base font-medium transition-all touch-manipulation ${formData.idAddressMatch === true
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData("idAddressMatch", false)}
                  className={`flex-1 h-12 px-4 rounded-xl border-2 text-base font-medium transition-all touch-manipulation ${formData.idAddressMatch === false
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:border-primary/50"
                    }`}
                >
                  No
                </button>
              </div>
              {formData.idAddressMatch === false && (
                <p className="text-sm text-destructive mt-2">
                  You may need to provide proof of residency (utility bill, lease agreement, etc.)
                </p>
              )}
            </div>

            {/* ID Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Upload ID Photo <span className="text-destructive">*</span>
              </label>
              <p className="text-sm text-muted-foreground mb-3">Upload a clear photo or scan of your ID</p>

              {isUploading ? (
    /* LOADING STATE */
    <div className="flex flex-col items-center justify-center h-12 border border-accent/30 bg-accent/5 rounded-xl">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-accent animate-spin" />
        <span className="text-sm font-medium text-accent">Scanning & Uploading...</span>
      </div>
    </div>
  ) :idPhoto ? (
                <div className="flex items-center justify-between p-3 bg-accent/10 border border-accent rounded-xl h-12">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{idPhoto.name}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIdPhoto(null)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors flex-shrink-0 touch-manipulation"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="id-upload"
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-all active:bg-muted/70 touch-manipulation"
                >
                  <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-foreground">Tap to upload</span>
                  <span className="text-xs text-muted-foreground mt-1">PDF, JPG, or PNG (max 10MB)</span>
                  <input
                    id="id-upload"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
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

export default ApplyStep2;
