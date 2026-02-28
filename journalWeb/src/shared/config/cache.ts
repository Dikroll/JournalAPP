class TTL {
  // Time to live cache values in seconds
  readonly USER_INFO   = 60 * 60 * 24      
  readonly SCHEDULE    = 60 * 60 * 4       
  readonly LEADERBOARD = 60 * 60 * 1      
  readonly ACTIVITY    = 60 * 60 * 2      
  readonly COUNTERS    = 60 * 15           
  readonly HW_COUNTERS = 60 * 15           
  readonly REVIEWS     = 60 * 60 * 6       
  readonly NEWS        = 60 * 60 * 24     
  readonly PAYMENT     = 60 * 60 * 24 * 15 
  readonly SPECS       = 60 * 60 * 24 * 7   
  readonly LIBRARY     = 60 * 60 * 24      
  readonly MARKET      = 60 * 60 * 24     
  readonly FEEDBACK    = 60 * 90           
  readonly QUIZZES     = 60 * 60 * 24    
}

export const ttl = new TTL()