# Twitter Wrapped 2025

A Spotify Wrapped-style visualization of your Twitter/X archive data. Analyze your tweets entirely client-side - your data never leaves your browser.

**Live demo:** [wrapped.tweetstack.app](https://wrapped.tweetstack.app)

## Features

- **Privacy-first**: All analysis happens in your browser - no data uploaded to servers
- **ZIP support**: Drop your entire Twitter archive ZIP file directly
- **2025 stats**: Tweets, likes received, words written, engagement metrics
- **All-time stats**: Total tweets, first tweet ever, lifetime word count
- **Activity charts**: Monthly, weekly, and hourly posting patterns
- **Top mentions**: Your "ride-or-dies" - people you interact with most
- **Word cloud**: Most used words in your tweets
- **Emoji usage**: Your favorite emojis ranked
- **Viral tweet**: Highlight your most liked tweet of the year
- **Posting streaks**: Track your longest consecutive posting streak
- **Shareable links**: Generate a unique URL to share your wrapped
- **Dynamic OG images**: Beautiful Twitter cards when sharing links
- **Mobile-optimized**: Swipeable slide layout on mobile

## Usage

### Option 1: Use the hosted version

1. Go to [wrapped.tweetstack.app](https://wrapped.tweetstack.app)
2. [Download your Twitter archive](https://twitter.com/settings/download_your_data) (Settings > Your Account > Download an archive)
3. Drop the ZIP file (or extracted `tweets.js` files) onto the page
4. View your wrapped and optionally share it!

### Option 2: Run locally

```bash
# Clone the repo
git clone https://github.com/user/twitter-wrapped.git
cd twitter-wrapped

# Install dependencies
bun install

# Run the dev server
bun run dev
```

Open http://localhost:3000

## Self-hosting on Cloudflare Workers

1. Copy the example config:
   ```bash
   cp wrangler.example.toml wrangler.toml
   ```

2. Login to Cloudflare:
   ```bash
   wrangler login
   ```

3. Create KV namespaces for storing shared wrappeds:
   ```bash
   wrangler kv:namespace create WRAPPED_DATA
   wrangler kv:namespace create WRAPPED_DATA --preview
   ```

4. Update `wrangler.toml` with the KV namespace IDs from the output

5. (Optional) Update the custom domain in `wrangler.toml` or remove the `routes` section to use workers.dev

6. Deploy:
   ```bash
   bun run deploy
   ```

## Project Structure

```
src/
├── worker.ts        # Cloudflare Worker entry point
├── analyzer.ts      # Client-side tweet analysis & wrapped generation
├── og-image.ts      # Dynamic OG image generation (satori + resvg)
└── pages/
    ├── landing.ts   # Landing page with drag-drop upload
    └── wrapped.ts   # Shared wrapped view page
```

## Tech Stack

- **Runtime**: Cloudflare Workers
- **Storage**: Cloudflare KV (for shared wrappeds)
- **Analytics**: Cloudflare Analytics Engine
- **OG Images**: [@cf-wasm/satori](https://github.com/aspect-dev/cf-wasm) + [@cf-wasm/resvg](https://github.com/aspect-dev/cf-wasm)
- **ZIP parsing**: [fflate](https://github.com/101arrowz/fflate) (streaming decompression)
- **Package manager**: [Bun](https://bun.sh)

## Privacy

Your Twitter archive data is processed entirely in your browser. The only data sent to the server is:
- When you click "Share": A JSON blob containing your stats (no raw tweets) is stored with a unique ID
- Basic analytics: Page views and share counts (no personal data)

You can delete your shared wrapped by... well, you can't yet. But the data expires after 1 year.

## License

MIT
