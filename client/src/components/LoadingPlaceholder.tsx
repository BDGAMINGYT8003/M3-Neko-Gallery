import { Card } from '@/components/ui/card';

export default function LoadingPlaceholder() {
  return (
    <Card className="overflow-hidden">
      <div className="w-full aspect-square bg-muted animate-pulse" />
    </Card>
  );
}
