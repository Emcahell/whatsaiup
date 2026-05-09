import EditContactScreen from '@/components/EditContact';

interface PageProps {
  searchParams: Promise<{ modelId?: string }>;
}

export default async function EditContactPage({ searchParams }: PageProps) {
  const { modelId } = await searchParams;
  return <EditContactScreen modelId={modelId} />;
}
