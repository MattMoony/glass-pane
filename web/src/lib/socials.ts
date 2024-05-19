import SocialsPlatforms, { platform_domains } from "@/models/SocialsPlatform";

export const recognize_platform = (url: string): SocialsPlatforms => {
  for (const platform in platform_domains) {
    if (platform_domains[platform].some((domain) => domain.test(url))) {
      return parseInt(platform);
    }
  }
  return SocialsPlatforms.OTHER;
};