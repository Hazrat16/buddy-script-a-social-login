import { AuthenticatedBuddyLayout } from "@/components/layout/AuthenticatedBuddyLayout";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedBuddyLayout>{children}</AuthenticatedBuddyLayout>;
}
