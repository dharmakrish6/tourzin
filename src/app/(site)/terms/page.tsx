import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Terms & Conditions", alternates: { canonical: "/terms/" } };

export default function Page() {
  return (
    <LegalPage
      title="Terms & Conditions"
      updated="October 2026"
      sections={[
        ["Use of Tourzin", ["Tourzin provides a platform to discover tourist vehicle operators in Tamil Nadu and contact them directly. By using Tourzin you agree to these terms."]],
        ["Marketplace role", ["Tourzin is not a party to any agreement between customers and operators. Quotes, availability, bookings, payments, cancellations and the trip itself are arranged directly between the customer and the operator."]],
        ["Listings", ["Operator information is provided by operators and maintained by the Tourzin team. Approximate prices are indicative only. While we take care, we do not guarantee the accuracy of every listing."]],
        ["Acceptable use", ["Do not misuse the platform, submit false information, or attempt to disrupt the service."]],
        ["Liability", ["To the extent permitted by law, Tourzin is not liable for losses arising from arrangements made between customers and operators."]],
      ]}
    />
  );
}
