import { spawn } from 'child_process';

/**
 * Gọi yt-dlp (qua `python -m yt_dlp`) để lấy duration (ms) của 1 video YouTube.
 * Nếu yt-dlp trả về NA (như đối với file mp4 direct), sẽ dùng ffprobe để dự phòng.
 * Trả về Number (ms) hoặc null nếu thất bại.
 */
export const getDurationMsViaYtdlp = async (
  sourceUrl,
  pythonBin = 'python'
) => {
  const ytDlpDuration = await new Promise((resolve) => {
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
        console.info(
          `[yt-dlp info] ${sourceUrl} -> no duration returned (NA), falling back to ffprobe...`
        );
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
  if (ytDlpDuration !== null) {
    return ytDlpDuration;
  }

  // Fallback sang ffprobe cho các link direct media không từ Youtube
  return await getDurationViaFfprobe(sourceUrl);
};

const getDurationViaFfprobe = (sourceUrl) => {
  return new Promise((resolve) => {
    const child = spawn(
      'ffprobe',
      [
        '-v',
        'error',
        '-show_entries',
        'format=duration',
        '-of',
        'default=noprint_wrappers=1:nokey=1',
        sourceUrl,
      ],
      { timeout: 60_000 }
    );

    let stdoutData = '';
    child.stdout.on('data', (data) => {
      stdoutData += data.toString();
    });
    child.on('close', (code) => {
      if (code !== 0) return resolve(null);
      const raw = stdoutData.trim();
      const seconds = Number(raw);
      if (Number.isNaN(seconds) || seconds <= 0) return resolve(null);
      resolve(Math.round(seconds * 1000));
    });
    child.on('error', (err) => {
      console.error(`[ffprobe error] ${sourceUrl} -> ${err.message}`);
      resolve(null);
    });
  });
};
