import { file } from "bun";
import path from "path";

const dataDir = path.join(import.meta.dir, "data");

// Helper to parse Twitter's JS files
function parseTwitterJS(content: string, varName: string) {
  const match = content.match(new RegExp(`window\\.YTD\\.${varName}\\.part\\d+ = `));
  if (match) {
    const jsonStart = content.indexOf("[", match.index);
    const json = content.slice(jsonStart);
    return JSON.parse(json);
  }
  return [];
}

// Load all tweet files
async function loadAllTweets() {
  const tweetFiles = ["tweets.js", "tweets-part1.js", "tweets-part2.js"];
  let allTweets: any[] = [];

  for (const filename of tweetFiles) {
    const filePath = path.join(dataDir, filename);
    const f = file(filePath);
    if (await f.exists()) {
      console.error(`Loading ${filename}...`);
      const content = await f.text();
      const tweets = parseTwitterJS(content, "tweets");
      allTweets = allTweets.concat(tweets);
      console.error(`  Found ${tweets.length} tweets`);
    }
  }

  return allTweets;
}

// Load likes
async function loadLikes() {
  const content = await file(path.join(dataDir, "like.js")).text();
  return parseTwitterJS(content, "like");
}

// Load followers
async function loadFollowers() {
  const content = await file(path.join(dataDir, "follower.js")).text();
  return parseTwitterJS(content, "follower");
}

// Load following
async function loadFollowing() {
  const content = await file(path.join(dataDir, "following.js")).text();
  return parseTwitterJS(content, "following");
}

// Load account
async function loadAccount() {
  const content = await file(path.join(dataDir, "account.js")).text();
  return parseTwitterJS(content, "account")[0].account;
}

// Load profile
async function loadProfile() {
  const content = await file(path.join(dataDir, "profile.js")).text();
  return parseTwitterJS(content, "profile")[0].profile;
}

// Parse tweet date
function parseTweetDate(dateStr: string) {
  return new Date(dateStr);
}

// Get hour from date
function getHour(date: Date) {
  return date.getUTCHours();
}

// Get day of week
function getDayOfWeek(date: Date) {
  return date.getUTCDay();
}

// Get month
function getMonth(date: Date) {
  return date.getUTCMonth();
}

// Check if date is in 2025
function isIn2025(date: Date) {
  return date.getUTCFullYear() === 2025;
}

// Extract hashtags from tweet
function extractHashtags(tweet: any) {
  return (tweet.entities?.hashtags || []).map((h: any) => h.text.toLowerCase());
}

// Extract mentions from tweet
function extractMentions(tweet: any) {
  return (tweet.entities?.user_mentions || []).map((m: any) => ({
    screenName: m.screen_name,
    name: m.name,
  }));
}

// Check if tweet is a retweet
function isRetweet(tweet: any) {
  return tweet.full_text.startsWith("RT @");
}

// Check if tweet is a reply
function isReply(tweet: any) {
  return tweet.in_reply_to_status_id_str != null;
}

// Check if tweet has media
function hasMedia(tweet: any) {
  return (tweet.entities?.media || []).length > 0;
}

// Get media types
function getMediaTypes(tweet: any) {
  const media = tweet.extended_entities?.media || tweet.entities?.media || [];
  return media.map((m: any) => m.type);
}

// Count words in text
function countWords(text: string) {
  // Remove URLs
  text = text.replace(/https?:\/\/\S+/g, "");
  // Remove mentions
  text = text.replace(/@\w+/g, "");
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

// Analyze tweets
function analyzeTweets(allTweets: any[]) {
  console.error("\nAnalyzing tweets...");

  const stats: any = {
    totalTweets: 0,
    totalRetweets: 0,
    totalReplies: 0,
    totalOriginal: 0,
    totalLikes: 0,
    totalRetwCounts: 0,
    tweetsWithMedia: 0,
    totalWords: 0,
    hourlyDistribution: new Array(24).fill(0),
    dailyDistribution: new Array(7).fill(0),
    monthlyDistribution: new Array(12).fill(0),
    hashtags: {} as Record<string, number>,
    mentions: {} as Record<string, { count: number; name: string }>,
    sources: {} as Record<string, number>,
    languages: {} as Record<string, number>,
    topTweets: [],
    longestTweet: null as any,
    mostLikedTweet: null as any,
    mostRetweetedTweet: null as any,
    mediaTypes: {} as Record<string, number>,
    emojiCount: {} as Record<string, number>,
    tweetLengths: [] as number[],
    dailyTweetCounts: {} as Record<string, number>,
    weeklyStats: {},
    firstTweet: null as any,
    lastTweet: null as any,
    avgLikesPerTweet: 0,
    avgRetweetsPerTweet: 0,
    tweetsPerDay: 0,
    uniqueHashtags: new Set<string>(),
    uniqueMentions: new Set<string>(),
    threadCount: 0,
    longestStreak: 0,
    currentStreak: 0,
    mostActiveDay: null as any,
    leastActiveDay: null as any,
    topWords: {} as Record<string, number>,
  };

  const tweets2025: any[] = [];

  for (const item of allTweets) {
    const tweet = item.tweet;
    const date = parseTweetDate(tweet.created_at);

    if (!isIn2025(date)) continue;

    tweets2025.push({ tweet, date });
    stats.totalTweets++;

    // Track first and last tweet
    if (!stats.firstTweet || date < stats.firstTweet.date) {
      stats.firstTweet = { tweet, date };
    }
    if (!stats.lastTweet || date > stats.lastTweet.date) {
      stats.lastTweet = { tweet, date };
    }

    // Type classification
    if (isRetweet(tweet)) {
      stats.totalRetweets++;
    } else if (isReply(tweet)) {
      stats.totalReplies++;
    } else {
      stats.totalOriginal++;
    }

    // Engagement
    const likes = parseInt(tweet.favorite_count) || 0;
    const retweets = parseInt(tweet.retweet_count) || 0;
    stats.totalLikes += likes;
    stats.totalRetwCounts += retweets;

    // Top tweets
    if (!stats.mostLikedTweet || likes > parseInt(stats.mostLikedTweet.favorite_count)) {
      stats.mostLikedTweet = tweet;
    }
    if (!stats.mostRetweetedTweet || retweets > parseInt(stats.mostRetweetedTweet.retweet_count)) {
      stats.mostRetweetedTweet = tweet;
    }

    // Time distributions
    stats.hourlyDistribution[getHour(date)]++;
    stats.dailyDistribution[getDayOfWeek(date)]++;
    stats.monthlyDistribution[getMonth(date)]++;

    // Daily counts
    const dayKey = date.toISOString().split("T")[0];
    stats.dailyTweetCounts[dayKey] = (stats.dailyTweetCounts[dayKey] || 0) + 1;

    // Hashtags
    for (const tag of extractHashtags(tweet)) {
      stats.hashtags[tag] = (stats.hashtags[tag] || 0) + 1;
      stats.uniqueHashtags.add(tag);
    }

    // Mentions
    for (const mention of extractMentions(tweet)) {
      stats.mentions[mention.screenName] = stats.mentions[mention.screenName] || {
        count: 0,
        name: mention.name,
      };
      stats.mentions[mention.screenName].count++;
      stats.uniqueMentions.add(mention.screenName);
    }

    // Sources
    const sourceMatch = tweet.source.match(/>([^<]+)</);
    const source = sourceMatch ? sourceMatch[1] : tweet.source;
    stats.sources[source] = (stats.sources[source] || 0) + 1;

    // Languages
    stats.languages[tweet.lang] = (stats.languages[tweet.lang] || 0) + 1;

    // Media
    if (hasMedia(tweet)) {
      stats.tweetsWithMedia++;
      for (const type of getMediaTypes(tweet)) {
        stats.mediaTypes[type] = (stats.mediaTypes[type] || 0) + 1;
      }
    }

    // Word count (only for original tweets)
    if (!isRetweet(tweet)) {
      const words = countWords(tweet.full_text);
      stats.totalWords += words;
      stats.tweetLengths.push(tweet.full_text.length);

      // Track longest tweet
      if (!stats.longestTweet || tweet.full_text.length > stats.longestTweet.full_text.length) {
        stats.longestTweet = tweet;
      }

      // Word frequency (excluding common words)
      const stopWords = new Set([
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of", "is", "it",
        "this", "that", "with", "as", "be", "was", "are", "been", "being", "have", "has", "had",
        "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "shall",
        "can", "need", "dare", "ought", "used", "i", "me", "my", "you", "your", "we", "our",
        "they", "them", "their", "he", "she", "him", "her", "his", "its", "if", "so", "just",
        "not", "no", "yes", "all", "any", "more", "some", "such", "only", "very", "too", "also",
        "now", "then", "here", "there", "when", "where", "why", "how", "what", "which", "who",
        "whom", "whose", "than", "from", "into", "over", "under", "again", "further", "once",
        "about", "out", "up", "down", "off", "rt", "amp", "im", "ive", "dont", "cant", "wont",
        "didnt", "like", "get", "got", "gonna", "really", "think", "know", "lol", "u", "ur",
        "bc", "tho", "rn", "thats", "lmao", "omg", "don",
      ]);
      const tweetWords = tweet.full_text
        .toLowerCase()
        .replace(/https?:\/\/\S+/g, "")
        .replace(/@\w+/g, "")
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((w: string) => w.length > 2 && !stopWords.has(w));

      for (const word of tweetWords) {
        stats.topWords[word] = (stats.topWords[word] || 0) + 1;
      }
    }

    // Emoji extraction
    const emojiRegex =
      /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/gu;
    const emojis = tweet.full_text.match(emojiRegex) || [];
    for (const emoji of emojis) {
      stats.emojiCount[emoji] = (stats.emojiCount[emoji] || 0) + 1;
    }
  }

  // Calculate derived stats
  const days = Object.keys(stats.dailyTweetCounts).length;
  stats.tweetsPerDay = days > 0 ? (stats.totalTweets / days).toFixed(1) : 0;
  stats.avgLikesPerTweet =
    stats.totalTweets > 0 ? (stats.totalLikes / stats.totalTweets).toFixed(1) : 0;
  stats.avgRetweetsPerTweet =
    stats.totalTweets > 0 ? (stats.totalRetwCounts / stats.totalTweets).toFixed(1) : 0;

  // Find most and least active days
  const dayCounts = Object.entries(stats.dailyTweetCounts) as [string, number][];
  if (dayCounts.length > 0) {
    dayCounts.sort((a, b) => b[1] - a[1]);
    stats.mostActiveDay = { date: dayCounts[0][0], count: dayCounts[0][1] };
    stats.leastActiveDay = {
      date: dayCounts[dayCounts.length - 1][0],
      count: dayCounts[dayCounts.length - 1][1],
    };
  }

  // Calculate streaks
  const sortedDays = Object.keys(stats.dailyTweetCounts).sort();
  let currentStreak = 1;
  let longestStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = new Date(sortedDays[i - 1]);
    const currDate = new Date(sortedDays[i]);
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }
  stats.longestStreak = longestStreak;

  // Sort and limit top items
  stats.topHashtags = Object.entries(stats.hashtags)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 15);

  stats.topMentions = Object.entries(stats.mentions)
    .map(([k, v]: [string, any]) => [k, v.count, v.name])
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 15);

  stats.topEmojis = Object.entries(stats.emojiCount)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 50);

  stats.topSources = Object.entries(stats.sources)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  stats.topLanguages = Object.entries(stats.languages)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);

  stats.topWordsList = Object.entries(stats.topWords)
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 40);

  // Average tweet length
  if (stats.tweetLengths.length > 0) {
    stats.avgTweetLength = Math.round(
      stats.tweetLengths.reduce((a: number, b: number) => a + b, 0) / stats.tweetLengths.length
    );
  }

  // Convert sets to counts
  stats.uniqueHashtagsCount = stats.uniqueHashtags.size;
  stats.uniqueMentionsCount = stats.uniqueMentions.size;

  // Clean up large objects
  delete stats.hashtags;
  delete stats.mentions;
  delete stats.sources;
  delete stats.languages;
  delete stats.emojiCount;
  delete stats.tweetLengths;
  delete stats.uniqueHashtags;
  delete stats.uniqueMentions;
  delete stats.topWords;

  return { stats, tweets2025 };
}

export interface AnalysisResult {
  account: {
    username: string;
    displayName: string;
    createdAt: string;
    bio: string;
    location: string;
    avatarUrl: string;
    headerUrl: string;
  };
  followers: number;
  following: number;
  totalLikes: number;
  stats: any;
}

export async function analyze(): Promise<AnalysisResult> {
  console.error("Twitter 2025 Wrapped Analyzer");
  console.error("============================\n");

  const account = await loadAccount();
  const profile = await loadProfile();
  const allTweets = await loadAllTweets();
  const likes = await loadLikes();
  const followers = await loadFollowers();
  const following = await loadFollowing();

  console.error(`\nTotal tweets loaded: ${allTweets.length}`);
  console.error(`Total likes loaded: ${likes.length}`);
  console.error(`Followers: ${followers.length}`);
  console.error(`Following: ${following.length}`);

  const { stats } = analyzeTweets(allTweets);

  console.error(`\n2025 tweets: ${stats.totalTweets}`);

  // Compile final output
  const output: AnalysisResult = {
    account: {
      username: account.username,
      displayName: account.accountDisplayName,
      createdAt: account.createdAt,
      bio: profile.description.bio,
      location: profile.description.location,
      avatarUrl: profile.avatarMediaUrl,
      headerUrl: profile.headerMediaUrl,
    },
    followers: followers.length,
    following: following.length,
    totalLikes: likes.length,
    stats,
  };

  return output;
}

// Run if called directly
if (import.meta.main) {
  const result = await analyze();
  console.log(JSON.stringify(result, null, 2));
}
