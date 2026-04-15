import AuthForm from "@/components/auth/AuthForm";

export default function AuthPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return <AuthForm callbackError={searchParams.error} />;
}
