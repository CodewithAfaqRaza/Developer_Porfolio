import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const encoder = process.env.FFMPEG_PATH;
if (!encoder)
  throw new Error(
    "Set FFMPEG_PATH to a working FFmpeg executable before running this optional media-build script.",
  );
const temporary = "/tmp/danyal-hero-video";
mkdirSync(temporary, { recursive: true });
const fps = 24;
const width = 1280;
const height = 720;

async function encode(args) {
  const process = spawn(
    encoder,
    ["-hide_banner", "-loglevel", "error", "-y", ...args],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
  let errors = "";
  process.stderr.on("data", (chunk) => {
    errors += chunk;
  });
  const [code] = await once(process, "close");
  if (code !== 0) throw new Error(errors || `Encoder failed: ${code}`);
}

if (!process.argv.includes("--assemble-only")) {
  // Keep the approved opening at its original playback speed.
  await encode([
    "-i",
    "assets/video-source/abstract-technology.mp4",
    "-vf",
    "setpts=PTS-STARTPTS,fps=24,scale=1280:720,setsar=1,format=yuv420p",
    "-t",
    "5",
    "-an",
    "-c:v",
    "libx264",
    "-crf",
    "24",
    "-preset",
    "fast",
    join(temporary, "devices.mp4"),
  ]);
  console.log("Opening device scene ready (5 seconds, original speed).");

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width, height } });
    await page.setContent('<canvas width="1280" height="720"></canvas>');
    await page.evaluate(() => {
      const canvas = document.querySelector("canvas");
      const ctx = canvas.getContext("2d");
      const line = (points, color = "#465268", weight = 1) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = weight;
        ctx.beginPath();
        points.forEach(([x, y], i) =>
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
        );
        ctx.stroke();
      };
      const polygon = (points, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        points.forEach(([x, y], i) =>
          i ? ctx.lineTo(x, y) : ctx.moveTo(x, y),
        );
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "#627187";
        ctx.lineWidth = 1;
        ctx.stroke();
      };
      const circle = (x, y, r, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };
      const iso = (x, y, z, time) => [
        825 + x * 0.85 - z * 0.65 + Math.sin(time * 0.19) * 12,
        425 + x * 0.24 + z * 0.3 - y,
      ];
      function circuit(time) {
        ctx.fillStyle = "#171e2b";
        ctx.fillRect(0, 0, 1280, 720);
        const glow = ctx.createRadialGradient(850, 320, 0, 850, 320, 650);
        glow.addColorStop(0, "#293243");
        glow.addColorStop(1, "#151c29");
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, 1280, 720);
        for (let i = -7; i < 12; i++) {
          const x = i * 150 + Math.sin(time * 0.1) * 15;
          line(
            [
              [x, -20],
              [x + 100, 75],
              [x + 30, 145],
              [x + 115, 230],
              [x + 45, 300],
              [x + 130, 385],
              [x + 60, 460],
              [x + 145, 545],
              [x + 75, 620],
              [x + 175, 740],
            ],
            "#2c374a",
            1.5,
          );
          circle(x + 30, 145, 3, "#38445a");
          circle(x + 60, 460, 3, "#38445a");
        }
      }
      function network(time) {
        const nodes = Array.from({ length: 20 }, (_, i) => {
          const angle = i * 2.39996 + time * 0.025;
          const radius = 70 + Math.sqrt(i) * 48;
          return [
            855 + Math.cos(angle) * radius,
            360 + Math.sin(angle) * radius * 0.8 + Math.sin(time * 0.3 + i) * 6,
          ];
        });
        for (let i = 0; i < nodes.length; i++)
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i],
              b = nodes[j];
            if (Math.hypot(a[0] - b[0], a[1] - b[1]) > 165) continue;
            line([a, b], "#4c5a70", 1.4);
            const p = (time * 0.12 + i * 0.11 + j * 0.04) % 1;
            circle(
              a[0] + (b[0] - a[0]) * p,
              a[1] + (b[1] - a[1]) * p,
              2.5,
              "#9cabc0",
            );
          }
        nodes.forEach(([x, y], i) => {
          circle(x, y, 8 + Math.sin(time * 0.4 + i), "#293548");
          circle(x, y, 4, "#a6b4c7");
        });
      }
      function architecture(time) {
        for (let z = 2; z >= 0; z--)
          for (let x = 0; x < 3; x++) {
            const bx = (x - 1) * 115,
              bz = (z - 1) * 115;
            const elevation =
              60 + 30 * (0.5 + 0.5 * Math.sin(time * 0.35 + x + z));
            const size = 90;
            const top = [
              [bx, elevation, bz],
              [bx + size, elevation, bz],
              [bx + size, elevation, bz + size],
              [bx, elevation, bz + size],
            ].map((p) => iso(...p, time));
            polygon(
              [
                top[3],
                top[2],
                iso(bx + size, 0, bz + size, time),
                iso(bx, 0, bz + size, time),
              ],
              "#303b4d",
            );
            polygon(
              [
                top[1],
                top[2],
                iso(bx + size, 0, bz + size, time),
                iso(bx + size, 0, bz, time),
              ],
              "#465469",
            );
            polygon(top, "#69788c");
            line(
              [
                iso(bx + 10, elevation + 0.5, bz + 12, time),
                iso(bx + size - 10, elevation + 0.5, bz + 12, time),
              ],
              "#a5b0c0",
              1.8,
            );
            circle(...iso(bx + 20, elevation + 1, bz + 50, time), 3, "#c5cbd4");
          }
      }
      function interfaces(time) {
        for (let i = 0; i < 3; i++) {
          ctx.save();
          ctx.translate(
            655 + i * 90,
            215 + i * 54 + Math.sin(time * 0.25 + i) * 8,
          );
          ctx.transform(1, -0.16, 0.28, 0.9, 0, 0);
          const gradient = ctx.createLinearGradient(0, 0, 285, 190);
          gradient.addColorStop(0, "#48566b");
          gradient.addColorStop(1, "#273244");
          ctx.fillStyle = gradient;
          ctx.strokeStyle = "#8896aa";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.roundRect(0, 0, 285, 190, 9);
          ctx.fill();
          ctx.stroke();
          line(
            [
              [15, 31],
              [270, 31],
            ],
            "#748299",
            1,
          );
          for (let j = 0; j < 3; j++) circle(15 + j * 11, 16, 3, "#a2aec0");
          for (let j = 0; j < 5; j++) {
            ctx.fillStyle = j === i ? "#8292aa" : "#596980";
            ctx.fillRect(16, 49 + j * 25, 37, 5);
          }
          for (let j = 0; j < 8; j++) {
            ctx.fillStyle = "#7688a1";
            const size = 22 + Math.sin(time * 0.35 + j * 0.6 + i) * 13;
            ctx.fillRect(76 + j * 23, 151 - size, 12, size);
          }
          const wave = Array.from({ length: 60 }, (_, j) => [
            72 + j * 3.1,
            83 + Math.sin(j * 0.12 + time * 0.3 + i) * 17,
          ]);
          line(wave, "#b4bdcd", 2);
          line(
            [
              [72, 155],
              [263, 155],
            ],
            "#66768f",
            1,
          );
          ctx.restore();
        }
      }
      function globe(time) {
        const r = 185;
        const project = (lat, lon) => {
          const x = Math.cos(lat) * Math.sin(lon + time * 0.11) * r;
          const y = Math.sin(lat) * r;
          const z = Math.cos(lat) * Math.cos(lon + time * 0.11) * r;
          return [850 + x * (1 + z / 950), 355 + y * (1 + z / 950), z];
        };
        for (let i = 0; i < 12; i++) {
          const points = Array.from({ length: 65 }, (_, j) =>
            project(-Math.PI / 2 + (j / 64) * Math.PI, (i / 12) * Math.PI * 2),
          );
          line(
            points.map((p) => p.slice(0, 2)),
            "#53617a",
            1,
          );
        }
        for (let i = 1; i < 6; i++) {
          const lat = -Math.PI / 2 + (i / 6) * Math.PI;
          const points = Array.from({ length: 97 }, (_, j) =>
            project(lat, (j / 96) * Math.PI * 2),
          );
          line(
            points.map((p) => p.slice(0, 2)),
            "#75859e",
            1.3,
          );
          for (let j = 0; j < 12; j++) {
            const p = project(lat, (j / 12) * Math.PI * 2);
            circle(
              p[0],
              p[1],
              p[2] > 0 ? 3.8 : 2,
              p[2] > 0 ? "#b6c3d5" : "#4f5a6e",
            );
          }
        }
        ctx.strokeStyle = "#8290a4";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.ellipse(850, 355, 247, 81, -0.26, 0, Math.PI * 2);
        ctx.stroke();
        for (let i = 0; i < 3; i++) {
          const a = time * 0.2 + (i * Math.PI * 2) / 3;
          circle(
            850 + Math.cos(a) * 247,
            355 + Math.sin(a) * 81 - Math.cos(a) * 35,
            4,
            "#d0d5df",
          );
        }
      }
      window.drawHeroFrame = (scene, time) => {
        circuit(time);
        ({ network, architecture, interfaces, globe })[scene](time);
        return canvas.toDataURL("image/jpeg", 0.9).split(",")[1];
      };
    });
    for (const [scene, duration] of [
      ["network", 7],
      ["architecture", 7],
      ["interfaces", 7],
      ["globe", 6],
    ]) {
      const process = spawn(
        encoder,
        [
          "-hide_banner",
          "-loglevel",
          "error",
          "-y",
          "-f",
          "image2pipe",
          "-vcodec",
          "mjpeg",
          "-r",
          String(fps),
          "-i",
          "-",
          "-an",
          "-c:v",
          "libx264",
          "-pix_fmt",
          "yuv420p",
          "-crf",
          "24",
          "-preset",
          "fast",
          join(temporary, `${scene}.mp4`),
        ],
        { stdio: ["pipe", "ignore", "pipe"] },
      );
      let errors = "";
      process.stderr.on("data", (chunk) => {
        errors += chunk;
      });
      const completion = once(process, "close");
      for (let frame = 0; frame < duration * fps; frame++) {
        const jpeg = await page.evaluate(
          ([scene, time]) => window.drawHeroFrame(scene, time),
          [scene, (frame / fps) * 2.5],
        );
        if (!process.stdin.write(Buffer.from(jpeg, "base64")))
          await once(process.stdin, "drain");
      }
      process.stdin.end();
      const [code] = await completion;
      if (code !== 0) throw new Error(errors);
      console.log(`${scene} scene ready (${duration} seconds).`);
    }
  } finally {
    await browser.close();
  }
}

// 32 seconds of scene material, with four half-second crossfades = 30 seconds.
const scenes = ["devices", "network", "architecture", "interfaces", "globe"];
const input = scenes.flatMap((scene) => [
  "-i",
  join(temporary, `${scene}.mp4`),
]);
const filter =
  "[0:v]settb=AVTB,setpts=PTS-STARTPTS,fps=24[v0];[1:v]settb=AVTB,setpts=PTS-STARTPTS,fps=24[v1];[2:v]settb=AVTB,setpts=PTS-STARTPTS,fps=24[v2];[3:v]settb=AVTB,setpts=PTS-STARTPTS,fps=24[v3];[4:v]settb=AVTB,setpts=PTS-STARTPTS,fps=24[v4];[v0][v1]xfade=transition=fade:duration=0.5:offset=4.5,fps=24[x1];[x1][v2]xfade=transition=fade:duration=0.5:offset=11,fps=24[x2];[x2][v3]xfade=transition=fade:duration=0.5:offset=17.5,fps=24[x3];[x3][v4]xfade=transition=fade:duration=0.5:offset=24,fps=24[x4];[5:v]scale=1280:720,setsar=1,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS,fps=24[p];[x4][p]xfade=transition=fade:duration=0.5:offset=29.5,fps=24[out]";
await encode([
  ...input,
  "-loop",
  "1",
  "-framerate",
  "24",
  "-i",
  "public/images/abstract-tech-poster.jpg",
  "-filter_complex",
  filter,
  "-map",
  "[out]",
  "-an",
  "-t",
  "30",
  "-r",
  "24",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-crf",
  "24",
  "-preset",
  "slow",
  "-movflags",
  "+faststart",
  "public/videos/abstract-technology-30s.mp4",
]);
console.log(
  "Finished public/videos/abstract-technology-30s.mp4 (30-second loop, silent H.264, fast-start MP4).",
);
