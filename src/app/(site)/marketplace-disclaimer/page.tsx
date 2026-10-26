import type { Metadata } from "next";
import { LegalPage } from "@/components/LegalPage";

export const metadata: Metadata = { title: "Marketplace Role & Disclaimer", alternates: { canonical: "/marketplace-disclaimer/" } };

export default function Page() {
  return (
    <LegalPage
      title="Marketplace Role & Disclaimer"
      updated="October 2026"
      sections={[
        ["What Tourzin does", ["Tourzin helps customers discover, compare and contact tourist vehicle operators, and offers assisted matching through Let Tourzin Help."]],
        ["What Tourzin does not do", ["Tourzin does not currently own or guarantee the final quotation, vehicle availability, booking confirmation, payment collection, or trip execution. These are agreed directly between the customer and the operator."]],
        ["Prices", ["Any approximate daily price shown is optional, operator-provided information. It is not a Tourzin quote and the final price may differ."]],
        ["Tourzin Verified", ["The Tourzin Verified badge is shown only for operators who have completed Tourzin's formal verification process. It is not a guarantee of service quality for any specific trip."]],
        ["Your checklist", ["Always confirm the exact vehicle, final quote, inclusions, extra charges, payment and cancellation terms, and get written confirmation before paying any advance."]],
      ]}
    />
  );
}
