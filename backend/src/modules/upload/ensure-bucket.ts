import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
  );

  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === 'videos');

  const BUCKET_OPTIONS = {
    public: true,
    fileSizeLimit: 50 * 1024 * 1024, // 50 MB (Supabase free tier max)
    allowedMimeTypes: ['video/*'],
  };

  if (!exists) {
    const { error } = await supabase.storage.createBucket('videos', BUCKET_OPTIONS);
    if (error) {
      console.error('Error creating bucket:', error.message);
      process.exit(1);
    }
    console.log('Bucket "videos" created successfully');
  } else {
    const { error } = await supabase.storage.updateBucket('videos', BUCKET_OPTIONS);
    if (error) {
      console.error('Error updating bucket:', error.message);
      process.exit(1);
    }
    console.log('Bucket "videos" updated (250 MB limit, video/* only)');
  }
}

main();
