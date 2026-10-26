import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy/" } };

export default function Page() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="October 2026"
      sections={[
        ["Information we collect", ["When you submit a Let Tourzin Help request, Join Tourzin form or contact form, we collect the details you provide such as your name, mobile number and trip requirements.", "We collect basic usage analytics (for example, searches performed and contact buttons used) to improve the service."]],
        ["How we use information", ["To respond to your enquiry, match you with suitable operators, and connect you with the operator you choose.", "To operate, maintain and improve Tourzin."]],
        ["Sharing", ["When you ask Tourzin to help, we may share your trip requirement and contact number with operators relevant to your trip. We do not sell your personal information."]],
        ["Cookies & storage", ["We use essential browser storage and analytics cookies. You can clear these through your browser settings."]],
        ["Contact", ["For privacy questions, contact us using the details on our Contact page."]],
      ]}
    />
  );
}
