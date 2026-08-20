import StackBridgeDashboard from "./stackbridge-dashboard";

export default function Page() {
  return <StackBridgeDashboard clerkEnabled={Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)} />;
}
