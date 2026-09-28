export default function StoreDetailPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div>
      <h1>Store Detail</h1>
      <p>Store ID: {params.id}</p>
    </div>
  );
}
