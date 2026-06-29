'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Heart, ArrowLeft, Calendar, MapPin, Share2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { cmsService } from '@/lib/api/services/cms.service';
import { SuccessStory } from '@/types';

export default function SuccessStoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [story, setStory] = useState<SuccessStory | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    loadStory();
  }, [params.id]);

  const loadStory = async () => {
    setLoading(true);
    try {
      const data = await cmsService.getSuccessStory(params.id as string);
      setStory(data);
    } catch {
      setStory(null);
    } finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (!story) return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h2 className="text-2xl font-semibold mb-4">Story not found</h2>
      <Button asChild><Link href="/success-stories">Browse Success Stories</Link></Button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {story.coverImage && (
            <div className="relative rounded-xl overflow-hidden bg-muted aspect-video mb-6">
              <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
            </div>
          )}

          <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
          <p className="text-xl text-muted-foreground mb-6">{story.groomName && story.brideName ? `${story.groomName} & ${story.brideName}` : ''}</p>

          <div className="prose max-w-none mb-8" dangerouslySetInnerHTML={{ __html: story.content }} />
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Avatar className="h-16 w-16 bg-primary/10">
                <span className="text-lg font-semibold text-primary">
                  {story.groomName?.[0] || ''}{story.brideName?.[0] || ''}
                </span>
              </Avatar>
              <div>
                <p className="font-semibold">{story.groomName && story.brideName ? `${story.groomName} & ${story.brideName}` : story.title}</p>
                {story.weddingDate && (
                  <p className="text-sm text-muted-foreground">
                    Together since {new Date(story.weddingDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {story.weddingDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Married on {new Date(story.weddingDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              )}
              {story.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{story.location}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-6 pt-4 border-t">
              <Button variant="ghost" size="sm" onClick={() => setLiked(!liked)} className={liked ? 'text-red-500' : ''}>
                <Heart className={`mr-1.5 h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm"><Share2 className="mr-1.5 h-4 w-4" /> Share</Button>
            </div>
          </Card>

          {story.brideName && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Bride</h3>
              <p className="text-muted-foreground">{story.brideName}</p>
            </Card>
          )}

          {story.groomName && (
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Groom</h3>
              <p className="text-muted-foreground">{story.groomName}</p>
            </Card>
          )}

          <Button asChild className="w-full"><Link href="/auth/register">Start Your Story</Link></Button>
        </div>
      </div>
    </div>
  );
}
