import { redirect } from "next/navigation";

export default async function LegacyUploadCertificateRedirect(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  redirect(`/${locale}/documents/upload`);
}
