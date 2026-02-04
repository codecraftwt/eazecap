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
  
  // Step 3 - Employment & Income (W2)
  employerName: string;
  jobTitle: string;
  payFrequency: 'weekly' | 'biweekly' | 'monthly' | '';
  monthlyIncome: string;
  employmentLength: string;
  payStub1Url: string;
  payStub2Url: string;
  payStub3Url: string;
  payStub4Url: string;
  taxTranscript2023Url: string;
  taxTranscript2024Url: string;
  bankStatement1Url: string;
  bankStatement2Url: string;
  
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
  reference2Name: string;
  reference2Phone: string;
  reference2Relationship: string;
  reference2Address: string;
  reference2City: string;
  reference2State: string;
  reference2ZipCode: string;
  
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
  payStub2Url: '',
  payStub3Url: '',
  payStub4Url: '',
  taxTranscript2023Url: '',
  taxTranscript2024Url: '',
  bankStatement1Url: '',
  bankStatement2Url: '',
  
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
  reference2Name: '',
  reference2Phone: '',
  reference2Relationship: '',
  reference2Address: '',
  reference2City: '',
  reference2State: '',
  reference2ZipCode: '',
  
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
