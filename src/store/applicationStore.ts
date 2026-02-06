import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type FormData = {
  // Pre-Qualification
  firstName: string;
  lastName: string;
  email: string;
  state: string;
  businessAccountId: string;
  loanAmount: string;
  employeeType: 'w2' | 'self' | 'retired' | '';
  
  // Pre-Qualification Eligibility (W2)
  hasCheckingAccount: boolean | null;
  hasValidId: boolean | null;
  hasPayStubs: boolean | null;
  hasReferences: boolean | null;
  
  // Pre-Qualification Eligibility (Self-Employed)
  hasDriversLicense: boolean | null;
  hasBankStatements: boolean | null;
  hasTaxReturns: boolean | null;
  hasSeparateReferences: boolean | null;
  
  // Step 1 - Personal Info (continued)
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  citizenship: 'us_citizen' | 'permanent_resident' | 'visa_holder' | '';
  ssn: string;
  
  // Step 2 - Identity Verification
  idType: 'drivers_license' | 'passport' | 'state_id' | '';
  idNumber: string;
  idState: string;
  idExpiration: string;
  idAddressMatch: boolean | null;
  idPhotoUrl:string
  idPhotoUrlKey:string
  
  // Step 3 - Employment & Income (W2)
  employerName: string;
  jobTitle: string;
  payFrequency: 'weekly' | 'biweekly' | 'monthly' | '';
  monthlyIncome: string;
  employmentLength: string;
  payStub1Url: string;
  payStub1Key: string; // Added Key
  payStub2Url: string;
  payStub2Key: string; // Added Key
  payStub3Url: string;
  payStub3Key: string; // Added Key
  payStub4Url: string;
  payStub4Key: string;
  taxTranscript2023Url: string;
  taxTranscript2023Key: string; // Added Key
  taxTranscript2024Url: string;
  taxTranscript2024Key: string; // Added Key
  bankStatement1Url: string;
  bankStatement1Key: string; // Added Key
  bankStatement2Url: string;
  bankStatement2Key: string; // Added Key
  
  // Step 3 - Employment & Income (Self-Employed)
  businessName: string;
  businessType: string;
  selfEmploymentLength: string;
  
  // Step 4 - Financial Details
  housingSituation: 'own' | 'rent' | 'other' | '';
  monthlyHousingPayment: string;
  bankName: string;
  accountType: 'checking' | 'savings' | '';
  routingNumber: string;
  accountNumber: string;
  
  // Step 5 - References
  reference1Name: string;
  reference1Phone: string;
  reference1Relationship: string;
  reference1Address: string;
  reference1City: string;
  reference1State: string;
  reference1ZipCode: string;
  reference1Email: string
  reference2Name: string;
  reference2Phone: string;
  reference2Relationship: string;
  reference2Address: string;
  reference2City: string;
  reference2State: string;
  reference2ZipCode: string;
  reference2Email: string;
  
  // Step 6 - Consent
  consentCredit: boolean;
  consentElectronic: boolean;
  consentTerms: boolean;
};

type ApplicationStore = {
  formData: FormData;
  currentStep: number;
  updateFormData: (field: keyof FormData, value: string | boolean | null) => void;
  setCurrentStep: (step: number) => void;
  resetForm: () => void;
};

const initialFormData: FormData = {
  // Pre-Qualification
  firstName: '',
  lastName: '',
  email: '',
  state: '',
  businessAccountId: '',
  loanAmount: '',
  employeeType: '',
  
  // Pre-Qualification Eligibility
  hasCheckingAccount: null,
  hasValidId: null,
  hasPayStubs: null,
  hasReferences: null,
  hasDriversLicense: null,
  hasBankStatements: null,
  hasTaxReturns: null,
  hasSeparateReferences: null,
  
  // Step 1 - Personal Info (continued)
  phone: '',
  address: '',
  city: '',
  zipCode: '',
  citizenship: '',
  ssn: '',
  
  // Step 2 - Identity
  idType: '',
  idNumber: '',
  idState: '',
  idExpiration: '',
  idAddressMatch: null,
  idPhotoUrl:'',
  idPhotoUrlKey:'',
  
  // Step 3 - Employment (W2)
  employerName: '',
  jobTitle: '',
  payFrequency: '',
  monthlyIncome: '',
  employmentLength: '',
  
  // Step 3 - Employment (Self-Employed)
  businessName: '',
  businessType: '',
  selfEmploymentLength: '',
  payStub1Url: '',
  payStub1Key: '',
  payStub2Url: '',
  payStub2Key: '',
  payStub3Url: '',
  payStub3Key: '',
  payStub4Url: '',
  payStub4Key: '',
  taxTranscript2023Url: '',
  taxTranscript2023Key: '',
  taxTranscript2024Url: '',
  taxTranscript2024Key: '',
  bankStatement1Url: '',
  bankStatement1Key: '',
  bankStatement2Url: '',
  bankStatement2Key: '',
  
  // Step 4 - Financial
  housingSituation: '',
  monthlyHousingPayment: '',
  bankName: '',
  accountType: '',
  routingNumber: '',
  accountNumber: '',
  
  // Step 5 - References
  reference1Name: '',
  reference1Phone: '',
  reference1Relationship: '',
  reference1Address: '',
  reference1City: '',
  reference1State: '',
  reference1ZipCode: '',
  reference1Email: '',
  reference2Name: '',
  reference2Phone: '',
  reference2Relationship: '',
  reference2Address: '',
  reference2City: '',
  reference2State: '',
  reference2ZipCode: '',
  reference2Email: '',
  
  // Step 6 - Consent
  consentCredit: false,
  consentElectronic: false,
  consentTerms: false,
};

export const useApplicationStore = create<ApplicationStore>()(
  persist(
    (set) => ({
      formData: initialFormData,
      currentStep: 1,
      updateFormData: (field, value) =>
        set((state) => ({
          formData: { ...state.formData, [field]: value },
        })),
      setCurrentStep: (step) => set({ currentStep: step }),
      resetForm: () => set({ formData: initialFormData, currentStep: 1 }),
    }),
    {
      name: 'eazecap-application',
    }
  )
);
