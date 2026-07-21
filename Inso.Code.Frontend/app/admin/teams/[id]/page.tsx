import ClientPage from "./ClientPage";

export async function generateStaticParams() {
  return [{ id: "1" }];
}

export default function Page() {
  return <ClientPage />;
}
