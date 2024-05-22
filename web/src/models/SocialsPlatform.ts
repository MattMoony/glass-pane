/**
 * The currently supported social media platforms.
 */
enum SocialsPlatforms {
  OTHER = 1,
  EMAIL,
  PHONE,
  FACEBOOK,
  INSTAGRAM,
  TWITTER,
  TELEGRAM,
  YOUTUBE,
  TIKTOK,
  LINKEDIN,
  XING,
  WEBSITE
}

export const platform_domains: { [platform: number]: RegExp[], } = {
  [SocialsPlatforms.EMAIL]: [ /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, ],
  [SocialsPlatforms.PHONE]: [ /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, ],
  [SocialsPlatforms.FACEBOOK]: [ /^https:\/\/(?:www\.)?facebook\.com\/.*$/, ],
  [SocialsPlatforms.INSTAGRAM]: [ /^https:\/\/(?:www\.)?instagram\.com\/.*$/, ],
  [SocialsPlatforms.TWITTER]: [ /^https:\/\/(?:www\.)?twitter\.com\/.*$/, ],
  [SocialsPlatforms.TELEGRAM]: [ /^https:\/\/t\.me\/.*$/, ],
  [SocialsPlatforms.YOUTUBE]: [ /^https:\/\/(?:www\.)?youtube\.com\/.*$/, /^https:\/\/youtu\.be\/.*$/, ],
  [SocialsPlatforms.TIKTOK]: [ /^https:\/\/(?:www\.)?tiktok\.com\/.*$/, ],
  [SocialsPlatforms.LINKEDIN]: [ /^https:\/\/(?:www\.)?linkedin\.com\/.*$/, ],
  [SocialsPlatforms.XING]: [ /^https:\/\/(?:www\.)?xing\.com\/.*$/, ],
};

export const icons: {[name: string]: { icon: string, title: string, }} = {
  [SocialsPlatforms.PHONE]: { icon: 'fa-solid fa-phone', title: 'Phone', },
  [SocialsPlatforms.EMAIL]: { icon: 'fa-solid fa-envelope', title: 'Email', },
  [SocialsPlatforms.FACEBOOK]: { icon: 'fa-brands fa-facebook', title: 'Facebook', },
  [SocialsPlatforms.INSTAGRAM]: { icon: 'fa-brands fa-instagram', title: 'Instagram', },
  [SocialsPlatforms.TWITTER]: { icon: 'fa-brands fa-twitter', title: 'Twitter', },
  [SocialsPlatforms.TELEGRAM]: { icon: 'fa-brands fa-telegram', title: 'Telegram', },
  [SocialsPlatforms.LINKEDIN]: { icon: 'fa-brands fa-linkedin', title: 'LinkedIn', },
  [SocialsPlatforms.XING]: { icon: 'fa-brands fa-xing', title: 'Xing', },
  [SocialsPlatforms.YOUTUBE]: { icon: 'fa-brands fa-youtube', title: 'YouTube', },
  [SocialsPlatforms.TIKTOK]: { icon: 'fa-brands fa-tiktok', title: 'TikTok', },
  [SocialsPlatforms.WEBSITE]: { icon: 'fa-solid fa-globe', title: 'Website', },
  [SocialsPlatforms.OTHER]: { icon: 'fa-solid fa-hashtag', title: 'Other', },
};

export default SocialsPlatforms;
