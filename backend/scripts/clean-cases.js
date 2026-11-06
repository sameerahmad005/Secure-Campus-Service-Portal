import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { supabase } from '../src/config/supabase.js';

async function clearWorkflowData() {
  console.log('Clearing complaints, service requests, status history, and feedback from Supabase...');

  // 1. Delete status history
  const { error: errHist } = await supabase.from('status_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errHist) console.error('Status history delete error:', errHist.message);
  else console.log('✓ Status history cleared.');

  // 2. Delete attachments
  const { error: errAttach } = await supabase.from('attachments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errAttach) console.error('Attachments delete error:', errAttach.message);
  else console.log('✓ Attachments cleared.');

  // 3. Delete feedback
  const { error: errFeed } = await supabase.from('feedback').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errFeed) console.error('Feedback delete error:', errFeed.message);
  else console.log('✓ Feedback cleared.');

  // 4. Delete complaints
  const { error: errComp } = await supabase.from('complaints').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errComp) console.error('Complaints delete error:', errComp.message);
  else console.log('✓ Complaints cleared.');

  // 5. Delete service requests
  const { error: errReq } = await supabase.from('service_requests').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (errReq) console.error('Service requests delete error:', errReq.message);
  else console.log('✓ Service requests cleared.');

  // Verify counts
  const { count: compCount } = await supabase.from('complaints').select('*', { count: 'exact', head: true });
  const { count: reqCount } = await supabase.from('service_requests').select('*', { count: 'exact', head: true });
  const { count: histCount } = await supabase.from('status_history').select('*', { count: 'exact', head: true });

  console.log(`\nVerification:`);
  console.log(`- complaints in Supabase: ${compCount ?? 0}`);
  console.log(`- service_requests in Supabase: ${reqCount ?? 0}`);
  console.log(`- status_history in Supabase: ${histCount ?? 0}`);
}

clearWorkflowData();
