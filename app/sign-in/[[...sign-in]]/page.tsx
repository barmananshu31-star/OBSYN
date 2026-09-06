import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="text-[10px] uppercase tracking-[0.25em] text-[#d4ff00] font-mono">
            AUTHENTICATION
          </div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            OBSYN CLIENT PORTAL
          </h1>
          <p className="text-xs text-[#888888]">
            Sign in with your Google account to access your orders and save bespoke designs.
          </p>
        </div>

        <div className="flex justify-center">
          <SignIn />
        </div>
      </div>
    </div>
  );
}
