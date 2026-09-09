import ForgotPasswordForm from "./ForgotPasswordForm";

export default async function ForgotPasswordPage(props: PageProps<"/forgot-password">) {
  const searchParams = await props.searchParams;
  const invalidLink = searchParams?.error === "invalid_link";

  return <ForgotPasswordForm invalidLink={invalidLink} />;
}
