export interface VideoEvent {
  id: string;
  type:
    | 'delivered'
    | 'opened'
    | 'gif_clicked'
    | 'page_viewed'
    | 'video_watched_25'
    | 'video_watched_50'
    | 'video_watched_75'
    | 'video_watched_100'
    | 'cta_clicked'
    | 'meeting_booked';
  timestamp: string;
  metadata?: string;
}

export interface VideoOutreach {
  id: string;
  name: string;
  recipientId: string;
  recipientName: string;
  recipientTitle: string;
  company: string;
  accountId: string;
  status: 'draft' | 'processing' | 'ready' | 'sent' | 'viewed' | 'clicked' | 'booked';
  gifStyle: 'website-scroll' | 'logo-lower-third';
  personalization: {
    websiteUrl?: string;
    highlightSection?: string;
    autoScroll: boolean;
    overlayCallouts: boolean;
    addLogo: boolean;
    addNameLowerThird: boolean;
  };
  analytics: {
    views: number;
    clicks: number;
    bookings: number;
    avgWatchPercent: number;
    events: VideoEvent[];
  };
  duration: number; // seconds
  fileName?: string;
  fileSize?: string;
  resolution?: string;
  createdAt: string;
  sentAt?: string;
  ctaType: 'book_12_min' | 'reply' | 'forward';
  ctaLabel: string;
  calendarLink?: string;
  calendarProvider: 'cal' | 'calendly' | 'manual';
  landingPageSlug?: string;
  subjectLine?: string;
  sequenceId?: string;
  aiSuggestion?: string;
}

export const videoOutreaches: VideoOutreach[] = [
  {
    id: 'v1',
    name: 'Stripe Hiring Pitch — Sarah',
    recipientId: '1',
    recipientName: 'Sarah Chen',
    recipientTitle: 'VP of Engineering',
    company: 'Stripe',
    accountId: '1',
    status: 'booked',
    gifStyle: 'website-scroll',
    personalization: {
      websiteUrl: 'stripe.com/careers',
      highlightSection: 'Careers',
      autoScroll: true,
      overlayCallouts: true,
      addLogo: true,
      addNameLowerThird: true,
    },
    analytics: {
      views: 3,
      clicks: 2,
      bookings: 1,
      avgWatchPercent: 92,
      events: [
        { id: 'e1', type: 'delivered', timestamp: '2026-02-20 09:00' },
        { id: 'e2', type: 'opened', timestamp: '2026-02-20 09:14' },
        { id: 'e3', type: 'gif_clicked', timestamp: '2026-02-20 09:15' },
        { id: 'e4', type: 'page_viewed', timestamp: '2026-02-20 09:15' },
        { id: 'e5', type: 'video_watched_25', timestamp: '2026-02-20 09:15' },
        { id: 'e6', type: 'video_watched_50', timestamp: '2026-02-20 09:16' },
        { id: 'e7', type: 'video_watched_75', timestamp: '2026-02-20 09:16' },
        { id: 'e8', type: 'video_watched_100', timestamp: '2026-02-20 09:17' },
        { id: 'e9', type: 'cta_clicked', timestamp: '2026-02-20 09:18' },
        { id: 'e10', type: 'meeting_booked', timestamp: '2026-02-20 09:19', metadata: 'Tue Feb 24 2pm PT' },
      ],
    },
    duration: 62,
    fileName: 'stripe-sarah-pitch.mp4',
    fileSize: '14.2 MB',
    resolution: '1920x1080',
    createdAt: '2026-02-19',
    sentAt: '2026-02-20 09:00',
    ctaType: 'book_12_min',
    ctaLabel: 'Book 15 min',
    calendarLink: 'https://cal.com/alexkim/15min',
    calendarProvider: 'cal',
    landingPageSlug: 'twill-sarah-stripe',
    subjectLine: 'Quick idea for Stripe\'s hiring, Sarah',
    aiSuggestion: 'Meeting booked! Prepare demo deck with Stripe-specific ROI data.',
  },
  {
    id: 'v2',
    name: 'Databricks ML Hiring — David',
    recipientId: '7',
    recipientName: 'David Zhang',
    recipientTitle: 'Chief People Officer',
    company: 'Databricks',
    accountId: '6',
    status: 'clicked',
    gifStyle: 'website-scroll',
    personalization: {
      websiteUrl: 'databricks.com/company/careers',
      highlightSection: 'Careers',
      autoScroll: true,
      overlayCallouts: true,
      addLogo: true,
      addNameLowerThird: true,
    },
    analytics: {
      views: 2,
      clicks: 1,
      bookings: 0,
      avgWatchPercent: 75,
      events: [
        { id: 'e11', type: 'delivered', timestamp: '2026-02-21 10:30' },
        { id: 'e12', type: 'opened', timestamp: '2026-02-21 11:02' },
        { id: 'e13', type: 'gif_clicked', timestamp: '2026-02-21 11:03' },
        { id: 'e14', type: 'page_viewed', timestamp: '2026-02-21 11:03' },
        { id: 'e15', type: 'video_watched_25', timestamp: '2026-02-21 11:04' },
        { id: 'e16', type: 'video_watched_50', timestamp: '2026-02-21 11:04' },
        { id: 'e17', type: 'video_watched_75', timestamp: '2026-02-21 11:05' },
        { id: 'e18', type: 'cta_clicked', timestamp: '2026-02-21 11:06' },
      ],
    },
    duration: 54,
    fileName: 'databricks-david-ml.mp4',
    fileSize: '11.8 MB',
    resolution: '1920x1080',
    createdAt: '2026-02-21',
    sentAt: '2026-02-21 10:30',
    ctaType: 'book_12_min',
    ctaLabel: 'Book 15 min',
    calendarLink: 'https://calendly.com/alexkim/15min',
    calendarProvider: 'calendly',
    landingPageSlug: 'twill-david-databricks',
    subjectLine: 'Hiring 100 ML engineers faster, David',
    aiSuggestion: 'Follow up now — David watched 75% and clicked CTA but didn\'t book. Send a quick nudge.',
  },
  {
    id: 'v3',
    name: 'Zapier Remote Hiring — Tracy',
    recipientId: '15',
    recipientName: 'Tracy St.Dic',
    recipientTitle: 'Global Head of Talent',
    company: 'Zapier',
    accountId: '15',
    status: 'viewed',
    gifStyle: 'logo-lower-third',
    personalization: {
      websiteUrl: 'zapier.com/jobs',
      highlightSection: 'About',
      autoScroll: false,
      overlayCallouts: false,
      addLogo: true,
      addNameLowerThird: true,
    },
    analytics: {
      views: 1,
      clicks: 0,
      bookings: 0,
      avgWatchPercent: 42,
      events: [
        { id: 'e19', type: 'delivered', timestamp: '2026-02-22 08:00' },
        { id: 'e20', type: 'opened', timestamp: '2026-02-22 08:45' },
        { id: 'e21', type: 'gif_clicked', timestamp: '2026-02-22 08:46' },
        { id: 'e22', type: 'page_viewed', timestamp: '2026-02-22 08:46' },
        { id: 'e23', type: 'video_watched_25', timestamp: '2026-02-22 08:47' },
        { id: 'e24', type: 'video_watched_50', timestamp: '2026-02-22 08:47' },
      ],
    },
    duration: 48,
    fileName: 'zapier-tracy-remote.mp4',
    fileSize: '9.4 MB',
    resolution: '1920x1080',
    createdAt: '2026-02-22',
    sentAt: '2026-02-22 08:00',
    ctaType: 'reply',
    ctaLabel: 'Reply with a time',
    calendarProvider: 'manual',
    landingPageSlug: 'twill-tracy-zapier',
    subjectLine: 'Remote hiring at scale — quick thought, Tracy',
    aiSuggestion: 'Tracy watched 42% — try a shorter version focusing on remote-first hiring.',
  },
  {
    id: 'v4',
    name: '1Password TA Pitch — Lyndsey',
    recipientId: '16',
    recipientName: 'Lyndsey French',
    recipientTitle: 'Global Talent Acquisition Leader',
    company: '1Password',
    accountId: '16',
    status: 'sent',
    gifStyle: 'website-scroll',
    personalization: {
      websiteUrl: '1password.com/careers',
      highlightSection: 'Security',
      autoScroll: true,
      overlayCallouts: false,
      addLogo: true,
      addNameLowerThird: true,
    },
    analytics: {
      views: 0,
      clicks: 0,
      bookings: 0,
      avgWatchPercent: 0,
      events: [
        { id: 'e25', type: 'delivered', timestamp: '2026-02-22 10:00' },
      ],
    },
    duration: 58,
    fileName: '1password-lyndsey-ta.mp4',
    fileSize: '12.1 MB',
    resolution: '1920x1080',
    createdAt: '2026-02-22',
    sentAt: '2026-02-22 10:00',
    ctaType: 'book_12_min',
    ctaLabel: 'Book 15 min',
    calendarLink: 'https://cal.com/alexkim/15min',
    calendarProvider: 'cal',
    landingPageSlug: 'twill-lyndsey-1password',
    subjectLine: 'Post-Series C hiring, Lyndsey — quick video',
    aiSuggestion: 'Delivered 2 hours ago — no open yet. Wait 24h before following up.',
  },
  {
    id: 'v5',
    name: 'Crunchyroll Global Talent — Ray',
    recipientId: '19',
    recipientName: 'Ray Schneider',
    recipientTitle: 'Head of TA / VP Global Talent',
    company: 'Crunchyroll',
    accountId: '19',
    status: 'ready',
    gifStyle: 'website-scroll',
    personalization: {
      websiteUrl: 'crunchyroll.com/about',
      highlightSection: 'About',
      autoScroll: true,
      overlayCallouts: true,
      addLogo: true,
      addNameLowerThird: true,
    },
    analytics: {
      views: 0,
      clicks: 0,
      bookings: 0,
      avgWatchPercent: 0,
      events: [],
    },
    duration: 55,
    fileName: 'crunchyroll-ray-global.mp4',
    fileSize: '10.8 MB',
    resolution: '1920x1080',
    createdAt: '2026-02-22',
    ctaType: 'book_12_min',
    ctaLabel: 'Book 12 min',
    calendarLink: 'https://cal.com/alexkim/12min',
    calendarProvider: 'cal',
    landingPageSlug: 'twill-ray-crunchyroll',
    subjectLine: 'Anime + talent strategy, Ray — made this for you',
    aiSuggestion: 'Video ready! Copy email snippet and send via Gmail.',
  },
  {
    id: 'v6',
    name: 'Vimeo Talent Strategy — Sean',
    recipientId: '11',
    recipientName: 'Sean Mitchell',
    recipientTitle: 'Global Talent Executive',
    company: 'Vimeo',
    accountId: '11',
    status: 'draft',
    gifStyle: 'logo-lower-third',
    personalization: {
      websiteUrl: 'vimeo.com/about',
      highlightSection: 'About',
      autoScroll: false,
      overlayCallouts: false,
      addLogo: true,
      addNameLowerThird: true,
    },
    analytics: {
      views: 0,
      clicks: 0,
      bookings: 0,
      avgWatchPercent: 0,
      events: [],
    },
    duration: 0,
    createdAt: '2026-02-22',
    ctaType: 'reply',
    ctaLabel: 'Reply with a time',
    calendarProvider: 'calendly',
    subjectLine: 'Post-spinoff talent strategy, Sean',
  },
  {
    id: 'v7',
    name: 'Notion Hiring Scale — Marcus',
    recipientId: '2',
    recipientName: 'Marcus Johnson',
    recipientTitle: 'Head of Talent',
    company: 'Notion',
    accountId: '2',
    status: 'viewed',
    gifStyle: 'website-scroll',
    personalization: {
      websiteUrl: 'notion.so/careers',
      highlightSection: 'Careers',
      autoScroll: true,
      overlayCallouts: true,
      addLogo: true,
      addNameLowerThird: false,
    },
    analytics: {
      views: 2,
      clicks: 1,
      bookings: 0,
      avgWatchPercent: 60,
      events: [
        { id: 'e26', type: 'delivered', timestamp: '2026-02-21 14:00' },
        { id: 'e27', type: 'opened', timestamp: '2026-02-21 15:22' },
        { id: 'e28', type: 'gif_clicked', timestamp: '2026-02-21 15:23' },
        { id: 'e29', type: 'page_viewed', timestamp: '2026-02-21 15:23' },
        { id: 'e30', type: 'video_watched_25', timestamp: '2026-02-21 15:24' },
        { id: 'e31', type: 'video_watched_50', timestamp: '2026-02-21 15:24' },
      ],
    },
    duration: 45,
    fileName: 'notion-marcus-hiring.mp4',
    fileSize: '8.7 MB',
    resolution: '1920x1080',
    createdAt: '2026-02-21',
    sentAt: '2026-02-21 14:00',
    ctaType: 'book_12_min',
    ctaLabel: 'Book 15 min',
    calendarLink: 'https://cal.com/alexkim/15min',
    calendarProvider: 'cal',
    landingPageSlug: 'twill-marcus-notion',
    subjectLine: 'Hiring 20 engineers this quarter, Marcus',
    aiSuggestion: 'Marcus watched 60% but didn\'t book. Send a 2-line follow-up referencing hiring 20 engineers.',
  },
  {
    id: 'v8',
    name: 'Chipotle TA Scale — Shelly',
    recipientId: '12',
    recipientName: 'Shelly Grange',
    recipientTitle: 'Director, Talent Acquisition',
    company: 'Chipotle Mexican Grill',
    accountId: '12',
    status: 'processing',
    gifStyle: 'website-scroll',
    personalization: {
      websiteUrl: 'chipotle.com/careers',
      highlightSection: 'Careers',
      autoScroll: true,
      overlayCallouts: true,
      addLogo: true,
      addNameLowerThird: true,
    },
    analytics: {
      views: 0,
      clicks: 0,
      bookings: 0,
      avgWatchPercent: 0,
      events: [],
    },
    duration: 64,
    fileName: 'chipotle-shelly-scale.mp4',
    fileSize: '13.5 MB',
    resolution: '1920x1080',
    createdAt: '2026-02-22',
    ctaType: 'book_12_min',
    ctaLabel: 'Book 12 min',
    calendarLink: 'https://cal.com/alexkim/12min',
    calendarProvider: 'cal',
    subjectLine: '100K+ hires/year — a better way, Shelly',
  },
];

export const videoKpis = {
  totalCreated: 8,
  totalSent: 5,
  totalViews: 8,
  totalClicks: 4,
  totalBookings: 1,
  avgWatchPercent: 54,
  viewRate: '62%',
  clickToViewRate: '50%',
  bookRate: '20%',
};