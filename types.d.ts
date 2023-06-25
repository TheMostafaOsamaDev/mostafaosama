export type Project = {
  id: string;
  title: string;
  paths: string[];
  date: string;
  liveDemo: string;
  desc: string;
  repo: string;
  isTop: boolean;
  skills: string[]
}

export type Skill = {
  id: string;
  name: string;
  path: string;
}