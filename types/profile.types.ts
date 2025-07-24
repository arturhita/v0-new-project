export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "client" | "operator" | "admin";
  stage_name?: string | null;
  is_online?: boolean;
  availability?: any;
  services: {
    chat: { enabled: boolean; price_per_minute: number };
    call: { enabled: boolean; price_per_minute: number };
    video: { enabled: boolean; price_per_minute: number };
  };
  [key: string]: any;
}
