interface WrappedData {
  account: {
    username: string;
    displayName: string;
    bio: string;
    location: string;
    avatarUrl: string;
  };
  followers: number;
  following: number;
  totalLikes: number;
  stats: any;
}

export function getWrappedPage(data: WrappedData, id: string, origin: string): string {
  const { account, followers, following, totalLikes, stats, allTimeStats } = data;

  const monthlyData = stats.monthlyDistribution || new Array(12).fill(0);
  const dayData = stats.dailyDistribution || new Array(7).fill(0);
  const hourlyData = stats.hourlyDistribution || new Array(24).fill(0);

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const maxMonth = Math.max(...monthlyData);
  const mostActiveMonthIdx = monthlyData.indexOf(maxMonth);
  const mostActiveMonth = { name: months[mostActiveMonthIdx], count: maxMonth };

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const peakDayIdx = dayData.indexOf(Math.max(...dayData));
  const peakDay = daysOfWeek[peakDayIdx];

  const maxHourIdx = hourlyData.indexOf(Math.max(...hourlyData));
  const formatHour = (h: number) => h === 0 ? "12 AM" : h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`;
  const peakHour = `${formatHour(maxHourIdx)}-${formatHour((maxHourIdx + 1) % 24)}`;

  const replyPct = Math.round((stats.totalReplies / stats.totalTweets) * 100) || 0;

  const viralTweet = stats.mostLikedTweet;
  const viralText = viralTweet?.full_text?.replace(/https?:\/\/\S+/g, "").trim().slice(0, 100) || "";
  const viralLikes = parseInt(viralTweet?.favorite_count) || 0;
  const viralRTs = parseInt(viralTweet?.retweet_count) || 0;
  const viralDate = viralTweet?.created_at
    ? new Date(viralTweet.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "";
  const viralMedia = viralTweet?.extended_entities?.media?.[0] || viralTweet?.entities?.media?.[0];
  const viralImage = viralMedia?.media_url_https || "";

  const streakMonths = stats.longestStreak >= 30
    ? `over ${Math.floor(stats.longestStreak / 30)} month${stats.longestStreak >= 60 ? "s" : ""}`
    : `${stats.longestStreak || 0} days`;

  const topMentions = stats.topMentions || [];
  const topWords = stats.topWordsList || [];
  const topEmojis = stats.topEmojis || [];
  const topSources = stats.topSources || [];

  // Helper to shorten source names
  const shortenSource = (source: string) => {
    return source
      .replace("Twitter for ", "")
      .replace("Twitter Web App", "Web")
      .replace("Twitter Web Client", "Web");
  };

  const sourceSplit = topSources.length >= 2
    ? `${Math.round((topSources[0][1] / (topSources[0][1] + topSources[1][1])) * 100)}% ${shortenSource(topSources[0][0])} / ${Math.round((topSources[1][1] / (topSources[0][1] + topSources[1][1])) * 100)}% ${shortenSource(topSources[1][0])}`
    : topSources.length === 1 ? `100% ${shortenSource(topSources[0][0])}` : "Unknown";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>@${escapeHtml(account.username)}'s 2025 Twitter Wrapped</title>
  <meta property="og:title" content="@${escapeHtml(account.username)}'s 2025 Twitter Wrapped">
  <meta property="og:description" content="${(stats.totalTweets || 0).toLocaleString()} tweets, ${(stats.totalLikes || 0).toLocaleString()} likes received. See the full wrapped!">
  <meta property="og:image" content="${origin}/og/${id}.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${origin}/og/${id}.png">
  <meta name="twitter:title" content="@${escapeHtml(account.username)}'s 2025 Twitter Wrapped">
  <meta name="twitter:description" content="${(stats.totalTweets || 0).toLocaleString()} tweets, ${(stats.totalLikes || 0).toLocaleString()} likes received.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root{--bg-dark:#050508;--bg-card:rgba(255,255,255,0.03);--cyan:#00f5d4;--magenta:#f72585;--lime:#b8f83a;--gold:#ffd60a;--purple:#7b2cbf;--blue:#4361ee;--text:#fff;--text-dim:rgba(255,255,255,0.5);--text-dimmer:rgba(255,255,255,0.3)}*{margin:0;padding:0;box-sizing:border-box}html{scroll-behavior:smooth}body{font-family:'Outfit',sans-serif;background:var(--bg-dark);color:var(--text);overflow-x:hidden;line-height:1.4}.bg-gradient{position:fixed;top:0;left:0;width:100%;height:100%;z-index:-2;background:radial-gradient(ellipse 80% 50% at 20% 40%,rgba(123,44,191,0.15) 0%,transparent 50%),radial-gradient(ellipse 60% 40% at 80% 20%,rgba(247,37,133,0.1) 0%,transparent 50%),radial-gradient(ellipse 50% 60% at 50% 80%,rgba(0,245,212,0.08) 0%,transparent 50%),var(--bg-dark)}.particles{position:fixed;top:0;left:0;width:100%;height:100%;z-index:-1;overflow:hidden;pointer-events:none}.particle{position:absolute;width:2px;height:2px;background:rgba(255,255,255,0.3);border-radius:50%;animation:float 20s infinite ease-in-out}@keyframes float{0%,100%{transform:translateY(0) translateX(0);opacity:0}10%{opacity:1}90%{opacity:1}100%{transform:translateY(-100vh) translateX(50px);opacity:0}}.noise{position:fixed;top:0;left:0;width:100%;height:100%;z-index:9999;pointer-events:none;opacity:0.03;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")}.serif{font-family:'Instrument Serif',serif}.mono{font-family:'JetBrains Mono',monospace}.container{max-width:1200px;margin:0 auto;padding:0 24px}section{height:100vh;height:100dvh;min-height:100vh;min-height:100dvh;max-height:100vh;max-height:100dvh;display:flex;flex-direction:column;justify-content:center;padding:40px 0;position:relative;overflow:hidden}.hero{text-align:center;position:relative;overflow:hidden}.hero-badge{display:inline-flex;align-items:center;gap:8px;background:var(--bg-card);border:1px solid rgba(255,255,255,0.1);border-radius:100px;padding:10px 24px;font-size:18px;color:var(--text-dim);margin-bottom:32px;animation:fadeInDown 1s ease-out}.hero-badge::before{content:'';width:8px;height:8px;background:var(--cyan);border-radius:50%;animation:pulse 2s infinite}@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.5;transform:scale(1.2)}}.hero-year{font-size:clamp(100px,20vw,280px);font-weight:900;line-height:0.85;letter-spacing:-0.03em;background:linear-gradient(135deg,var(--cyan) 0%,var(--magenta) 50%,var(--gold) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:fadeInUp 1s ease-out 0.2s backwards;position:relative}.hero-year::after{content:'WRAPPED';position:absolute;bottom:-20px;left:50%;transform:translateX(-50%);font-size:clamp(16px,3vw,32px);letter-spacing:0.4em;-webkit-text-fill-color:var(--text-dim);background:none}.hero-username{font-size:clamp(24px,4vw,48px);font-weight:300;margin-top:60px;animation:fadeInUp 1s ease-out 0.4s backwards}.hero-username span{color:var(--cyan);font-weight:600}.hero-avatar{width:80px;height:80px;border-radius:50%;margin:32px auto;border:3px solid var(--cyan);animation:fadeInUp 1s ease-out 0.5s backwards;box-shadow:0 0 40px rgba(0,245,212,0.3)}.hero-bio{font-size:22px;color:rgba(255,255,255,0.85);font-style:italic;animation:fadeInUp 1s ease-out 0.6s backwards}.scroll-indicator{position:absolute;bottom:40px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;color:var(--text-dimmer);font-size:12px;letter-spacing:0.2em;animation:bounce 2s infinite}.scroll-indicator svg{width:24px;height:24px;stroke:currentColor}@keyframes bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(10px)}}.big-stat{text-align:center}.big-stat-label{font-size:18px;letter-spacing:0.3em;text-transform:uppercase;color:var(--text-dim);margin-bottom:20px}.big-stat-number{font-size:clamp(90px,20vw,220px);font-weight:900;line-height:1;letter-spacing:-0.02em}.big-stat-number.cyan{color:var(--cyan)}.big-stat-number.magenta{color:var(--magenta)}.big-stat-number.lime{color:var(--lime)}.big-stat-number.gold{color:var(--gold)}.big-stat-context{font-size:clamp(22px,3.5vw,32px);color:var(--text-dim);margin-top:20px;font-weight:300}.big-stat-context strong{color:var(--text);font-weight:600}.viral-tweet-card{display:flex;gap:24px;align-items:flex-start;background:var(--bg-card);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:24px;margin-bottom:24px}.viral-tweet-content{flex:1;min-width:0}.viral-tweet-image{flex-shrink:0;width:120px;border-radius:12px;overflow:hidden;border:1px solid rgba(255,255,255,0.1)}.viral-tweet-image img{width:100%;height:auto;display:block}.quote-text{font-family:'Instrument Serif',serif;font-size:clamp(32px,5vw,64px);font-style:italic;line-height:1.3;max-width:900px}.quote-stats{display:flex;gap:24px;margin-top:24px}.quote-stat{display:flex;align-items:center;gap:8px;font-size:20px}.quote-stat svg{width:24px;height:24px}.quote-stat.likes{color:var(--magenta)}.quote-stat.rts{color:var(--cyan)}.quote-meta{margin-top:32px;display:flex;align-items:center;gap:16px;color:var(--text-dim);flex-wrap:wrap}.breakdown-section h2{font-size:clamp(36px,6vw,72px);font-weight:800;margin-bottom:48px}.breakdown-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:4px;border-radius:24px;overflow:hidden}.breakdown-item{background:var(--bg-card);padding:32px;text-align:center;position:relative;transition:background 0.3s}.breakdown-item:hover{background:rgba(255,255,255,0.06)}.breakdown-value{font-size:42px;font-weight:700}.breakdown-label{font-size:16px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em;margin-top:8px}.chart-section h2{font-size:clamp(32px,5vw,56px);font-weight:700;margin-bottom:24px}.chart-section p{font-size:18px}.chart-container{background:var(--bg-card);border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:24px;overflow-x:auto}.bar-chart{display:flex;flex-direction:column;gap:12px}.bar-row{display:flex;align-items:center;gap:16px}.bar-label{width:90px;font-size:14px;color:var(--text-dim);text-align:right;flex-shrink:0}.bar-track{flex:1;height:32px;background:rgba(255,255,255,0.03);border-radius:8px;overflow:hidden;position:relative}.bar-fill{height:100%;border-radius:8px;transition:width 1.5s cubic-bezier(0.16,1,0.3,1);display:flex;align-items:center;justify-content:flex-end;padding-right:12px;min-width:fit-content}.bar-value{font-size:12px;font-weight:600;color:var(--bg-dark)}.vertical-chart{display:flex;align-items:flex-end;justify-content:space-between;height:220px;gap:6px;min-width:500px}.v-bar{flex:1;display:flex;flex-direction:column;align-items:center;height:100%}.v-bar-container{flex:1;width:100%;display:flex;flex-direction:column;justify-content:flex-end;position:relative}.v-bar-fill{width:100%;border-radius:6px 6px 0 0;transition:height 1.5s cubic-bezier(0.16,1,0.3,1);position:relative;min-height:4px}.v-bar-value{position:absolute;top:-28px;left:50%;transform:translateX(-50%);font-size:13px;font-weight:600;white-space:nowrap;opacity:0;transition:opacity 0.3s}.v-bar:hover .v-bar-value{opacity:1}.v-bar-label{font-size:14px;color:var(--text-dim);margin-top:10px;text-transform:uppercase}.top-list{display:grid;grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(5,auto);grid-auto-flow:column;gap:12px}.top-item{display:flex;align-items:center;gap:12px;padding:14px 16px;background:var(--bg-card);border:1px solid rgba(255,255,255,0.06);border-radius:14px;transition:all 0.3s}.top-item:hover{background:rgba(255,255,255,0.06);transform:translateX(4px)}.top-rank{width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;border-radius:10px;flex-shrink:0}.top-rank.gold{background:linear-gradient(135deg,#ffd60a,#ffaa00);color:var(--bg-dark)}.top-rank.silver{background:linear-gradient(135deg,#c0c0c0,#888);color:var(--bg-dark)}.top-rank.bronze{background:linear-gradient(135deg,#cd7f32,#8b4513);color:var(--bg-dark)}.top-rank.default{background:rgba(255,255,255,0.1)}.top-info{flex:1;min-width:0}.top-name{font-weight:600;font-size:16px;margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.top-handle{font-size:13px;color:var(--text-dim)}.top-count{font-size:20px;font-weight:700;color:var(--cyan);flex-shrink:0}.top-count-label{font-size:10px;color:var(--text-dim);text-transform:uppercase}.word-cloud{display:flex;flex-wrap:wrap;gap:8px 14px;justify-content:center;align-items:center;padding:16px 12px}.word{transition:transform 0.3s,color 0.3s;cursor:default;line-height:1.2}.word:hover{transform:scale(1.15)}.emoji-grid{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;padding:16px}.emoji-item{text-align:center;transition:transform 0.3s;padding:12px 14px;background:var(--bg-card);border-radius:14px;min-width:75px}.emoji-item:hover{transform:scale(1.1)}.emoji-char{font-size:40px;margin-bottom:6px}.emoji-count{font-size:15px;font-weight:600;color:var(--text-dim)}.fun-facts{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.fun-fact{padding:20px;background:var(--bg-card);border:1px solid rgba(255,255,255,0.06);border-radius:18px;position:relative;text-align:center}.fun-fact-emoji{font-size:36px;margin-bottom:10px}.fun-fact-value{font-size:28px;font-weight:800;margin-bottom:6px}.fun-fact-label{color:var(--text-dim);font-size:14px}.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}.stat-card{background:var(--bg-card);border:1px solid rgba(255,255,255,0.06);border-radius:24px;padding:32px;position:relative;overflow:hidden;transition:transform 0.3s,border-color 0.3s}.stat-card:hover{transform:translateY(-4px);border-color:rgba(255,255,255,0.15)}.stat-card-icon{font-size:32px;margin-bottom:16px}.stat-card-value{font-size:48px;font-weight:800;margin-bottom:8px}.stat-card-label{font-size:14px;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.1em}.final-section{text-align:center}.final-title{font-size:clamp(48px,10vw,120px);font-weight:900;line-height:1;margin-bottom:24px}.final-title .year{background:linear-gradient(135deg,var(--cyan),var(--magenta));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.final-subtitle{font-size:24px;color:var(--text-dim);font-style:italic;font-family:'Instrument Serif',serif}.final-username{margin-top:48px;font-size:18px}.final-username a{color:var(--cyan);text-decoration:none}.cta-section{margin-top:32px}.cta-btn{display:inline-flex;align-items:center;gap:8px;background:linear-gradient(135deg,var(--cyan),var(--magenta));color:var(--bg-dark);font-weight:600;font-size:16px;padding:14px 32px;border:none;border-radius:100px;cursor:pointer;text-decoration:none;transition:transform 0.2s,box-shadow 0.2s}.cta-btn:hover{transform:translateY(-2px);box-shadow:0 8px 32px rgba(0,245,212,0.3)}@keyframes fadeInUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}@keyframes fadeInDown{from{opacity:0;transform:translateY(-20px)}to{opacity:1;transform:translateY(0)}}.reveal{opacity:0;transform:translateY(40px);transition:opacity 0.8s ease-out,transform 0.8s ease-out}.reveal.visible{opacity:1;transform:translateY(0)}.pill{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:100px;font-size:14px;font-weight:500}.pill.cyan{background:rgba(0,245,212,0.15);color:var(--cyan)}.pill.magenta{background:rgba(247,37,133,0.15);color:var(--magenta)}.pill.lime{background:rgba(184,248,58,0.15);color:var(--lime)}.pill.gold{background:rgba(255,214,10,0.15);color:var(--gold)}.mobile-only{display:none}.desktop-only{display:block}@media(max-width:768px){.mobile-only{display:flex}.desktop-only{display:none!important}section{padding:24px 0}.container{padding:0 16px}.big-stat-label{font-size:14px;margin-bottom:12px}.big-stat-number{font-size:clamp(60px,18vw,120px)}.big-stat-context{font-size:18px;margin-top:12px}.hero-year{font-size:clamp(80px,22vw,160px)}.hero-username{font-size:clamp(20px,5vw,32px);margin-top:40px}.hero-avatar{width:60px;height:60px;margin:20px auto}.hero-bio{font-size:18px}.breakdown-section h2{font-size:28px;margin-bottom:24px}.breakdown-grid{grid-template-columns:repeat(3,1fr);gap:2px}.breakdown-item{padding:16px 8px}.breakdown-value{font-size:24px}.breakdown-label{font-size:10px}.chart-section h2{font-size:24px;margin-bottom:16px}.chart-section p{font-size:14px;margin-bottom:16px!important}.stats-grid{grid-template-columns:repeat(3,1fr);gap:8px}.stat-card{padding:16px 12px;border-radius:16px;text-align:center}.stat-card-icon{font-size:24px;margin-bottom:8px}.stat-card-value{font-size:28px}.stat-card-label{font-size:10px}.emoji-grid{gap:6px;padding:4px;max-height:none;overflow-y:visible}.emoji-char{font-size:24px;margin-bottom:2px}.emoji-item{min-width:52px;padding:6px 4px;border-radius:10px}.emoji-count{font-size:11px}.mobile-combo{flex-direction:column;justify-content:center}.mobile-stat-pair{display:flex;flex-direction:column;gap:32px;text-align:center}.mobile-stat .big-stat-number{font-size:clamp(48px,14vw,90px)}.mobile-stat .big-stat-label{font-size:12px;margin-bottom:8px}.mobile-stat .big-stat-context{font-size:16px;margin-top:8px}.vertical-chart{min-width:100%;height:160px;gap:4px}.chart-container{padding:12px;overflow-x:auto}.v-bar-label{font-size:9px}.v-bar-value{font-size:10px;top:-20px}.word-cloud{padding:10px 6px;gap:6px 10px}.top-list{grid-template-columns:repeat(2,1fr);gap:4px}.top-item{padding:6px 8px;gap:6px}.top-rank{width:22px;height:22px;font-size:11px;border-radius:6px}.top-name{font-size:11px}.top-handle{font-size:9px}.top-count{font-size:13px}.top-count-label{font-size:7px}.bar-chart{gap:8px}.bar-row{gap:10px}.bar-label{width:70px;font-size:11px}.bar-track{height:28px}.bar-value{font-size:11px}.fun-facts{grid-template-columns:repeat(3,1fr);gap:8px}.fun-fact{padding:12px 8px;border-radius:14px}.fun-fact-emoji{font-size:28px;margin-bottom:6px}.fun-fact-value{font-size:18px;margin-bottom:4px}.fun-fact-label{font-size:10px}.quote-text{font-size:clamp(24px,6vw,40px)}.viral-tweet-card{gap:16px;padding:16px}.viral-tweet-image{width:80px}.quote-stats{margin-top:16px}.quote-stat{font-size:18px}.quote-stat svg{width:20px;height:20px}.quote-meta{margin-top:20px;font-size:14px}.pill{font-size:12px;padding:6px 12px}.final-title{font-size:clamp(36px,12vw,80px)}.final-subtitle{font-size:18px}.final-username{margin-top:32px;font-size:16px}.scroll-indicator{bottom:20px}}@media(max-width:380px){.breakdown-value{font-size:20px}.fun-facts{grid-template-columns:repeat(2,1fr)}}
  </style>
</head>
<body>
  <div class="bg-gradient"></div>
  <div class="particles" id="particles"></div>
  <div class="noise"></div>

  <section class="hero">
    <div class="container">
      <div class="hero-badge"><span>Year in Tweets</span></div>
      <div class="hero-year">2025</div>
      <div class="hero-username">Check out <span>@${escapeHtml(account.username)}</span>'s year</div>
      ${account.avatarUrl ? `<img src="${escapeHtml(account.avatarUrl)}" alt="avatar" class="hero-avatar">` : ""}
      ${account.bio ? `<div class="hero-bio serif">"${escapeHtml(account.bio)}"</div>` : ""}
    </div>
    <div class="scroll-indicator">
      <span>SCROLL</span>
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
    </div>
  </section>

  <section class="big-stat desktop-only">
    <div class="container reveal">
      <div class="big-stat-label">They posted</div>
      <div class="big-stat-number cyan counter" data-target="${stats.totalTweets || 0}">0</div>
      <div class="big-stat-context">tweets in 2025<br>That's <strong>${stats.tweetsPerDay || 0} tweets per day</strong> on average</div>
    </div>
  </section>

  <section class="big-stat desktop-only">
    <div class="container reveal">
      <div class="big-stat-label">Their tweets received</div>
      <div class="big-stat-number magenta counter" data-target="${stats.totalLikes || 0}">0</div>
      <div class="big-stat-context">likes total<br>averaging <strong>${stats.avgLikesPerTweet || 0} likes</strong> per tweet</div>
    </div>
  </section>

  <section class="mobile-only mobile-combo">
    <div class="container reveal">
      <div class="mobile-stat-pair">
        <div class="mobile-stat">
          <div class="big-stat-label">They posted</div>
          <div class="big-stat-number cyan counter" data-target="${stats.totalTweets || 0}">0</div>
          <div class="big-stat-context">tweets in 2025</div>
        </div>
        <div class="mobile-stat">
          <div class="big-stat-label">They received</div>
          <div class="big-stat-number magenta counter" data-target="${stats.totalLikes || 0}">0</div>
          <div class="big-stat-context">likes total</div>
        </div>
      </div>
    </div>
  </section>

  ${viralText ? `
  <section class="quote-section">
    <div class="container reveal">
      <div class="big-stat-label" style="margin-bottom:16px">Their biggest tweet</div>
      <div class="viral-tweet-card">
        <div class="viral-tweet-content">
          <div class="quote-text" style="font-size:clamp(28px,5vw,48px);margin-bottom:12px">${escapeHtml(viralText)}</div>
        </div>
        ${viralImage ? `<div class="viral-tweet-image"><img src="${escapeHtml(viralImage)}" alt="Tweet media"></div>` : ""}
      </div>
      <div class="quote-stats">
        <div class="quote-stat likes">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
          <span class="counter" data-target="${viralLikes}">0</span>
        </div>
        <div class="quote-stat rts">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
          <span class="counter" data-target="${viralRTs}">0</span>
        </div>
      </div>
      <div class="quote-meta">
        <span class="mono">${viralDate}</span>
        <span class="pill cyan">Their most viral moment</span>
      </div>
    </div>
  </section>
  ` : ""}

  <section class="big-stat desktop-only">
    <div class="container reveal">
      <div class="big-stat-label">Longest posting streak</div>
      <div class="big-stat-number lime counter" data-target="${stats.longestStreak || 0}">0</div>
      <div class="big-stat-context">days in a row<br><strong>That's ${streakMonths}</strong> of consistent posting</div>
    </div>
  </section>

  <section class="breakdown-section">
    <div class="container reveal">
      <h2>How they tweeted</h2>
      <div class="breakdown-grid">
        <div class="breakdown-item">
          <div class="breakdown-value" style="color:var(--cyan)"><span class="counter" data-target="${stats.totalOriginal || 0}">0</span></div>
          <div class="breakdown-label">Original Tweets</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-value" style="color:var(--magenta)"><span class="counter" data-target="${stats.totalReplies || 0}">0</span></div>
          <div class="breakdown-label">Replies</div>
        </div>
        <div class="breakdown-item">
          <div class="breakdown-value" style="color:var(--lime)"><span class="counter" data-target="${stats.totalRetweets || 0}">0</span></div>
          <div class="breakdown-label">Retweets</div>
        </div>
      </div>
      <div style="margin-top:32px;text-align:center">
        <span class="pill magenta">${replyPct}% of their tweets were replies</span>
      </div>
    </div>
  </section>

  <section class="chart-section">
    <div class="container reveal">
      <h2>Their year, month by month</h2>
      <div class="chart-container">
        <div class="vertical-chart" id="monthChart"></div>
      </div>
      <div style="margin-top:24px;text-align:center">
        <span class="pill cyan">${mostActiveMonth.name} was the most active month with ${mostActiveMonth.count.toLocaleString()} tweets</span>
      </div>
    </div>
  </section>

  <section class="chart-section">
    <div class="container reveal">
      <h2>Favorite day to tweet</h2>
      <div class="chart-container">
        <div class="vertical-chart" id="dayChart"></div>
      </div>
      <div style="margin-top:24px;text-align:center">
        <span class="pill lime">${peakDay} is the peak day</span>
      </div>
    </div>
  </section>

  <section class="chart-section">
    <div class="container reveal">
      <h2>When they're most active</h2>
      <div class="chart-container">
        <div class="bar-chart" id="hourChart"></div>
      </div>
      <div style="margin-top:24px;text-align:center">
        <span class="pill magenta">Peak hour: ${peakHour}</span>
      </div>
    </div>
  </section>

  ${topMentions.length > 0 ? `
  <section class="chart-section">
    <div class="container reveal">
      <h2>Their ride-or-dies</h2>
      <p style="color:var(--text-dim);margin-bottom:16px">People they @mentioned the most</p>
      <div class="top-list" id="topMentions"></div>
    </div>
  </section>
  ` : ""}

  ${topWords.length > 0 ? `
  <section class="chart-section">
    <div class="container reveal">
      <h2>Their vocabulary</h2>
      <div class="chart-container" style="padding:20px">
        <div class="word-cloud" id="wordCloud"></div>
      </div>
    </div>
  </section>
  ` : ""}

  ${topEmojis.length > 0 ? `
  <section class="chart-section">
    <div class="container reveal">
      <h2>Their emoji game</h2>
      <div class="emoji-grid" id="emojiGrid"></div>
    </div>
  </section>
  ` : ""}

  <section class="chart-section">
    <div class="container reveal">
      <h2>2025 Fun Facts</h2>
      <div class="fun-facts">
        <div class="fun-fact">
          <div class="fun-fact-emoji">📝</div>
          <div class="fun-fact-value"><span class="counter" data-target="${stats.totalWords || 0}">0</span></div>
          <div class="fun-fact-label">Words written</div>
        </div>
        <div class="fun-fact">
          <div class="fun-fact-emoji">📸</div>
          <div class="fun-fact-value"><span class="counter" data-target="${stats.mediaTypes?.photo || 0}">0</span></div>
          <div class="fun-fact-label">Photos shared</div>
        </div>
        <div class="fun-fact">
          <div class="fun-fact-emoji">🎬</div>
          <div class="fun-fact-value"><span class="counter" data-target="${stats.mediaTypes?.video || 0}">0</span></div>
          <div class="fun-fact-label">Videos posted</div>
        </div>
        <div class="fun-fact">
          <div class="fun-fact-emoji">🎞️</div>
          <div class="fun-fact-value"><span class="counter" data-target="${stats.mediaTypes?.animated_gif || 0}">0</span></div>
          <div class="fun-fact-label">GIFs shared</div>
        </div>
        <div class="fun-fact">
          <div class="fun-fact-emoji">👥</div>
          <div class="fun-fact-value"><span class="counter" data-target="${stats.uniqueMentionsCount || 0}">0</span></div>
          <div class="fun-fact-label">People mentioned</div>
        </div>
        <div class="fun-fact">
          <div class="fun-fact-emoji">📱</div>
          <div class="fun-fact-value">${sourceSplit}</div>
          <div class="fun-fact-label">Source split</div>
        </div>
      </div>
    </div>
  </section>

  ${allTimeStats ? `
  <section class="chart-section">
    <div class="container reveal" style="width:100%">
      <h2>All-time Fun Facts</h2>
      <div class="fun-facts">
        <div class="fun-fact">
          <div class="fun-fact-emoji">🐦</div>
          <div class="fun-fact-value"><span class="counter" data-target="${allTimeStats.totalTweets || 0}">0</span></div>
          <div class="fun-fact-label">Total tweets ever</div>
        </div>
        <div class="fun-fact">
          <div class="fun-fact-emoji">📝</div>
          <div class="fun-fact-value"><span class="counter" data-target="${allTimeStats.totalWords || 0}">0</span></div>
          <div class="fun-fact-label">Words written ever</div>
        </div>
        <div class="fun-fact">
          <div class="fun-fact-emoji">📸</div>
          <div class="fun-fact-value"><span class="counter" data-target="${allTimeStats.mediaTypes?.photo || 0}">0</span></div>
          <div class="fun-fact-label">Photos shared ever</div>
        </div>
        <div class="fun-fact">
          <div class="fun-fact-emoji">🎬</div>
          <div class="fun-fact-value"><span class="counter" data-target="${(allTimeStats.mediaTypes?.video || 0) + (allTimeStats.mediaTypes?.animated_gif || 0)}">0</span></div>
          <div class="fun-fact-label">Videos & GIFs ever</div>
        </div>
        <div class="fun-fact">
          <div class="fun-fact-emoji">👥</div>
          <div class="fun-fact-value"><span class="counter" data-target="${allTimeStats.uniqueMentionsCount || 0}">0</span></div>
          <div class="fun-fact-label">People mentioned ever</div>
        </div>
        <div class="fun-fact">
          <div class="fun-fact-emoji">🎂</div>
          <div class="fun-fact-value">${allTimeStats.firstTweetDate || 'Unknown'}</div>
          <div class="fun-fact-label">First tweet</div>
        </div>
      </div>
    </div>
  </section>
  ` : ""}

  <section class="breakdown-section">
    <div class="container reveal">
      <h2>Their community</h2>
      <div class="stats-grid" style="grid-template-columns:repeat(3,1fr)">
        <div class="stat-card">
          <div class="stat-card-icon">👥</div>
          <div class="stat-card-value" style="color:var(--cyan)"><span class="counter" data-target="${followers}">0</span></div>
          <div class="stat-card-label">Followers</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon">👤</div>
          <div class="stat-card-value" style="color:var(--magenta)"><span class="counter" data-target="${following}">0</span></div>
          <div class="stat-card-label">Following</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-icon">❤️</div>
          <div class="stat-card-value" style="color:var(--gold)"><span class="counter" data-target="${totalLikes}">0</span></div>
          <div class="stat-card-label">All tweets liked</div>
        </div>
      </div>
    </div>
  </section>

  <section class="final-section">
    <div class="container reveal">
      <div class="final-title">See you in<br><span class="year">2026</span></div>
      <div class="final-subtitle serif">Keep tweeting, keep connecting</div>
      <div class="final-username"><a href="https://twitter.com/${escapeHtml(account.username)}" target="_blank">@${escapeHtml(account.username)}</a>${account.location ? ` • ${escapeHtml(account.location)}` : ""}</div>
      <div class="cta-section">
        <a href="/" class="cta-btn">Create Your Own Wrapped</a>
      </div>
    </div>
  </section>

  <script>
    const monthlyData = ${JSON.stringify(monthlyData)};
    const dayData = ${JSON.stringify(dayData)};
    const hourlyData = ${JSON.stringify(hourlyData)};
    const topMentions = ${JSON.stringify(topMentions)};
    const topWords = ${JSON.stringify(topWords)};
    const topEmojis = ${JSON.stringify(topEmojis)};

    function createParticles() {
      const container = document.getElementById('particles');
      if (!container) return;
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 10) + 's';
        container.appendChild(particle);
      }
    }

    function renderVerticalChart(containerId, chartData, labels, colors) {
      const container = document.getElementById(containerId);
      if (!container) return;
      const maxValue = Math.max(...chartData);
      chartData.forEach((value, i) => {
        const bar = document.createElement('div');
        bar.className = 'v-bar';
        const barContainer = document.createElement('div');
        barContainer.className = 'v-bar-container';
        const fill = document.createElement('div');
        fill.className = 'v-bar-fill';
        fill.style.height = '0px';
        fill.style.background = colors[i % colors.length];
        const valueLabel = document.createElement('div');
        valueLabel.className = 'v-bar-value';
        valueLabel.textContent = value.toLocaleString();
        fill.appendChild(valueLabel);
        barContainer.appendChild(fill);
        const label = document.createElement('div');
        label.className = 'v-bar-label';
        label.textContent = labels[i];
        bar.appendChild(barContainer);
        bar.appendChild(label);
        container.appendChild(bar);
        setTimeout(() => {
          const heightPercent = (value / maxValue) * 100;
          fill.style.height = Math.max(heightPercent, 2) + '%';
        }, 300 + i * 80);
      });
    }

    function renderMonthChart() {
      const colors = [];
      for (let i = 0; i < 12; i++) colors.push('hsl(' + (170 + i * 15) + ', 85%, 55%)');
      renderVerticalChart('monthChart', monthlyData, ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], colors);
    }

    function renderDayChart() {
      const colors = ['#f72585','#7b2cbf','#4361ee','#00f5d4','#b8f83a','#ffd60a','#f72585'];
      renderVerticalChart('dayChart', dayData, ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], colors);
    }

    function renderHourChart() {
      const container = document.getElementById('hourChart');
      if (!container) return;
      const periods = [
        { label: '12am - 4am', total: hourlyData.slice(0,4).reduce((a,b)=>a+b,0), color: '#7b2cbf' },
        { label: '4am - 8am', total: hourlyData.slice(4,8).reduce((a,b)=>a+b,0), color: '#4361ee' },
        { label: '8am - 12pm', total: hourlyData.slice(8,12).reduce((a,b)=>a+b,0), color: '#00f5d4' },
        { label: '12pm - 4pm', total: hourlyData.slice(12,16).reduce((a,b)=>a+b,0), color: '#b8f83a' },
        { label: '4pm - 8pm', total: hourlyData.slice(16,20).reduce((a,b)=>a+b,0), color: '#ffd60a' },
        { label: '8pm - 12am', total: hourlyData.slice(20,24).reduce((a,b)=>a+b,0), color: '#f72585' }
      ];
      const maxPeriod = Math.max(...periods.map(p => p.total));
      periods.forEach((period, i) => {
        const row = document.createElement('div');
        row.className = 'bar-row';
        const label = document.createElement('div');
        label.className = 'bar-label';
        label.textContent = period.label;
        const track = document.createElement('div');
        track.className = 'bar-track';
        const fill = document.createElement('div');
        fill.className = 'bar-fill';
        fill.style.width = '0%';
        fill.style.background = period.color;
        const valueSpan = document.createElement('span');
        valueSpan.className = 'bar-value';
        valueSpan.textContent = period.total.toLocaleString();
        fill.appendChild(valueSpan);
        track.appendChild(fill);
        row.appendChild(label);
        row.appendChild(track);
        container.appendChild(row);
        setTimeout(() => {
          fill.style.width = (period.total / maxPeriod * 100) + '%';
        }, 300 + i * 100);
      });
    }

    function renderTopMentions() {
      const container = document.getElementById('topMentions');
      if (!container) return;
      topMentions.forEach((mention, i) => {
        const item = document.createElement('div');
        item.className = 'top-item';
        const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : 'default';
        item.innerHTML = '<div class="top-rank ' + rankClass + '">' + (i + 1) + '</div><div class="top-info"><div class="top-name">' + mention.name + '</div><div class="top-handle">@' + mention.handle + '</div></div><div style="text-align:right"><div class="top-count">' + mention.count + '</div><div class="top-count-label">mentions</div></div>';
        container.appendChild(item);
      });
    }

    function renderWordCloud() {
      const container = document.getElementById('wordCloud');
      if (!container || !topWords.length) return;
      const maxCount = topWords[0][1];
      const colors = ['#00f5d4','#f72585','#b8f83a','#ffd60a','#7b2cbf','#4361ee'];
      topWords.forEach(([word, count], i) => {
        const span = document.createElement('span');
        span.className = 'word';
        span.textContent = word;
        const ratio = count / maxCount;
        const size = 12 + (ratio * 32);
        const weight = ratio > 0.7 ? 800 : ratio > 0.4 ? 600 : 400;
        span.style.fontSize = size + 'px';
        span.style.fontWeight = weight;
        span.style.color = colors[i % colors.length];
        span.style.opacity = 0.6 + (ratio * 0.4);
        container.appendChild(span);
      });
    }

    function renderEmojiGrid() {
      const container = document.getElementById('emojiGrid');
      if (!container) return;
      topEmojis.forEach(([emoji, count]) => {
        const item = document.createElement('div');
        item.className = 'emoji-item';
        item.innerHTML = '<div class="emoji-char">' + emoji + '</div><div class="emoji-count">×' + count + '</div>';
        container.appendChild(item);
      });
    }

    function handleReveal() {
      document.querySelectorAll('.reveal').forEach(reveal => {
        if (reveal.getBoundingClientRect().top < window.innerHeight * 0.85) {
          reveal.classList.add('visible');
          reveal.querySelectorAll('.counter[data-target]').forEach(counter => {
            if (!counter.classList.contains('animated')) {
              counter.classList.add('animated');
              animateCounter(counter);
            }
          });
        }
      });
    }

    function animateCounter(counter) {
      const target = parseInt(counter.getAttribute('data-target'));
      if (isNaN(target)) return;
      const duration = 2000;
      const start = Date.now();
      function update() {
        const progress = Math.min((Date.now() - start) / duration, 1);
        counter.textContent = Math.floor(target * (1 - Math.pow(1 - progress, 4))).toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
        else counter.textContent = target.toLocaleString();
      }
      update();
    }

    window.addEventListener('load', () => {
      createParticles();
      renderMonthChart();
      renderDayChart();
      renderHourChart();
      renderTopMentions();
      renderWordCloud();
      renderEmojiGrid();
      handleReveal();
    });
    window.addEventListener('scroll', handleReveal);
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
