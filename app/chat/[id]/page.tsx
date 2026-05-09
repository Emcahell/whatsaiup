import ChatDetailScreen from '@/components/ChatDetail';

interface PageProps {
  params: Promise<{ id: string; modelId?: string }>;
  searchParams: Promise<{ modelId?: string }>;
}

export default async function ChatPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const mergedParams = { ...resolvedParams, modelId: resolvedSearchParams.modelId || resolvedParams.modelId };
  return <ChatDetailScreen chatParams={mergedParams} />;
}