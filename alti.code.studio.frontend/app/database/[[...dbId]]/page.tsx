import ClientPage from "./ClientPage";

export async function generateStaticParams() {
  return [{ dbId: [] }];
}

export default function Page({ params }: { params: any }) {
  return <ClientPage params={params} />;
}
