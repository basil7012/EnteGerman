import { sql } from '@vercel/postgres';
import crypto from 'node:crypto';
import { userIdFromRequest } from './_lib/security.js';

export default async function handler(req, res) {
  // Same-origin only: no CORS headers.
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const userId = userIdFromRequest(req);
  if (!userId) {
    return res.status(401).json({ success: false, message: 'Please log in again.' });
  }

  try {
    // SAVE EXAM RESULT
    if (req.method === 'POST') {
      const {
        examPart,
        taskTitle,
        scoreTotal,
        rubricAufgabe,
        rubricAusdruck,
        rubricGrammatik,
        rubricFluency,
        isThemaverfehlung,
        studentTranscript,
        examinerComment
      } = req.body || {};

      const num = (v, max = 100) => Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
      const text = (v, n) => String(v || '').slice(0, n);
      if (!examPart || scoreTotal === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required exam data' });
      }

      const examId = 'exam_' + crypto.randomUUID();

      await sql`
        INSERT INTO exam_history (
          id, user_id, exam_part, task_title, score_total,
          rubric_aufgabe, rubric_ausdruck, rubric_grammatik, rubric_fluency,
          is_themaverfehlung, student_transcript, examiner_comment
        ) VALUES (
          ${examId}, ${userId}, ${text(examPart, 50)}, ${text(taskTitle || 'Thema', 255)}, ${num(scoreTotal)},
          ${num(rubricAufgabe)}, ${num(rubricAusdruck)}, ${num(rubricGrammatik)}, ${num(rubricFluency)},
          ${Boolean(isThemaverfehlung)}, ${text(studentTranscript, 5000)}, ${text(examinerComment, 2000)}
        );
      `;

      return res.status(200).json({ success: true, examId, message: 'Exam result saved to cloud successfully!' });
    }

    // GET USER EXAM HISTORY
    if (req.method === 'GET') {
      const history = await sql`
        SELECT id, exam_part, task_title, score_total, rubric_aufgabe, rubric_ausdruck, 
               rubric_grammatik, rubric_fluency, is_themaverfehlung, created_at 
        FROM exam_history 
        WHERE user_id = ${userId} 
        ORDER BY created_at DESC 
        LIMIT 20;
      `;

      return res.status(200).json({ success: true, history: history.rows });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });

  } catch (error) {
    console.error('History API error:', error);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
}
