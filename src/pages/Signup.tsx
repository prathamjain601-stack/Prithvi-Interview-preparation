import { SignUp } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { Brain } from "lucide-react";

const Signup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">InterviewAI</span>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Create your account</h1>
          <p className="text-sm text-muted-foreground mt-1">Start your interview preparation journey</p>
        </div>

        <div className="flex justify-center">
          <SignUp 
            routing="path" 
            path="/signup" 
            signInUrl="/login"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "glass-card shadow-none border-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "h-11 rounded-xl text-sm border-border hover:bg-secondary/50",
                formButtonPrimary: "btn-gradient h-11 text-sm rounded-xl",
                formFieldInput: "h-11 rounded-xl border-border bg-background",
                footerActionText: "text-muted-foreground",
                footerActionLink: "text-primary hover:underline font-medium"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
