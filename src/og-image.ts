import satori from "@cf-wasm/satori";
import { Resvg } from "@cf-wasm/resvg";

// Fetch font for satori
async function getFont(): Promise<ArrayBuffer> {
  const fontUrl = "https://fonts.gstatic.com/s/outfit/v15/QGYyz_MVcBeNP4NjuGObqx1XmO1I4TC1C4E.ttf";
  const response = await fetch(fontUrl);
  return response.arrayBuffer();
}

// Convert emoji to Twemoji codepoint format
function getEmojiCodepoint(emoji: string): string {
  const codepoints: string[] = [];
  for (const char of emoji) {
    const cp = char.codePointAt(0);
    if (cp) {
      // Skip variation selectors (FE0F, FE0E)
      if (cp !== 0xfe0f && cp !== 0xfe0e) {
        codepoints.push(cp.toString(16));
      }
    }
  }
  return codepoints.join("-");
}

// Load emoji from Twemoji CDN and return as data URI for satori
async function loadEmoji(emoji: string): Promise<string> {
  const codepoint = getEmojiCodepoint(emoji);
  const url = `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoint}.svg`;

  try {
    const response = await fetch(url);
    if (response.ok) {
      let svg = await response.text();
      // Ensure it's actually SVG and not an error page
      if (!svg.includes("<svg")) {
        return "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";
      }
      // Remove XML declaration if present
      svg = svg.replace(/<\?xml[^>]*\?>/g, "").trim();
      // Encode as data URI
      return `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }
  } catch (e) {
    console.error("Failed to load emoji:", emoji, e);
  }

  // Return empty SVG as fallback
  return "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";
}

interface WrappedData {
  account: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  stats: {
    totalTweets: number;
    totalLikes: number;
    totalWords: number;
  };
  allTimeStats?: {
    totalTweets: number;
  };
}

export async function generateOgImage(data: WrappedData): Promise<Uint8Array> {
  const fontData = await getFont();

  const { account, stats } = data;

  // Create the SVG using satori
  const svg = await satori(
    {
      type: "div",
      props: {
        style: {
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #050508 0%, #1a1a2e 50%, #050508 100%)",
          fontFamily: "Outfit",
          position: "relative",
        },
        children: [
          // Background decorations
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                background: "radial-gradient(ellipse 80% 50% at 20% 40%, rgba(123,44,191,0.3) 0%, transparent 50%), radial-gradient(ellipse 60% 40% at 80% 20%, rgba(247,37,133,0.2) 0%, transparent 50%), radial-gradient(ellipse 50% 60% at 50% 80%, rgba(0,245,212,0.15) 0%, transparent 50%)",
              },
            },
          },
          // Year
          {
            type: "div",
            props: {
              style: {
                fontSize: "140px",
                fontWeight: "900",
                background: "linear-gradient(135deg, #00f5d4 0%, #f72585 50%, #ffd60a 100%)",
                backgroundClip: "text",
                color: "transparent",
                lineHeight: "1",
                marginBottom: "10px",
              },
              children: "2025",
            },
          },
          // WRAPPED text
          {
            type: "div",
            props: {
              style: {
                fontSize: "24px",
                letterSpacing: "0.4em",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "40px",
              },
              children: "WRAPPED",
            },
          },
          // Avatar and username row
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "30px",
              },
              children: [
                // Avatar
                account.avatarUrl ? {
                  type: "img",
                  props: {
                    src: account.avatarUrl,
                    width: "80",
                    height: "80",
                    style: {
                      borderRadius: "50%",
                      border: "3px solid #00f5d4",
                    },
                  },
                } : null,
                // Username
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "36px",
                            fontWeight: "600",
                            color: "#fff",
                          },
                          children: account.displayName,
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "24px",
                            color: "#00f5d4",
                          },
                          children: `@${account.username}`,
                        },
                      },
                    ],
                  },
                },
              ].filter(Boolean),
            },
          },
          // Stats row
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                gap: "60px",
              },
              children: [
                // Tweets
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "48px",
                            fontWeight: "800",
                            color: "#00f5d4",
                          },
                          children: (stats.totalTweets || 0).toLocaleString(),
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "16px",
                            color: "rgba(255,255,255,0.5)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          },
                          children: "tweets",
                        },
                      },
                    ],
                  },
                },
                // Likes received
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "48px",
                            fontWeight: "800",
                            color: "#f72585",
                          },
                          children: (stats.totalLikes || 0).toLocaleString(),
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "16px",
                            color: "rgba(255,255,255,0.5)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          },
                          children: "likes received",
                        },
                      },
                    ],
                  },
                },
                // Words written
                {
                  type: "div",
                  props: {
                    style: {
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    },
                    children: [
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "48px",
                            fontWeight: "800",
                            color: "#ffd60a",
                          },
                          children: (stats.totalWords || 0).toLocaleString(),
                        },
                      },
                      {
                        type: "div",
                        props: {
                          style: {
                            fontSize: "16px",
                            color: "rgba(255,255,255,0.5)",
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                          },
                          children: "words written",
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
          // Footer
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                bottom: "30px",
                fontSize: "18px",
                color: "rgba(255,255,255,0.4)",
              },
              children: "wrapped.tweetstack.app",
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Outfit",
          data: fontData,
          weight: 400,
          style: "normal",
        },
        {
          name: "Outfit",
          data: fontData,
          weight: 600,
          style: "normal",
        },
        {
          name: "Outfit",
          data: fontData,
          weight: 800,
          style: "normal",
        },
        {
          name: "Outfit",
          data: fontData,
          weight: 900,
          style: "normal",
        },
      ],
      loadAdditionalAsset: async (code: string, segment: string) => {
        if (code === "emoji") {
          return loadEmoji(segment);
        }
        return "";
      },
    }
  );

  // Convert SVG to PNG
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: "width",
      value: 1200,
    },
  });

  const pngData = resvg.render();
  return pngData.asPng();
}
