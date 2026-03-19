const nodemailer = require('nodemailer');
require('dotenv').config();

// ── Transporter ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,   // Gmail App Password (not your login password)
  },
});

const FROM = `"${process.env.GMAIL_FROM_NAME || 'EduSpace'}" <${process.env.GMAIL_USER}>`;
const APP_URL = process.env.APP_URL || 'http://localhost:4000';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// ── Base HTML template ─────────────────────────────────────────
const htmlWrap = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 0; }
    .wrap { max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #0049a7, #005dce); padding: 32px 40px; text-align: center; }
    .header h1 { color: #fff; font-size: 24px; margin: 0 0 4px; font-weight: 800; }
    .header p  { color: rgba(255,255,255,0.8); font-size: 13px; margin: 0; }
    .body  { padding: 36px 40px; color: #1e293b; }
    .body p  { font-size: 14px; line-height: 1.7; color: #475569; margin: 0 0 16px; }
    .body h2 { font-size: 18px; color: #0f172a; margin: 0 0 12px; }
    .btn   { display: inline-block; background: #005dce; color: #fff !important; text-decoration: none;
             padding: 14px 32px; border-radius: 10px; font-size: 14px; font-weight: 700; margin: 16px 0; }
    .code  { font-family: monospace; background: #f0f7ff; color: #005dce; padding: 16px 24px;
             border-radius: 10px; font-size: 24px; font-weight: 800; text-align: center; letter-spacing: 6px; margin: 16px 0; }
    .footer { background: #f8fafc; padding: 20px 40px; text-align: center; font-size: 11px; color: #94a3b8; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <h1>🎓 EduSpace</h1>
      <p>Smart Learning Platform</p>
    </div>
    <div class="body">${content}</div>
    <div class="footer">
      © ${new Date().getFullYear()} EduSpace. Бүх эрх хуулиар хамгаалагдсан.<br>
      <a href="${FRONTEND_URL}" style="color:#005dce">eduspace.mn</a>
    </div>
  </div>
</body>
</html>`;

// ── Email functions ────────────────────────────────────────────

/**
 * Verify email on registration
 */
const sendVerificationEmail = async (user, token) => {
  const url = `${FRONTEND_URL}/verify-email?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to:   user.email,
    subject: '✅ EduSpace — И-мэйл хаягаа баталгаажуулна уу',
    html: htmlWrap(`
      <h2>Тавтай морил, ${user.name}! 👋</h2>
      <p>EduSpace-д бүртгэгдсэн танд баяр хүргэж байна. Та доорх товчийг дарж и-мэйл хаягаа баталгаажуулна уу.</p>
      <div style="text-align:center">
        <a href="${url}" class="btn">И-мэйл баталгаажуулах →</a>
      </div>
      <hr class="divider">
      <p style="font-size:12px;color:#94a3b8">Товч ажиллахгүй бол доорх холбоосыг хөтчид хуулж нийлүүлнэ үү:<br>
      <a href="${url}" style="color:#005dce;font-size:11px">${url}</a></p>
      <p style="font-size:12px;color:#94a3b8">Та бүртгэл үүсгээгүй бол энэ и-мэйлийг үл тооно уу.</p>
    `),
  });
};

/**
 * Password reset email
 */
const sendPasswordResetEmail = async (user, token) => {
  const url = `${FRONTEND_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: FROM,
    to:   user.email,
    subject: '🔐 EduSpace — Нууц үг сэргээх',
    html: htmlWrap(`
      <h2>Нууц үг сэргээх</h2>
      <p>Та <strong>${user.email}</strong> хаягаар нууц үг сэргээх хүсэлт гаргасан байна.</p>
      <p>Доорх товчийг дарж шинэ нууц үг тохируулна уу. Холбоос <strong>1 цагийн дараа</strong> хүчингүй болно.</p>
      <div style="text-align:center">
        <a href="${url}" class="btn">Нууц үг сэргээх →</a>
      </div>
      <hr class="divider">
      <p style="font-size:12px;color:#94a3b8">Хэрэв та энэ хүсэлт гаргаагүй бол дансны аюулгүй байдалд анхаарч нэвтрэх нууц үгээ солино уу.</p>
    `),
  });
};

/**
 * Enrollment confirmation
 */
const sendEnrollmentEmail = async (user, course) => {
  await transporter.sendMail({
    from: FROM,
    to:   user.email,
    subject: `🎓 EduSpace — "${course.title}" хичээлд бүртгэгдлээ`,
    html: htmlWrap(`
      <h2>Бүртгэл амжилттай! 🎉</h2>
      <p>Та <strong>${course.title}</strong> хичээлд амжилттай бүртгэгдлээ.</p>
      <table style="width:100%;background:#f8fafc;border-radius:10px;padding:16px;margin:16px 0;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">📚 Хичээл</td><td style="font-weight:700;font-size:13px">${course.title}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">👨‍🏫 Багш</td><td style="font-size:13px">${course.teacher?.name || 'EduSpace'}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">📋 Категори</td><td style="font-size:13px">${course.category}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">🏆 Түвшин</td><td style="font-size:13px">${course.level}</td></tr>
      </table>
      <div style="text-align:center">
        <a href="${FRONTEND_URL}/courses/${course.id}" class="btn">Хичээл эхлүүлэх →</a>
      </div>
    `),
  });
};

/**
 * Welcome email after registration
 */
const sendWelcomeEmail = async (user) => {
  await transporter.sendMail({
    from: FROM,
    to:   user.email,
    subject: '🎓 EduSpace-д тавтай морил!',
    html: htmlWrap(`
      <h2>Сайн байна уу, ${user.name}! 👋</h2>
      <p>EduSpace-д амжилттай бүртгэгдлээ. Та одоо хичээлүүдийг үзэж, суралцах аяллаа эхлүүлж болно.</p>
      <div style="background:#f0f7ff;border-radius:10px;padding:20px;margin:16px 0">
        <p style="margin:0 0 8px;font-weight:700;color:#005dce">EduSpace дээр та:</p>
        <p style="margin:4px 0;font-size:13px">📚 500+ хичээлд нэвтрэх</p>
        <p style="margin:4px 0;font-size:13px">📡 Шууд хичээлд оролцох</p>
        <p style="margin:4px 0;font-size:13px">📊 Ахиц дэвшлээ хянах</p>
        <p style="margin:4px 0;font-size:13px">🌐 Монгол · English · 日本語 · 한국어 хэлээр</p>
      </div>
      <div style="text-align:center">
        <a href="${FRONTEND_URL}/courses" class="btn">Хичээлүүд үзэх →</a>
      </div>
    `),
  });
};

/**
 * New live session reminder
 */
const sendLiveSessionReminder = async (user, session) => {
  const date = new Date(session.scheduledAt).toLocaleString('mn-MN');
  await transporter.sendMail({
    from: FROM,
    to:   user.email,
    subject: `📡 EduSpace — Шууд хичээл: "${session.title}"`,
    html: htmlWrap(`
      <h2>Шууд хичээлийн сануулга 📡</h2>
      <p><strong>${session.title}</strong> шууд хичээл тун удахгүй эхлэх гэж байна.</p>
      <table style="width:100%;background:#f8fafc;border-radius:10px;padding:16px;margin:16px 0;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">📅 Огноо</td><td style="font-weight:700;font-size:13px">${date}</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">⏱ Үргэлжлэх хугацаа</td><td style="font-size:13px">${session.duration} минут</td></tr>
        <tr><td style="padding:6px 0;color:#64748b;font-size:13px">👥 Хамгийн их</td><td style="font-size:13px">${session.maxAttendees} оролцогч</td></tr>
      </table>
      <div style="text-align:center">
        <a href="${FRONTEND_URL}/lessons/live" class="btn">Нэгдэх →</a>
      </div>
    `),
  });
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendEnrollmentEmail,
  sendWelcomeEmail,
  sendLiveSessionReminder,
  transporter,
};
