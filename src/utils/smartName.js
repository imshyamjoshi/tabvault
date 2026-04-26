const STOPWORDS = new Set([
  'the','a','an','and','or','of','in','on','at','to','for','with','by',
  'is','are','was','were','be','been','being','have','has','had','do',
  'does','did','will','would','could','should','may','might','shall',
  'new','tab','page','home','index','untitled','loading','my','your',
  'com','org','net','io','app','web','site','login','sign','log',
])

const BRAND_MAP = {
  'github.com': 'GitHub', 'gitlab.com': 'GitLab', 'bitbucket.org': 'Bitbucket',
  'google.com': 'Google', 'docs.google.com': 'Google Docs', 'mail.google.com': 'Gmail',
  'drive.google.com': 'Google Drive', 'calendar.google.com': 'Google Calendar',
  'youtube.com': 'YouTube', 'twitter.com': 'Twitter', 'x.com': 'X',
  'linkedin.com': 'LinkedIn', 'notion.so': 'Notion', 'figma.com': 'Figma',
  'vercel.com': 'Vercel', 'netlify.com': 'Netlify', 'stackoverflow.com': 'Stack Overflow',
  'reddit.com': 'Reddit', 'medium.com': 'Medium', 'dev.to': 'Dev.to',
  'npmjs.com': 'npm', 'chatgpt.com': 'ChatGPT', 'claude.ai': 'Claude',
  'jira.atlassian.com': 'Jira', 'confluence.atlassian.com': 'Confluence',
  'trello.com': 'Trello', 'slack.com': 'Slack', 'discord.com': 'Discord',
}

function getHostname(url) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return null }
}

export function generateSmartName(tabs) {
  const fallback = `Session — ${new Date().toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`
  if (!tabs || tabs.length === 0) return fallback

  // Count hostnames
  const hostCounts = {}
  tabs.forEach(t => {
    const h = getHostname(t.url)
    if (h) hostCounts[h] = (hostCounts[h] || 0) + 1
  })

  const topHost = Object.entries(hostCounts).sort((a, b) => b[1] - a[1])[0]
  if (topHost && topHost[1] >= Math.ceil(tabs.length * 0.5)) {
    const brand = BRAND_MAP[topHost[0]] || capitalize(topHost[0].split('.')[0])
    return `${brand} Session`
  }

  // Count meaningful words across all titles
  const wordCounts = {}
  tabs.forEach(t => {
    if (!t.title) return
    t.title.split(/[\s\-–—|·•\/]+/)
      .map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
      .filter(w => w.length > 2 && !STOPWORDS.has(w))
      .forEach(w => { wordCounts[w] = (wordCounts[w] || 0) + 1 })
  })

  const topWord = Object.entries(wordCounts).sort((a, b) => b[1] - a[1])[0]
  if (topWord && topWord[1] >= 2) {
    return `${capitalize(topWord[0])} Session`
  }

  return fallback
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
