import React from "react";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicy() {
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
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <CardContent className="p-8 md:p-12 prose prose-slate dark:prose-invert max-w-none">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including when you create an account, update your profile, use our interactive features, participate in our services, or communicate with us.
            </p>
            <p>
              The types of information we may collect include your name, email address, password, institutional affiliation, profile image, and any other information you choose to provide.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>
              We may use the information we collect to:
            </p>
            <ul>
              <li>Provide, maintain, and improve our services;</li>
              <li>Process transactions and send related information;</li>
              <li>Send you technical notices, updates, security alerts, and support and administrative messages;</li>
              <li>Respond to your comments, questions, and requests;</li>
              <li>Communicate with you about products, services, offers, and events;</li>
              <li>Monitor and analyze trends, usage, and activities in connection with our services;</li>
              <li>Detect, investigate and prevent fraudulent transactions and other illegal activities.</li>
            </ul>

            <h2>3. AI Processing of Data</h2>
            <p>
              As a core feature of our service, we use Artificial Intelligence to process uploaded documents and generate examinations. When you upload study materials, they are temporarily stored and processed by our AI systems. We do not use your proprietary documents to train public AI models.
            </p>

            <h2>4. Information Sharing</h2>
            <p>
              We do not share your personal information with third parties except as described in this privacy policy, such as:
            </p>
            <ul>
              <li>With vendors, consultants, and other service providers who need access to such information to carry out work on our behalf;</li>
              <li>In response to a request for information if we believe disclosure is in accordance with, or required by, any applicable law, regulation, or legal process;</li>
              <li>With your consent or at your direction.</li>
            </ul>

            <h2>5. Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. However, no internet or email transmission is ever fully secure or error-free.
            </p>

            <h2>6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at privacy@examai.com.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
