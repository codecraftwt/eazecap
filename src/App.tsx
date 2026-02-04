import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import PreQualify from "./pages/PreQualify";
import Apply from "./pages/Apply";
import ApplyStep2 from "./pages/ApplyStep2";
import ApplyStep3 from "./pages/ApplyStep3";
import ApplyStep4 from "./pages/ApplyStep4";
import ApplyStep5 from "./pages/ApplyStep5";
import ApplyStep6 from "./pages/ApplyStep6";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/pre-qualify" element={<PreQualify />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/apply/step-2" element={<ApplyStep2 />} />
          <Route path="/apply/step-3" element={<ApplyStep3 />} />
          <Route path="/apply/step-4" element={<ApplyStep4 />} />
          <Route path="/apply/step-5" element={<ApplyStep5 />} />
          <Route path="/apply/step-6" element={<ApplyStep6 />} />
          <Route path="/apply/success" element={<Success />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
