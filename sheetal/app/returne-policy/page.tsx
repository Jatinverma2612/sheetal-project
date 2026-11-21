import { permanentRedirect } from "next/navigation";

export default function LegacyReturnPolicyPage() {
  permanentRedirect("/return-exchange-policy");
}
