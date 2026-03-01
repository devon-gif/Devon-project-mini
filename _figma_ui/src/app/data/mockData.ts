export interface Account {
  id: string;
  company: string;
  domain: string;
  tier: 'P0' | 'P1' | 'P2';
  industry: string;
  status: 'Active' | 'Prospecting' | 'Nurturing' | 'Closed Won' | 'Closed Lost';
  lastTouch: string;
  nextStep: string;
  owner: string;
  notes: string;
  logo?: string;
  tags: string[];
  peopleCount: number;
  signalScore: number;
  openTargetRoles: number;
  networkOverlap: number;
}

export interface Person {
  id: string;
  name: string;
  title: string;
  company: string;
  accountId: string;
  seniority: 'C-Suite' | 'VP' | 'Director' | 'Manager' | 'IC';
  email: string;
  emailStatus: 'verified' | 'unverified' | 'bounced';
  phone?: string;
  linkedin?: string;
  lastEmail: string;
  replyStatus: 'Replied' | 'Opened' | 'No reply' | 'Bounced';
  nextTask: string;
  personalizationNotes: string[];
  avatar?: string;
}

export interface EmailThread {
  id: string;
  subject: string;
  from: string;
  to: string;
  preview: string;
  date: string;
  unread: boolean;
  labels: string[];
  messages: EmailMessage[];
  personId?: string;
  accountId?: string;
}

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  body: string;
  date: string;
  isOutbound: boolean;
}

export interface Task {
  id: string;
  title: string;
  type: 'follow_up' | 'call' | 'research' | 'intro_request';
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in_progress' | 'done';
  linkedAccount?: string;
  linkedPerson?: string;
  notes: string;
}

export interface SequenceStep {
  id: string;
  order: number;
  type: 'email' | 'linkedin' | 'call' | 'task' | 'video';
  subject?: string;
  body?: string;
  delay: number;
  variants?: { label: string; body: string }[];
}

export interface Sequence {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'draft';
  steps: SequenceStep[];
  enrolled: number;
  replied: number;
  openRate: number;
  replyRate: number;
}

export const accounts: Account[] = [
  {
    id: '1', company: 'Stripe', domain: 'stripe.com', tier: 'P0', industry: 'Fintech',
    status: 'Active', lastTouch: '2 hours ago', nextStep: 'Follow up on curated match', owner: 'You',
    notes: 'Scaling payments eng team; need Staff level', logo: '', tags: ['Hot', 'High Overlap'],
    peopleCount: 4, signalScore: 92, openTargetRoles: 14, networkOverlap: 8,
  },
  {
    id: '2', company: 'Notion', domain: 'notion.so', tier: 'P0', industry: 'Productivity',
    status: 'Prospecting', lastTouch: '1 day ago', nextStep: 'Send vetted profiles video', owner: 'You',
    notes: 'Hiring 20 engineers this quarter', logo: '', tags: ['Hiring Signal'],
    peopleCount: 3, signalScore: 87, openTargetRoles: 20, networkOverlap: 5,
  },
  {
    id: '3', company: 'Figma', domain: 'figma.com', tier: 'P0', industry: 'Design Tools',
    status: 'Nurturing', lastTouch: '3 days ago', nextStep: 'Share placement case study', owner: 'You',
    notes: 'Met at SaaStr conference', logo: '', tags: ['Conference Lead'],
    peopleCount: 2, signalScore: 78, openTargetRoles: 8, networkOverlap: 12,
  },
  {
    id: '4', company: 'Linear', domain: 'linear.app', tier: 'P1', industry: 'Dev Tools',
    status: 'Prospecting', lastTouch: '5 days ago', nextStep: 'Find mutual intro via Twill member', owner: 'You',
    notes: 'Series B, rapid growth', logo: '', tags: ['Funded'],
    peopleCount: 2, signalScore: 74, openTargetRoles: 12, networkOverlap: 3,
  },
  {
    id: '5', company: 'Vercel', domain: 'vercel.com', tier: 'P1', industry: 'Infrastructure',
    status: 'Active', lastTouch: '1 day ago', nextStep: 'Schedule pipeline review with VP Eng', owner: 'You',
    notes: 'Interested in flat-fee placement model', logo: '', tags: ['Enterprise', 'Hot'],
    peopleCount: 3, signalScore: 85, openTargetRoles: 18, networkOverlap: 9,
  },
  {
    id: '6', company: 'Databricks', domain: 'databricks.com', tier: 'P0', industry: 'Data/AI',
    status: 'Active', lastTouch: '6 hours ago', nextStep: 'Send retainer proposal', owner: 'You',
    notes: 'Budget approved Q1; huge AI hiring push', logo: '', tags: ['Hot', 'Budget Ready'],
    peopleCount: 5, signalScore: 95, openTargetRoles: 45, networkOverlap: 22,
  },
  {
    id: '7', company: 'Airtable', domain: 'airtable.com', tier: 'P1', industry: 'Productivity',
    status: 'Nurturing', lastTouch: '1 week ago', nextStep: 'Re-engage via newly hired eng leader', owner: 'You',
    notes: 'Champion changed roles', logo: '', tags: ['At Risk'],
    peopleCount: 2, signalScore: 45, openTargetRoles: 6, networkOverlap: 4,
  },
  {
    id: '8', company: 'Plaid', domain: 'plaid.com', tier: 'P1', industry: 'Fintech',
    status: 'Prospecting', lastTouch: '4 days ago', nextStep: 'Connect via mutual Twill member', owner: 'You',
    notes: 'Warm intro available via Sarah K.', logo: '', tags: ['Warm Intro'],
    peopleCount: 2, signalScore: 68, openTargetRoles: 11, networkOverlap: 15,
  },
  {
    id: '9', company: 'Stan', domain: 'stan.store', tier: 'P1', industry: 'Creator Economy',
    status: 'Prospecting', lastTouch: '2 days ago', nextStep: 'Intro email to People Ops lead', owner: 'You',
    notes: 'Fast-growing creator monetization platform', logo: '', tags: ['Hiring Signal'],
    peopleCount: 1, signalScore: 72, openTargetRoles: 4, networkOverlap: 1,
  },
  {
    id: '10', company: 'SecurityScorecard', domain: 'securityscorecard.com', tier: 'P1', industry: 'Cybersecurity',
    status: 'Prospecting', lastTouch: '3 days ago', nextStep: 'Send vetted security eng matches', owner: 'You',
    notes: 'Enterprise cybersecurity platform, scaling GTM team', logo: '', tags: ['Enterprise'],
    peopleCount: 1, signalScore: 65, openTargetRoles: 15, networkOverlap: 2,
  },
  {
    id: '11', company: 'Vimeo', domain: 'vimeo.com', tier: 'P0', industry: 'Video Technology',
    status: 'Prospecting', lastTouch: '1 day ago', nextStep: 'Research org chart, drop 3 vetted profiles', owner: 'You',
    notes: 'Public company, restructuring talent org', logo: '', tags: ['Enterprise', 'Hiring Signal'],
    peopleCount: 1, signalScore: 80, openTargetRoles: 22, networkOverlap: 7,
  },
  {
    id: '12', company: 'Chipotle Mexican Grill', domain: 'chipotle.com', tier: 'P0', industry: 'Restaurant / QSR',
    status: 'Prospecting', lastTouch: '5 days ago', nextStep: 'Connect with Director of TA re: tech team', owner: 'You',
    notes: 'Massive hiring volume, exploring tech-enabled recruiting', logo: '', tags: ['Enterprise', 'High Volume'],
    peopleCount: 1, signalScore: 77, openTargetRoles: 30, networkOverlap: 0,
  },
  {
    id: '13', company: 'FranklinCovey', domain: 'franklincovey.com', tier: 'P2', industry: 'Leadership Development',
    status: 'Prospecting', lastTouch: '1 week ago', nextStep: 'Warm intro via leadership network', owner: 'You',
    notes: 'Global leadership training company', logo: '', tags: ['Warm Intro'],
    peopleCount: 1, signalScore: 55, openTargetRoles: 5, networkOverlap: 1,
  },
  {
    id: '14', company: 'Amplify', domain: 'amplify.com', tier: 'P1', industry: 'Education Technology',
    status: 'Prospecting', lastTouch: '4 days ago', nextStep: 'Send intro email w/ 2 EdTech candidate drops', owner: 'You',
    notes: 'Expanding product & eng', logo: '', tags: ['Funded', 'Hiring Signal'],
    peopleCount: 1, signalScore: 70, openTargetRoles: 9, networkOverlap: 2,
  },
  {
    id: '15', company: 'Zapier', domain: 'zapier.com', tier: 'P0', industry: 'Automation / SaaS',
    status: 'Prospecting', lastTouch: '2 days ago', nextStep: 'Personalized video to Global Head of Talent', owner: 'You',
    notes: 'Fully remote, known for strong remote culture', logo: '', tags: ['Remote-First', 'Hot'],
    peopleCount: 1, signalScore: 88, openTargetRoles: 16, networkOverlap: 14,
  },
  {
    id: '16', company: '1Password', domain: '1password.com', tier: 'P0', industry: 'Cybersecurity',
    status: 'Prospecting', lastTouch: '3 days ago', nextStep: 'Reach Global TA Leader with warm angle', owner: 'You',
    notes: 'Post-Series C ($620M), aggressive hiring across eng & GTM', logo: '', tags: ['Funded', 'Enterprise'],
    peopleCount: 1, signalScore: 84, openTargetRoles: 25, networkOverlap: 6,
  },
  {
    id: '17', company: 'The Ambr Group', domain: 'theambrgroup.com', tier: 'P2', industry: 'HR Consulting',
    status: 'Prospecting', lastTouch: '1 week ago', nextStep: 'Explore partnership / channel play with CEO', owner: 'You',
    notes: 'HR advisory firm, potential channel partner for Twill', logo: '', tags: ['Partner Lead'],
    peopleCount: 1, signalScore: 50, openTargetRoles: 2, networkOverlap: 0,
  },
  {
    id: '18', company: 'Stuf Storage', domain: 'stufstorage.com', tier: 'P2', industry: 'Storage / Real Estate',
    status: 'Prospecting', lastTouch: '6 days ago', nextStep: 'Send intro video to Chief of Staff', owner: 'You',
    notes: 'Fast-growing startup, Chief of Staff runs People', logo: '', tags: ['Startup'],
    peopleCount: 1, signalScore: 48, openTargetRoles: 3, networkOverlap: 1,
  },
  {
    id: '19', company: 'Crunchyroll', domain: 'crunchyroll.com', tier: 'P0', industry: 'Entertainment / Streaming',
    status: 'Prospecting', lastTouch: '2 days ago', nextStep: 'Outreach to VP Global Talent w/ video eng match', owner: 'You',
    notes: 'Sony-owned, ramping eng & content ops hiring globally', logo: '', tags: ['Enterprise', 'Hiring Signal'],
    peopleCount: 1, signalScore: 82, openTargetRoles: 18, networkOverlap: 5,
  },
  {
    id: '20', company: 'Vitalize', domain: 'vitalize.vc', tier: 'P1', industry: 'Venture Capital',
    status: 'Prospecting', lastTouch: '4 days ago', nextStep: 'Intro to founders — pitch portfolio-wide hiring access', owner: 'You',
    notes: 'YC-backed VC firm, can unlock portfolio companies', logo: '', tags: ['VC / Channel', 'Warm Intro'],
    peopleCount: 2, signalScore: 75, openTargetRoles: 1, networkOverlap: 3,
  },
];

export const people: Person[] = [
  {
    id: '1', name: 'Sarah Chen', title: 'VP of Engineering', company: 'Stripe', accountId: '1',
    seniority: 'VP', email: 'sarah.chen@stripe.com', emailStatus: 'verified',
    phone: '+1 415-555-0101', linkedin: 'linkedin.com/in/sarahchen',
    lastEmail: '2 hours ago', replyStatus: 'Replied', nextTask: 'Schedule demo call',
    personalizationNotes: ['Spoke at GraphQL conf 2025', 'Ex-Google, moved to Stripe 2024', 'Cares about developer velocity'],
  },
  {
    id: '2', name: 'Marcus Johnson', title: 'Head of Talent', company: 'Notion', accountId: '2',
    seniority: 'Director', email: 'marcus@notion.so', emailStatus: 'verified',
    linkedin: 'linkedin.com/in/marcusjohnson',
    lastEmail: '1 day ago', replyStatus: 'Opened', nextTask: 'Send follow-up',
    personalizationNotes: ['Posted about hiring challenges on LinkedIn', 'Previously at Uber recruiting', 'Interested in AI-assisted screening'],
  },
  {
    id: '3', name: 'Emily Park', title: 'CTO', company: 'Figma', accountId: '3',
    seniority: 'C-Suite', email: 'emily.park@figma.com', emailStatus: 'verified',
    linkedin: 'linkedin.com/in/emilypark',
    lastEmail: '3 days ago', replyStatus: 'No reply', nextTask: 'Try different angle',
    personalizationNotes: ['MIT CS grad', 'Built Figma multiplayer engine', 'Values technical depth'],
  },
  {
    id: '4', name: 'Alex Rivera', title: 'Engineering Manager', company: 'Stripe', accountId: '1',
    seniority: 'Manager', email: 'alex.r@stripe.com', emailStatus: 'verified',
    lastEmail: '1 day ago', replyStatus: 'Replied', nextTask: 'Intro to VP',
    personalizationNotes: ['Manages payments team', 'Referred by Sarah Chen', 'Looking to grow team by 5'],
  },
  {
    id: '5', name: 'Jordan Kim', title: 'VP of People', company: 'Linear', accountId: '4',
    seniority: 'VP', email: 'jordan@linear.app', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/jordankim',
    lastEmail: '5 days ago', replyStatus: 'No reply', nextTask: 'Research and re-engage',
    personalizationNotes: ['Ex-Shopify', 'Advocates async-first culture', 'Building remote-first team'],
  },
  {
    id: '6', name: 'Priya Patel', title: 'Director of Engineering', company: 'Vercel', accountId: '5',
    seniority: 'Director', email: 'priya@vercel.com', emailStatus: 'verified',
    phone: '+1 650-555-0202',
    lastEmail: '1 day ago', replyStatus: 'Replied', nextTask: 'Send pricing deck',
    personalizationNotes: ['Led Next.js adoption at previous company', 'Scaling from 50 to 200 eng', 'Budget decision maker'],
  },
  {
    id: '7', name: 'David Zhang', title: 'Chief People Officer', company: 'Databricks', accountId: '6',
    seniority: 'C-Suite', email: 'dzhang@databricks.com', emailStatus: 'verified',
    phone: '+1 415-555-0303', linkedin: 'linkedin.com/in/davidzhang',
    lastEmail: '6 hours ago', replyStatus: 'Replied', nextTask: 'Schedule exec review',
    personalizationNotes: ['Needs to hire 100 ML engineers', 'Pain point: time-to-fill > 60 days', 'Champion for Twill'],
  },
  {
    id: '8', name: 'Lisa Nakamura', title: 'Head of Recruiting', company: 'Databricks', accountId: '6',
    seniority: 'Director', email: 'lnakamura@databricks.com', emailStatus: 'verified',
    lastEmail: '1 day ago', replyStatus: 'Opened', nextTask: 'Follow up on proposal',
    personalizationNotes: ['Reports to David Zhang', 'Evaluating 3 vendors', 'Wants warm intros pipeline'],
  },
  {
    id: '9', name: 'Alexa Ishibashi', title: 'People Operations Lead', company: 'Stan', accountId: '9',
    seniority: 'Manager', email: 'alexa.ishibashi@stan.store', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/alexaishibashi',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Send intro email',
    personalizationNotes: ['Leads People Ops at fast-growing creator economy platform', 'Likely building out talent function from scratch', 'Creator-first culture — personalize around mission'],
  },
  {
    id: '10', name: 'Taha Usmani', title: 'Talent Acquisition Manager', company: 'SecurityScorecard', accountId: '10',
    seniority: 'Manager', email: 'taha.usmani@securityscorecard.com', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/taha-usmani',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Send matched profiles',
    personalizationNotes: ['Based in Canada, manages TA for cybersecurity firm', 'SecurityScorecard is enterprise-focused — compliance angle', 'Likely hiring security engineers & GTM roles'],
  },
  {
    id: '11', name: 'Sean Mitchell', title: 'Global Talent Executive', company: 'Vimeo', accountId: '11',
    seniority: 'VP', email: 'sean.mitchell@vimeo.com', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/seanpmitchell',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Research and draft personalized outreach',
    personalizationNotes: ['Global talent leader at public video tech company', 'Vimeo restructured post-spin-off — likely rebuilding talent strategy', 'Executive-level — lead with ROI and strategic value'],
  },
  {
    id: '12', name: 'Shelly Grange', title: 'Director, Talent Acquisition', company: 'Chipotle Mexican Grill', accountId: '12',
    seniority: 'Director', email: 'shelly.grange@chipotle.com', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/shellymeardygrange',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Draft outreach emphasizing high-volume tech hiring',
    personalizationNotes: ['Directs TA for one of the largest QSR chains in the US', 'Chipotle hires 100K+ annually — volume is the pain point', 'Tech-enabled recruiting is a growing initiative'],
  },
  {
    id: '13', name: 'Aaron Thompson', title: 'Director of Recruitment', company: 'FranklinCovey', accountId: '13',
    seniority: 'Director', email: 'aaron.thompson@franklincovey.com', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/aarondthompson',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Explore warm intro via leadership network',
    personalizationNotes: ['Leads recruitment for global leadership development company', 'FranklinCovey hires consultants and L&D professionals', 'Warm intro angle likely more effective than cold outreach'],
  },
  {
    id: '14', name: 'Troy Brennan', title: 'Talent Acquisition Director', company: 'Amplify', accountId: '14',
    seniority: 'Director', email: 'troy.brennan@amplify.com', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/troysbrennan',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Send intro email',
    personalizationNotes: ['Directs TA at K-12 edtech backed by Emerson Collective', 'Amplify expanding product & engineering teams', 'Mission-driven company — lead with impact angle'],
  },
  {
    id: '15', name: 'Tracy St.Dic', title: 'Global Head of Talent', company: 'Zapier', accountId: '15',
    seniority: 'VP', email: 'tracy.stdic@zapier.com', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/tracy-stdic',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Draft personalized outreach',
    personalizationNotes: ['Global Head of Talent at fully remote automation giant', 'Zapier is 800+ employees, known for remote-first culture', 'High bar for quality — warm referrals align perfectly with Twill'],
  },
  {
    id: '16', name: 'Lyndsey French', title: 'Global TA Leader', company: '1Password', accountId: '16',
    seniority: 'VP', email: 'lyndsey.french@1password.com', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/lyndseyfrench',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Reach out with warm angle',
    personalizationNotes: ['Leads global TA for 1Password post $620M Series C', 'Aggressive hiring across engineering and GTM', 'Canada-based — consider timezone in outreach'],
  },
  {
    id: '17', name: 'Andrew Savage', title: 'CEO', company: 'The Ambr Group', accountId: '17',
    seniority: 'C-Suite', email: 'andrew@theambrgroup.com', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/savageandrew',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Explore partnership opportunity',
    personalizationNotes: ['CEO of HR advisory firm — potential channel partner', 'Could refer Twill to his client base', 'Position as partnership, not a sales pitch'],
  },
  {
    id: '18', name: 'Michelle Morand', title: 'Chief of Staff', company: 'Stuf Storage', accountId: '18',
    seniority: 'C-Suite', email: 'michelle.morand@stufstorage.com', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/michelle-morand',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Send intro email',
    personalizationNotes: ['Chief of Staff likely owns People function at lean startup', 'Stuf is fast-growing storage company', 'Startup context — lead with speed and quality of hires'],
  },
  {
    id: '19', name: 'Ray Schneider', title: 'VP Global Talent', company: 'Crunchyroll', accountId: '19',
    seniority: 'VP', email: 'ray.schneider@crunchyroll.com', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/raymondschneider',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Draft outreach referencing media hiring',
    personalizationNotes: ['VP-level talent leader at Sony-owned anime streaming platform', 'Crunchyroll ramping global eng and content ops hiring', 'Niche industry — personalize around entertainment/media talent challenges'],
  },
  {
    id: '20', name: 'Veeraj Shah', title: 'Founder', company: 'Vitalize', accountId: '20',
    seniority: 'C-Suite', email: 'veeraj@vitalize.vc', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/veeraj-shah',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Intro to explore portfolio deal',
    personalizationNotes: ['YC-backed VC founder — can unlock portfolio companies', 'Vitalize invests in future-of-work and HR tech', 'Frame Twill as a value-add for his portfolio'],
  },
  {
    id: '21', name: 'Sanketh Andhavarapu', title: 'Co-founder', company: 'Vitalize', accountId: '20',
    seniority: 'C-Suite', email: 'sanketh@vitalize.vc', emailStatus: 'unverified',
    linkedin: 'linkedin.com/in/sanketh-andhavarapu',
    lastEmail: 'Never', replyStatus: 'No reply', nextTask: 'Loop in alongside Veeraj',
    personalizationNotes: ['Co-founder at Vitalize VC', 'Likely involved in portfolio support and talent strategy', 'Engage together with Veeraj for stronger intro'],
  },
];

export const emailThreads: EmailThread[] = [
  {
    id: '1', subject: 'Re: Twill demo for Stripe engineering hiring',
    from: 'Sarah Chen', to: 'You', preview: 'Thanks for the follow-up! I\'d love to schedule a demo for next week...',
    date: '2h ago', unread: true, labels: ['Hot', 'AI suggested reply'],
    personId: '1', accountId: '1',
    messages: [
      { id: 'm1', from: 'You', to: 'sarah.chen@stripe.com', body: 'Hi Sarah,\n\nGreat meeting you at the engineering leadership dinner last week. As discussed, Twill helps companies like Stripe find vetted engineering talent through warm referrals — cutting time-to-hire by 40%.\n\nWould you be open to a 20-minute demo next week?\n\nBest,\nAlex', date: '1 day ago', isOutbound: true },
      { id: 'm2', from: 'sarah.chen@stripe.com', to: 'You', body: 'Thanks for the follow-up! I\'d love to schedule a demo for next week. We\'re scaling the payments team and traditional recruiting hasn\'t been fast enough.\n\nCan you do Tuesday at 2pm PT?\n\nSarah', date: '2h ago', isOutbound: false },
    ],
  },
  {
    id: '2', subject: 'Introduction: Twill — vetted talent referrals',
    from: 'You', to: 'Marcus Johnson', preview: 'Hi Marcus, I noticed Notion is hiring 20 engineers this quarter...',
    date: '1d ago', unread: false, labels: ['Waiting'],
    personId: '2', accountId: '2',
    messages: [
      { id: 'm3', from: 'You', to: 'marcus@notion.so', body: 'Hi Marcus,\n\nI noticed Notion is hiring 20 engineers this quarter — congrats on the growth! Given the volume, I imagine sourcing quality candidates at speed is a real challenge.\n\nTwill connects companies with pre-vetted talent recommended by people they trust. Our clients typically see 3x higher conversion rates vs. cold outreach.\n\nWorth a quick chat?\n\nBest,\nAlex', date: '1d ago', isOutbound: true },
    ],
  },
  {
    id: '3', subject: 'Re: Quick question about Databricks hiring plans',
    from: 'David Zhang', to: 'You', preview: 'Alex, this is exactly what we need. Let me loop in Lisa from my team...',
    date: '6h ago', unread: true, labels: ['Hot'],
    personId: '7', accountId: '6',
    messages: [
      { id: 'm4', from: 'You', to: 'dzhang@databricks.com', body: 'Hi David,\n\nI saw Databricks just closed the Series I — huge congrats! With 100 ML engineers to hire, I imagine the pressure on your recruiting team is intense.\n\nTwill specializes in exactly this: warm, vetted referrals for hard-to-fill technical roles. We\'ve helped similar companies cut time-to-fill from 60+ days to under 30.\n\nWould it make sense to connect?\n\nBest,\nAlex', date: '1d ago', isOutbound: true },
      { id: 'm5', from: 'dzhang@databricks.com', to: 'You', body: 'Alex, this is exactly what we need. Let me loop in Lisa from my team who\'s leading the ML hiring initiative.\n\nCan you send over a brief overview of pricing and how the warm intro process works?\n\nDavid', date: '6h ago', isOutbound: false },
    ],
  },
  {
    id: '4', subject: 'Twill for Figma engineering team',
    from: 'You', to: 'Emily Park', preview: 'Hi Emily, loved your talk on multiplayer architecture...',
    date: '3d ago', unread: false, labels: ['Needs follow-up'],
    personId: '3', accountId: '3',
    messages: [
      { id: 'm6', from: 'You', to: 'emily.park@figma.com', body: 'Hi Emily,\n\nLoved your talk on multiplayer architecture at the systems conf — really insightful stuff.\n\nI\'m reaching out because Twill has helped several design tool companies (including one you might know) build world-class engineering teams through trusted referrals.\n\nWould you be open to learning more?\n\nBest,\nAlex', date: '3d ago', isOutbound: true },
    ],
  },
  {
    id: '5', subject: 'Re: Vercel enterprise plan discussion',
    from: 'Priya Patel', to: 'You', preview: 'Sounds great! Let me review the deck and get back to you by EOW...',
    date: '1d ago', unread: false, labels: ['AI suggested reply'],
    personId: '6', accountId: '5',
    messages: [
      { id: 'm7', from: 'You', to: 'priya@vercel.com', body: 'Hi Priya,\n\nFollowing up on our call last week. I\'ve attached the enterprise pricing deck as discussed.\n\nThe key differentiator for Vercel would be our referral quality score — every candidate comes with a trust graph showing who recommended them and why.\n\nHappy to walk through any questions.\n\nBest,\nAlex', date: '2d ago', isOutbound: true },
      { id: 'm8', from: 'priya@vercel.com', to: 'You', body: 'Sounds great! Let me review the deck and get back to you by EOW. I\'m especially interested in the trust graph feature — that could be a game changer for our hiring process.\n\nPriya', date: '1d ago', isOutbound: false },
    ],
  },
];

export const tasks: Task[] = [
  { id: '1', title: 'Schedule demo call with Sarah Chen', type: 'call', dueDate: 'Today', priority: 'high', status: 'todo', linkedAccount: 'Stripe', linkedPerson: 'Sarah Chen', notes: 'She suggested Tuesday 2pm PT' },
  { id: '2', title: 'Send proposal to David Zhang', type: 'follow_up', dueDate: 'Today', priority: 'high', status: 'todo', linkedAccount: 'Databricks', linkedPerson: 'David Zhang', notes: 'Include pricing + warm intro process overview' },
  { id: '3', title: 'Follow up with Marcus Johnson', type: 'follow_up', dueDate: 'Tomorrow', priority: 'medium', status: 'todo', linkedAccount: 'Notion', linkedPerson: 'Marcus Johnson', notes: 'Email opened but no reply — try different angle' },
  { id: '4', title: 'Research Emily Park\'s recent talks', type: 'research', dueDate: 'Tomorrow', priority: 'medium', status: 'in_progress', linkedAccount: 'Figma', linkedPerson: 'Emily Park', notes: 'Find personalization hooks' },
  { id: '5', title: 'Send pricing deck to Priya Patel', type: 'follow_up', dueDate: 'Today', priority: 'high', status: 'done', linkedAccount: 'Vercel', linkedPerson: 'Priya Patel', notes: 'Sent enterprise pricing deck' },
  { id: '6', title: 'Request warm intro to Jordan Kim', type: 'intro_request', dueDate: 'This week', priority: 'low', status: 'todo', linkedAccount: 'Linear', linkedPerson: 'Jordan Kim', notes: 'Check mutual connections on LinkedIn' },
  { id: '7', title: 'Follow up with Lisa on proposal', type: 'follow_up', dueDate: 'Tomorrow', priority: 'high', status: 'todo', linkedAccount: 'Databricks', linkedPerson: 'Lisa Nakamura', notes: 'David looped her in — send overview' },
  { id: '8', title: 'Prepare case study for Figma', type: 'research', dueDate: 'This week', priority: 'medium', status: 'todo', linkedAccount: 'Figma', notes: 'Design tools company success story' },
];

export const sequences: Sequence[] = [
  {
    id: '1', name: 'VP Engineering — Candidate Profile Drop', status: 'active',
    enrolled: 45, replied: 12, openRate: 68, replyRate: 27,
    steps: [
      { id: 's1', order: 1, type: 'email', subject: 'Vetted eng matches for {company}', delay: 0, body: 'Hi {first_name}, noticed you opened a Senior Backend role...' },
      { id: 's2', order: 2, type: 'linkedin', delay: 2, body: 'Connect request + note on network overlap' },
      { id: 's2b', order: 3, type: 'video', subject: 'Candidate breakdown for {first_name}', delay: 1, body: 'Video reviewing two anonymized profiles' },
      { id: 's3', order: 4, type: 'email', subject: 'Re: Vetted matches', delay: 3, body: 'Checking if you wanted intro access to those candidates...' },
      { id: 's4', order: 5, type: 'call', delay: 2, body: 'Quick call to gauge headcount priority' },
      { id: 's5', order: 6, type: 'email', subject: 'Closing the loop', delay: 4, body: 'Final email...' },
    ],
  },
  {
    id: '2', name: 'Head of Talent — Network Mapping', status: 'active',
    enrolled: 22, replied: 9, openRate: 82, replyRate: 41,
    steps: [
      { id: 's6', order: 1, type: 'email', subject: '{overlap_count} Twill members at {company}', delay: 0, body: 'Hi {first_name},...' },
      { id: 's7', order: 2, type: 'email', subject: 'Re: Untapped referral network', delay: 3, body: 'Bump email...' },
      { id: 's8', order: 3, type: 'linkedin', delay: 2, body: 'LinkedIn message sharing member graph' },
      { id: 's9', order: 4, type: 'call', delay: 3, body: 'Phone follow-up' },
    ],
  },
  {
    id: '3', name: 'Post-Demo Nurture', status: 'paused',
    enrolled: 15, replied: 6, openRate: 75, replyRate: 40,
    steps: [
      { id: 's10', order: 1, type: 'email', subject: 'Great chatting, {first_name}!', delay: 0, body: 'Thanks for the demo...' },
      { id: 's11', order: 2, type: 'email', subject: 'Case study: How {similar_company} cut time-to-hire in half', delay: 5, body: 'Thought you\'d find this relevant...' },
      { id: 's12', order: 3, type: 'task', delay: 7, body: 'Check in call' },
    ],
  },
];

export const kpiData = {
  accountsTouched: 12,
  accountsTouchedChange: '+3',
  replies: 8,
  repliesChange: '+5',
  meetings: 4,
  meetingsChange: '+2',
  pipelineValue: '$285K',
  pipelineChange: '+$45K',
  overdueTasks: 2,
};

export const weeklyActivityData = [
  { day: 'Mon', emails: 12, replies: 3, meetings: 1 },
  { day: 'Tue', emails: 15, replies: 5, meetings: 2 },
  { day: 'Wed', emails: 8, replies: 2, meetings: 1 },
  { day: 'Thu', emails: 18, replies: 7, meetings: 3 },
  { day: 'Fri', emails: 14, replies: 4, meetings: 2 },
  { day: 'Sat', emails: 3, replies: 1, meetings: 0 },
  { day: 'Sun', emails: 1, replies: 0, meetings: 0 },
];
