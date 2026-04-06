export type HabitItem = {
  id: number;
  name: string;
  done: boolean;
};

export type Sidequest = {
  id: number;
  title: string;
  date: string;
  xp: string;
  brownie: string;
  achievements: string[];
  summary: string;
};

export type BetLog = {
  date: string;
  verificationStatus: string;
  verifiedBy: string | null;
};

export type Bet = {
  id: string;
  title: string;
  activity: string;
  opponent: string;
  stake: string;
  status: "pending" | "accepted" | "completed" | "failed";
  frequency: string;
  startDate: string;
  endDate: string;
  linkedSidequests: string[];
  logsThisMonth: BetLog[];
};

export type Trophy = {
  id: string;
  name: string;
  imageUrl: string;
  earnedAt: string;
};

export type RoomImage = {
  id: string;
  name: string;
  url: string;
  uploadedAt: string;
};

export type UserStats = {
  reputationPoints: number;
  browniePoints: number;
  wins: number;
};

export type UserProfile = {
  displayName: string;
  memberSince: string;
};

export type UserDataDocument = {
  habits: HabitItem[];
  sidequests: Sidequest[];
  bets: Bet[];
  trophies: Trophy[];
  roomImages: RoomImage[];
  stats: UserStats;
  profile: UserProfile;
  updatedAt: string;
};

export type SessionUser = {
  id: string;
  email: string;
  isGuest: boolean;
};
