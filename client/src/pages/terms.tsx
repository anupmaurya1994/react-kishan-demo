import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link href="/login">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Login
          </Button>
        </Link>
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardContent className="p-8 md:p-12 prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Agreement to Terms</h2>
            <p>
              By accessing or using our services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>

            <h2>2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on Exam AI's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul>
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>attempt to decompile or reverse engineer any software contained on Exam AI's website;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>

            <h2>3. Disclaimer</h2>
            <p>
              The materials on Exam AI's website are provided on an 'as is' basis. Exam AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>

            <h2>4. Limitations</h2>
            <p>
              In no event shall Exam AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Exam AI's website, even if Exam AI or a Exam AI authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>

            <h2>5. Revisions and Errata</h2>
            <p>
              The materials appearing on Exam AI's website could include technical, typographical, or photographic errors. Exam AI does not warrant that any of the materials on its website are accurate, complete, or current. Exam AI may make changes to the materials contained on its website at any time without notice.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
