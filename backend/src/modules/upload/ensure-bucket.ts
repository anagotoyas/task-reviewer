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

  if (!exists) {
    const { error } = await supabase.storage.createBucket('videos', { public: true });
    if (error) {
      console.error('Error creating bucket:', error.message);
      process.exit(1);
    }
    console.log('Bucket "videos" created successfully');
  } else {
    console.log('Bucket "videos" already exists');
  }
}

main();
