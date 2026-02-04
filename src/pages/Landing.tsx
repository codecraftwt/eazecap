import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Clock, Shield, Mail, Lock, Calendar, DollarSign, CheckCircle, 
  Calculator, Building2, TrendingUp, ArrowRight, Sparkles, 
  Users, BadgeCheck, Zap, FileCheck, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import EazeLogo from "@/components/EazeLogo";
import EazeCapHeroLogo from "@/components/EazeCapHeroLogo";
import { useApplicationStore } from "@/store/applicationStore";
import { fetchSalesforceToken, submitEazeCapData} from "@/store/api";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store/store";

const faqs = [
  { question: "What is EazeCap?", answer: "EazeCap is a personal loan solution designed to make borrowing simple and transparent. It helps individuals apply for funding with clear terms and predictable monthly repayments, without unnecessary complexity." },
  { question: "How do I know what my monthly payment will be?", answer: "Before you apply, you can use the repayment estimator on this page to see an estimated monthly payment based on your loan amount and term." },
  { question: "Will checking my rate affect my credit score?", answer: "Checking your rate may involve a soft credit inquiry, which does not affect your credit score. If you move forward with a full application, a hard credit inquiry may be required." },
  { question: "How fast is the application process?", answer: "The application is designed to be quick and straightforward. Once submitted, our team reviews your information and guides you through the next steps." },
  { question: "What can I use the loan for?", answer: "EazeCap loans can be used for many personal needs, including consolidating expenses, covering unexpected costs, or managing larger purchases." },
  { question: "Are there any hidden fees?", answer: "EazeCap focuses on transparency. Key terms and repayment details are disclosed upfront so you can understand the cost of the loan before moving forward." },
];

const stats = [
  { value: "$150M+", label: "Funded to date" },
  { value: "50+", label: "Lending partners" },
  { value: "5.0★", label: "Customer rating" },
  { value: "1-4hrs", label: "Average approval" },
];

const steps = [
  { icon: FileCheck, title: "Quick Application", description: "Complete our simple online form in under 5 minutes" },
  { icon: Users, title: "Get Matched", description: "We connect you with our network of trusted lenders" },
  { icon: Zap, title: "Fast Approval", description: "Receive a decision, often within 24 hours" },
  { icon: DollarSign, title: "Get Funded", description: "Funds deposited directly to your bank account" },
];

const Landing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { salesforceToken, status } = useSelector((state: RootState) => state.salesforce);

  const [formData, setFormData] = useState({
    firstname: '',
    email: '',
  });

  // 3. The Submit Logic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let currentToken = salesforceToken;

    // STEP 1: Fetch Token if we don't have one in Redux
    if (!currentToken) {
      const tokenResult = await dispatch(fetchSalesforceToken());
      
      // Check if the token fetch was successful
      if (fetchSalesforceToken.fulfilled.match(tokenResult)) {
        currentToken = tokenResult.payload.access_token;
      } else {
        return; // Error toast is already handled in your slice
      }
    }

    // STEP 2: Submit the form data
    dispatch(submitEazeCapData({
      accountId: "001cY00000JXauEQAT", // Your Registration Code
      userData: {
        firstname: formData.firstname,
        email: formData.email,
        // Add other fields here...
      }
    }));
  };

  const processSubmission = async () => {
  try {
    // await dispatch(fetchSalesforceToken());

    let currentToken = salesforceToken;

    // STEP 1: Fetch Token if we don't have one in Redux
    if (!currentToken) {
      const tokenResult = await dispatch(fetchSalesforceToken());
      
      // Check if the token fetch was successful
      if (fetchSalesforceToken.fulfilled.match(tokenResult)) {
        currentToken = tokenResult.payload.access_token;
      } else {
        return; // Error toast is already handled in your slice
      }
    }

    // STEP 2: Submit the form data
    dispatch(submitEazeCapData({
      accountId: "001cY00000JXauEQAT", // Your Registration Code
      userData: {
        firstname: formData.firstname,
        email: formData.email,
        // Add other fields here...
      }
    }));

    // console.log("Success:", result);
  } catch (err) {
    console.error("Error:", err);
  }
};

  useEffect(()=>{
      processSubmission()
  },[])

  const [calcAmount, setCalcAmount] = useState(10000);
  const navigate = useNavigate();
  const resetForm = useApplicationStore((state) => state.resetForm);

  const handleApplyClick = () => {
    resetForm();
    navigate('/pre-qualify?apply=true');
  };

  const monthlyPayment = useMemo(() => {
    const principal = calcAmount || 0;
    const annualRate = 0.059;
    const monthlyRate = annualRate / 12;
    const months = 60;
    if (principal <= 0) return 0;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  }, [calcAmount]);

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <header className="bg-card/80 backdrop-blur-md md:bg-card/80 bg-background border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <EazeLogo className="h-10" />
          <div className="flex items-center gap-4">
            <a href="mailto:docs@eazeconsulting.com" className="hidden sm:flex text-sm text-muted-foreground hover:text-primary items-center gap-2 transition-colors">
              <Mail className="w-4 h-4" />
              Contact Us
            </a>
            <Button onClick={handleApplyClick} size="default" className="rounded-full px-8 py-5 text-sm font-semibold">
              Apply Now
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-10 sm:py-20 lg:py-28 px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-accent/15 rounded-full blur-[100px] translate-y-1/2" />
        
        <div className="relative z-10 container mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            {/* Hero Logo */}
            <div className="mb-3 sm:mb-5">
              <EazeCapHeroLogo />
            </div>
            
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-muted/80 text-muted-foreground px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium mb-2 sm:mb-4">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
              Trusted by 10,000+ borrowers
            </div>
            
            {/* Main headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6 leading-[1.15] tracking-tight">
              Finance
              <br />
              <span className="bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            
            <p className="text-sm sm:text-lg text-muted-foreground mb-6 sm:mb-10 max-w-lg mx-auto leading-relaxed px-2">
              Access $5,000 to $25,000 with competitive rates and transparent terms. Get pre-approved in minutes with no impact to your credit score.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-6 sm:mb-10">
              <Button 
                onClick={handleApplyClick} 
                size="lg" 
                className="text-sm sm:text-base font-semibold px-6 sm:px-8 py-4 sm:py-5 rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all group"
              >
                Apply Now
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm font-medium">Takes only 5 minutes</span>
              </div>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-row items-center justify-center gap-4 sm:gap-8 text-[10px] sm:text-sm">
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground/60" />
                <span>No credit impact</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                <Lock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground/60" />
                <span>256-bit encryption</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 text-muted-foreground">
                <BadgeCheck className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground/60" />
                <span>FDIC insured partners</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-4 sm:py-6 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center py-1">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold mb-0.5">{stat.value}</div>
                <div className="text-xs sm:text-sm text-primary-foreground/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 lg:py-28 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">How It Works</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Get funded in four simple steps. Our streamlined process gets you from application to approval faster.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-center">
                  <div className="relative inline-flex mb-4 sm:mb-6">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
                      <step.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary-foreground" />
                    </div>
                    <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-secondary text-secondary-foreground text-xs sm:text-sm font-bold flex items-center justify-center shadow-md">
                      {i + 1}
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-lg font-bold text-foreground mb-1 sm:mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">{step.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-border" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="py-12 sm:py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">Why Choose EazeCap?</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
              Clear terms, competitive rates, and a commitment to transparency.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-8 max-w-5xl mx-auto">
            <div className="card-clean p-5 sm:p-8 hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-4 sm:mb-6">
                <Calendar className="w-5 h-5 sm:w-7 sm:h-7 text-accent" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2 sm:mb-3">Fixed Terms</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Choose from 36 to 60-month terms with consistent monthly payments you can count on.
              </p>
            </div>
            
            <div className="card-clean p-5 sm:p-8 hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mb-4 sm:mb-6">
                <DollarSign className="w-5 h-5 sm:w-7 sm:h-7 text-secondary" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2 sm:mb-3">Competitive Rates</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Access rates starting from 5.9% APR based on your creditworthiness and financial profile.
              </p>
            </div>
            
            <div className="card-clean p-5 sm:p-8 hover:shadow-lg transition-shadow">
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-4 sm:mb-6">
                <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
              </div>
              <h3 className="font-bold text-lg sm:text-xl text-foreground mb-2 sm:mb-3">No Hidden Fees</h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                What you see is what you get. No origination fees, prepayment penalties, or surprise charges.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Loan Calculator */}
      <section className="py-12 sm:py-20 lg:py-28 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                  Estimate Your Monthly Payment
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-4 sm:mb-6">
                  Use our calculator to see what your loan could look like. No commitment required.
                </p>
                <ul className="space-y-2 sm:space-y-3 inline-block text-left">
                  <li className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-muted-foreground">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                    Fixed rate for the life of your loan
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-muted-foreground">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                    No prepayment penalties
                  </li>
                  <li className="flex items-center gap-2 sm:gap-3 text-sm sm:text-base text-muted-foreground">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-accent flex-shrink-0" />
                    Fast funding to your bank account
                  </li>
                </ul>
              </div>
              
              <div className="card-clean p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm sm:text-base">Loan Calculator</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">Estimate your monthly payment</p>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-foreground mb-2 sm:mb-3">
                      Loan amount: <span className="text-accent font-bold">${calcAmount.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      value={calcAmount}
                      onChange={(e) => setCalcAmount(Number(e.target.value))}
                      className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                      min="5000"
                      max="25000"
                      step="1000"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>$5,000</span>
                      <span>$25,000</span>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-primary to-primary/90 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-primary-foreground">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <span className="text-xs sm:text-sm text-primary-foreground/70">Term</span>
                      <span className="font-semibold text-sm sm:text-base">60 months</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs sm:text-sm text-primary-foreground/70">Estimated payment</span>
                      <span className="text-2xl sm:text-3xl font-bold">${monthlyPayment.toFixed(0)}<span className="text-sm sm:text-lg font-normal">/mo</span></span>
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    *Based on 5.9% APR. Actual rate may vary based on credit profile.
                  </p>
                  
                  <Button onClick={handleApplyClick} className="w-full rounded-xl py-5 sm:py-6 text-sm sm:text-base">
                    Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-10 sm:py-16 px-4 bg-card border-y border-border">
        <div className="container mx-auto">
          <div className="text-center mb-6 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Partnered with Leading Financial Institutions</h2>
            <p className="text-sm sm:text-base text-muted-foreground">All partners are FDIC insured and vetted for reliability</p>
          </div>
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-12">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-semibold">50+ Lending Partners</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-semibold">FDIC Insured</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-semibold">Competitive Rates</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="text-xs sm:text-sm font-semibold">Bank-Level Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-20 lg:py-28 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-3 sm:mb-4">Frequently Asked Questions</h2>
            <p className="text-base sm:text-lg text-muted-foreground">Everything you need to know about EazeCap loans.</p>
          </div>
          <Accordion type="single" collapsible className="space-y-3 sm:space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl sm:rounded-2xl px-4 sm:px-6 data-[state=open]:shadow-md transition-shadow">
                <AccordionTrigger className="text-left font-semibold text-sm sm:text-base text-foreground hover:text-primary hover:no-underline py-4 sm:py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground pb-4 sm:pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 sm:py-20 lg:py-28 px-4 bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative z-10 container mx-auto text-center max-w-3xl px-2">
          <h2 className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4 sm:mb-6">Ready to Get Started?</h2>
          <p className="text-base sm:text-xl text-primary-foreground/80 mb-8 sm:mb-10 max-w-xl mx-auto">
            Join thousands who've already simplified their borrowing experience with EazeCap.
          </p>
          <Button 
            onClick={handleApplyClick} 
            variant="secondary" 
            size="lg" 
            className="text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-7 rounded-full shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
          >
            Start Your Application
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <p className="text-xs sm:text-sm text-primary-foreground/60 mt-4 sm:mt-6">
            No commitment required • No impact to credit score
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-10 sm:py-16 px-4">
        <div className="container mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
            <div className="sm:col-span-2">
              <div className="mb-4 sm:mb-6 bg-card rounded-xl p-3 sm:p-4 inline-block">
                <EazeLogo className="h-8 sm:h-10" />
              </div>
              <p className="text-sm sm:text-base text-background/70 max-w-md leading-relaxed">
                Personal loan solutions designed to make borrowing simple, transparent, and accessible. 
                We connect you with trusted lending partners to find the best rates for your needs.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-background text-sm sm:text-base">Contact</h4>
              <div className="space-y-2 sm:space-y-3">
                <a href="mailto:docs@eazeconsulting.com" className="text-xs sm:text-sm text-background/70 hover:text-secondary flex items-center gap-2 transition-colors">
                  <Mail className="w-4 h-4" /> docs@eazeconsulting.com
                </a>
                <a href="tel:+1-800-555-0123" className="text-xs sm:text-sm text-background/70 hover:text-secondary flex items-center gap-2 transition-colors">
                  <Phone className="w-4 h-4" /> 1-800-555-0123
                </a>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4 text-background text-sm sm:text-base">Security</h4>
              <div className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-background/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-background/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <p className="text-xs sm:text-sm text-background/70">256-bit SSL encryption & bank-level security protocols.</p>
            </div>
          </div>
          <div className="border-t border-background/20 pt-6 sm:pt-8 text-xs sm:text-sm text-background/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} EAZE Consulting. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6">
              <a href="#" className="hover:text-background transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-background transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-background transition-colors">Disclosures</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
