export type LeaderboardScope = "group" | "stream"

export interface LeaderboardStudent {
  student_id: number
  full_name: string
  photo_url: string | null
  position: number
  points: number
}

export interface MyRankEntry {
  position: number
  total: number
  week_diff: number
  month_diff: number
}

export interface LeaderboardResponse {
  my_rank: {
    group?: MyRankEntry
    stream?: MyRankEntry
  }
  top_group?: LeaderboardStudent[]
  top_stream?: LeaderboardStudent[]
}