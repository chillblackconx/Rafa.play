import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://svvsvwvaskvyvcxudbdg.supabase.co";
const SUPABASE_KEY = "sb_publishable_qYyRmfzb-ZUXXuX_90T1Rw_MGmrQ22X";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
