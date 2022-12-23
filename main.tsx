import blog from "https://deno.land/x/blog/blog.tsx";

blog({
  author: "SiriusZHT",
  title: "玉玉的 Blog",
  description: "欢迎来到玉玉的网站！",
  avatar: "https://deno-avatar.deno.dev/avatar/83a531.svg",
  avatarClass: "rounded-full",
  links: [
    { title: "Email", url: "mailto:bot@deno.com" },
    { title: "GitHub", url: "https://github.com/siriuszht" },
    { title: "Twitter", url: "https://twitter.com/denobot" },
  ],
  lang: "zh",
});
