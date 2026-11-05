// Everything the generated SVGs say lives here. Edit, then run `node scripts/build.ts`.

export interface Project {
  name: string;
  url: string;
  language: "C#" | "Rust" | "TypeScript";
  icon: "moon" | "sliders" | "bolt" | "nodes";
  tagline: string;
  status?: string;
}

export const profile = {
  name: "Niklas Petersen",
  handle: "niklasfp",
  terminal: [
    { cmd: "whoami", out: "Niklas Petersen · software engineer · Copenhagen, DK" },
    { cmd: "cat focus.txt", out: ".NET · native AOT · Rust · tools that get out of your way" },
  ],
  stack: [
    "C#", ".NET", "Native AOT", "ASP.NET Core", "Aspire",
    "Rust", "TypeScript", "Node", "Docker", "GitHub Actions",
  ],
  projects: [
    {
      name: "nightowl",
      url: "https://github.com/niklasfp/nightowl",
      language: "C#",
      icon: "moon",
      tagline: "Keep-the-computer-awake CLI with native sleep inhibitors for Windows, macOS and Linux. Native AOT, no daemon.",
    },
    {
      name: "terminal-settings",
      url: "https://github.com/niklasfp/terminal-settings",
      language: "Rust",
      icon: "sliders",
      tagline: "A real settings window for the Rio and Ghostty terminals: native apps plus a browser playground.",
    },
    {
      name: "scourge",
      url: "https://github.com/niklasfp/scourge",
      language: "C#",
      icon: "bolt",
      tagline: "The punisher of your .NET app: allocate memory, peg CPUs and throw the unthrowable, on demand.",
    },
    {
      name: "dotnet-nats-server",
      url: "https://github.com/niklasfp/dotnet-nats-server",
      language: "C#",
      icon: "nodes",
      tagline: "A NATS server running in-process in .NET, via a Go-compiled native library.",
      status: "WIP",
    },
  ] satisfies Project[],
};
