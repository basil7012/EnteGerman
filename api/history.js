import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // SAVE EXAM RESULT
    if (req.method === 'POST') {
      const {
        userId,
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

      if (!userId || !examPart || scoreTotal === undefined) {
        return res.status(400).json({ success: false, message: 'Missing required exam data' });
      }

      const examId = 'exam_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

      await sql`
        INSERT INTO exam_history (
          id, user_id, exam_part, task_title, score_total,
          rubric_aufgabe, rubric_ausdruck, rubric_grammatik, rubric_fluency,
          is_themaverfehlung, student_transcript, examiner_comment
        ) VALUES (
          ${examId}, ${userId}, ${examPart}, ${taskTitle || 'Thema'}, ${scoreTotal},
          ${rubricAufgabe || 0}, ${rubricAusdruck || 0}, ${rubricGrammatik || 0}, ${rubricFluency || 0},
          ${Boolean(isThemaverfehlung)}, ${studentTranscript || ''}, ${examinerComment || ''}
        );
      `;

      return res.status(200).json({ success: true, examId, message: 'Exam result saved to cloud successfully!' });
    }

    // GET USER EXAM HISTORY
    if (req.method === 'GET') {
      const { userId } = req.query;
      if (!userId) {
        return res.status(400).json({ success: false, message: 'User ID required' });
      }

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
    return res.status(500).json({ success: false, message: 'Database error: ' + error.message });
  }
}
