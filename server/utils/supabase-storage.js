require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function uploadToSupabase(file, bucket = 'proofs') {
  const ext = file.originalname.split('.').pop();
  const filename = `proof-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const filepath = `${bucket}/${filename}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filepath, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filepath);
  return data.publicUrl;
}

module.exports = { uploadToSupabase };
