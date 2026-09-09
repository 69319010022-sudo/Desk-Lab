import LoginForm from "./LoginForm";

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const justRegistered = searchParams?.registered === "1";
  const justResetPassword = searchParams?.reset === "1";

  return <LoginForm justRegistered={justRegistered} justResetPassword={justResetPassword} />;
}
