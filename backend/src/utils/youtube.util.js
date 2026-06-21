import { spawn } from 'child_process';

/**
 * Gọi yt-dlp (qua `python -m yt_dlp`) để lấy duration (ms) của 1 video YouTube.
 * Trả về Number (ms) hoặc null nếu thất bại.
 */
export const getDurationMsViaYtdlp = (sourceUrl, pythonBin = 'python') => {
  return new Promise((resolve) => {
    const child = spawn(
      pythonBin,
      [
        '-m',
        'yt_dlp',
        '--skip-download',
        '--no-warnings',
        '--remote-components',
        'ejs:github',
        '--print',
        '%(duration)s',
        sourceUrl,
      ],
      { timeout: 60_000 }
    );

    let stdoutData = '';
    let stderrData = '';

    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderrData += data.toString();
    });

    child.on('close', (code) => {
      if (code !== 0) {
        console.error(
          `[yt-dlp error] ${sourceUrl} -> code ${code}: ${stderrData.trim()}`
        );
        return resolve(null);
      }
      const raw = stdoutData.trim();
      if (!raw || raw === 'NA') {
        console.error(`[yt-dlp error] ${sourceUrl} -> no duration returned`);
        return resolve(null);
      }
      const seconds = Number(raw);
      if (Number.isNaN(seconds)) {
        console.error(
          `[yt-dlp error] ${sourceUrl} -> invalid duration: ${raw}`
        );
        return resolve(null);
      }
      resolve(Math.round(seconds * 1000));
    });

    child.on('error', (err) => {
      console.error(`[yt-dlp spawn error] ${sourceUrl} -> ${err.message}`);
      resolve(null);
    });
  });
};
