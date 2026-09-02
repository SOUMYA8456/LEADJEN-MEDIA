const crypto = require('crypto');

const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/jpg",
];

const ALLOWED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: "No file provided" };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: "Image is too large. Maximum allowed size is 10MB." };
  }

  const mimeType = file.type?.toLowerCase();
  const fileName = file.name?.toLowerCase() || "";
  const hasValidExtension = ALLOWED_IMAGE_EXTENSIONS.some((ext) => fileName.endsWith(ext));

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(mimeType) && !hasValidExtension) {
    return { valid: false, error: "Unsupported image format. Please upload JPG, PNG, WEBP, or GIF." };
  }

  return { valid: true };
}

function sanitizeVideoUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { valid: false, error: "Video URL is required" };
  }

  const trimmed = rawUrl.trim();
  const lower = trimmed.toLowerCase();

  if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.startsWith("vbscript:")) {
    return { valid: false, error: "Unsafe video URL protocol detected" };
  }

  if (!lower.startsWith("http://") && !lower.startsWith("https://")) {
    return { valid: false, error: "Video URL must start with http:// or https://" };
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("youtube.com") || host.includes("youtu.be")) {
      let videoId = "";
      if (host.includes("youtu.be")) {
        videoId = parsed.pathname.slice(1);
      } else if (parsed.searchParams.has("v")) {
        videoId = parsed.searchParams.get("v") || "";
      } else if (parsed.pathname.includes("/embed/")) {
        videoId = parsed.pathname.split("/embed/")[1] || "";
      }

      if (videoId) {
        return {
          valid: true,
          embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&controls=1&rel=0`,
        };
      }
    }

    if (host.includes("vimeo.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const vimeoId = parts[parts.length - 1];
      if (vimeoId && /^\d+$/.test(vimeoId)) {
        return {
          valid: true,
          embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
        };
      }
    }

    if (lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.includes("cloudinary.com") || lower.includes("video")) {
      return {
        valid: true,
        embedUrl: trimmed,
      };
    }

    return { valid: true, embedUrl: trimmed };
  } catch {
    return { valid: false, error: "Invalid video URL format" };
  }
}

async function uploadMedia(buffer, filename, mimeType) {
  const base64Data = buffer.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64Data}`;
  const publicId = `media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    url: dataUrl,
    publicId,
  };
}

async function runTests() {
  console.log('========================================');
  console.log('STARTING PHASE 4A VERIFICATION TESTS');
  console.log('========================================\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Image Validation
  console.log('1. Testing Image Validation:');
  const validFile = { name: 'leadjen_hero.webp', type: 'image/webp', size: 1024 * 500 };
  const res1 = validateImageFile(validFile);
  if (res1.valid) {
    console.log('  ✓ Valid WEBP accepted');
    passed++;
  } else {
    console.error('  ✗ Valid WEBP rejected:', res1.error);
    failed++;
  }

  const largeFile = { name: 'huge_image.png', type: 'image/png', size: 15 * 1024 * 1024 };
  const res2 = validateImageFile(largeFile);
  if (!res2.valid && res2.error.includes('large')) {
    console.log('  ✓ 15MB file correctly rejected with friendly message:', res2.error);
    passed++;
  } else {
    console.error('  ✗ Large file not rejected properly');
    failed++;
  }

  const badType = { name: 'script.exe', type: 'application/octet-stream', size: 500 };
  const res3 = validateImageFile(badType);
  if (!res3.valid && res3.error.includes('Unsupported')) {
    console.log('  ✓ Unsupported format correctly rejected:', res3.error);
    passed++;
  } else {
    console.error('  ✗ Bad format not rejected properly');
    failed++;
  }

  // Test 2: Video URL Sanitization
  console.log('\n2. Testing Video URL Sanitization & Security:');
  const ytUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const ytRes = sanitizeVideoUrl(ytUrl);
  if (ytRes.valid && ytRes.embedUrl.includes('youtube-nocookie.com/embed/dQw4w9WgXcQ')) {
    console.log('  ✓ YouTube URL converted to secure embed URL:', ytRes.embedUrl);
    passed++;
  } else {
    console.error('  ✗ YouTube conversion failed');
    failed++;
  }

  const evilUrl = 'javascript:alert(1)';
  const evilRes = sanitizeVideoUrl(evilUrl);
  if (!evilRes.valid) {
    console.log('  ✓ Dangerous javascript: scheme blocked safely');
    passed++;
  } else {
    console.error('  ✗ Dangerous scheme was not blocked!');
    failed++;
  }

  // Test 3: Centralized Permanent Media Upload
  console.log('\n3. Testing Media Storage & Permanent Data URI Generation:');
  const sampleBuffer = Buffer.from('FAKE_IMAGE_DATA_LEADJEN_MEDIA_2026');
  const uploadRes = await uploadMedia(sampleBuffer, 'test_story.jpg', 'image/jpeg');
  if (uploadRes.url && uploadRes.url.startsWith('data:image/jpeg;base64,')) {
    console.log('  ✓ Permanent Data URI successfully generated for serverless execution');
    console.log('  ✓ Public ID generated:', uploadRes.publicId);
    passed++;
  } else {
    console.error('  ✗ Upload failed to generate valid permanent URL');
    failed++;
  }

  console.log('\n========================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================');
}

runTests().catch(console.error);
