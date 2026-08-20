import ClerkAuthPanel from "../../clerk-auth-panel";
import { isLocalMode } from "../../../lib/server/config";
import { redirect } from "next/navigation";

export default function SignInPage() {
  if (isLocalMode()) redirect("/");
  return <ClerkAuthPanel mode="sign-in" routing="path" />;
}
