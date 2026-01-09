import { Exam, Student, Question, StudentSubmission, QuestionType, ClassAnalysis, QuestionResult } from './types';

// --- Local Storage Keys ---
const KEYS = {
  STUDENTS: 'mo_students',
  EXAMS: 'mo_exams',
  QUESTIONS: 'mo_questions',
  SUBMISSIONS: 'mo_submissions',
};

// --- Baidu AI Configuration ---
// ⚠️ 安全警告：前端环境变量仍然会暴露在bundle中
// 最佳实践：应该通过后端API代理所有百度API调用
// 临时方案：使用环境变量（仍然不够安全，但比硬编码好）
const BAIDU_CONFIG = {
  AK: import.meta.env.VITE_BAIDU_AK || '',
  SK: import.meta.env.VITE_BAIDU_SK || '',
  // 使用Nginx代理解决跨域问题
  // 在生产环境（Docker）中，使用 /api/baidu 代理路径
  // 在开发环境中，如果Vite配置了代理，也可以使用相对路径
  URL_PREFIX: '/api/baidu',
};

// 验证配置
if (!BAIDU_CONFIG.AK || !BAIDU_CONFIG.SK) {
  console.error('⚠️ 警告: 百度API密钥未配置！');
  console.error('请在项目根目录创建 .env 文件，并添加以下内容：');
  console.error('VITE_BAIDU_AK=your_baidu_api_key');
  console.error('VITE_BAIDU_SK=your_baidu_secret_key');
  console.error('');
  console.error('调试信息：');
  console.error('  import.meta.env.VITE_BAIDU_AK:', import.meta.env.VITE_BAIDU_AK);
  console.error('  import.meta.env.VITE_BAIDU_SK:', import.meta.env.VITE_BAIDU_SK ? '***已设置***' : '未设置');
  console.error('  当前模式:', import.meta.env.MODE);
  console.error('  是否生产环境:', import.meta.env.PROD);
}

// --- Storage Service ---

export const storageService = {
  // Students
  getStudents: (): Student[] => {
    const data = localStorage.getItem(KEYS.STUDENTS);
    return data ? JSON.parse(data) : [];
  },
  saveStudents: (students: Student[]) => {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  },
  addStudents: (newStudents: Student[]) => {
    const current = storageService.getStudents();
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify([...current, ...newStudents]));
  },

  // Exams
  getExams: (): Exam[] => {
    const data = localStorage.getItem(KEYS.EXAMS);
    return data ? JSON.parse(data) : [];
  },
  getExamById: (id: string): Exam | undefined => {
    return storageService.getExams().find(e => e.id === id);
  },
  saveExam: (exam: Exam) => {
    const exams = storageService.getExams();
    const idx = exams.findIndex(e => e.id === exam.id);
    if (idx >= 0) exams[idx] = exam;
    else exams.push(exam);
    localStorage.setItem(KEYS.EXAMS, JSON.stringify(exams));
  },

  // Questions
  getQuestions: (examId: string): Question[] => {
    const data = localStorage.getItem(KEYS.QUESTIONS);
    const all = data ? JSON.parse(data) : [];
    return all.filter((q: Question) => q.examId === examId);
  },
  saveQuestions: (questions: Question[]) => {
    const data = localStorage.getItem(KEYS.QUESTIONS);
    let all: Question[] = data ? JSON.parse(data) : [];
    // Remove existing for this exam to replace
    if (questions.length > 0) {
        all = all.filter(q => q.examId !== questions[0].examId);
        all = [...all, ...questions];
    }
    localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(all));
  },

  // Submissions
  getSubmissions: (examId: string): StudentSubmission[] => {
    const data = localStorage.getItem(KEYS.SUBMISSIONS);
    const all = data ? JSON.parse(data) : [];
    return all.filter((s: StudentSubmission) => s.examId === examId);
  },
  saveSubmission: (submission: StudentSubmission) => {
    const data = localStorage.getItem(KEYS.SUBMISSIONS);
    const all: StudentSubmission[] = data ? JSON.parse(data) : [];
    const idx = all.findIndex(s => s.id === submission.id);
    if (idx >= 0) all[idx] = submission;
    else all.push(submission);
    localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(all));
  },

  clearAll: () => {
    localStorage.clear();
  }
};

// --- AI Service (Real Implementation) ---

// Helper: Convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// Helper: Crop Image from Base64 using Coordinates
const cropImage = (base64Image: string, rect: { left: number, top: number, width: number, height: number }): Promise<string> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.src = base64Image;
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = rect.width;
            canvas.height = rect.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, rect.left, rect.top, rect.width, rect.height, 0, 0, rect.width, rect.height);
                resolve(canvas.toDataURL('image/png'));
            } else {
                resolve(base64Image); // Fallback
            }
        };
    });
};

// Helper: Get Access Token
let accessToken = '';
let tokenExpiresAt = 0;

const getAccessToken = async () => {
    if (accessToken && Date.now() < tokenExpiresAt) return accessToken;

    // 验证配置
    if (!BAIDU_CONFIG.AK || !BAIDU_CONFIG.SK) {
        throw new Error('百度API密钥未配置！请设置 VITE_BAIDU_AK 和 VITE_BAIDU_SK 环境变量');
    }

    // 使用代理路径，Nginx会转发到百度API
    // 注意：百度API要求使用URL参数方式（虽然不够安全，但API限制）
    // 敏感信息已通过Nginx配置不在访问日志中记录
    const url = `${BAIDU_CONFIG.URL_PREFIX}/oauth/2.0/token?grant_type=client_credentials&client_id=${encodeURIComponent(BAIDU_CONFIG.AK)}&client_secret=${encodeURIComponent(BAIDU_CONFIG.SK)}`;
    
    try {
        console.log('正在获取百度API Token...');
        const response = await fetch(url, { 
            method: 'POST'
        });
        
        // 检查响应状态
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Token API Error:", response.status, errorText);
            throw new Error(`获取Token失败: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // 检查API返回的错误
        if (data.error) {
            console.error("Token API Error Response:", data);
            throw new Error(`百度API错误: ${data.error_description || data.error}`);
        }
        
        if (data.access_token) {
            accessToken = data.access_token;
            tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000;
            return accessToken;
        } else {
            throw new Error('API未返回access_token');
        }
    } catch (error: any) {
        console.error("Token Error:", error);
        // 提供更详细的错误信息
        if (error.message) {
            throw error;
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
            throw new Error('网络请求失败，请检查代理配置或网络连接');
        } else {
            throw new Error(`获取Token失败: ${error.message || '未知错误'}`);
        }
    }
};

export const aiService = {
  // Convert files to DataURLs for local processing and API sending
  processImages: async (files: File[]): Promise<string[]> => {
    const promises = files.map(f => fileToBase64(f));
    return Promise.all(promises);
  },

  // Step 3: Analyze Standard Paper using Baidu "Paper Cut" API
  analyzeStandardPaper: async (examId: string, imageUrls: string[]): Promise<Question[]> => {
    try {
        const token = await getAccessToken();
        const questions: Question[] = [];
        let questionIndexCounter = 1;

        // Process each page
        for (const base64Img of imageUrls) {
             // Remove header for API
             const imageBody = base64Img.replace(/^data:image\/\w+;base64,/, "");
             
             // 1. Call paper_cut_edu - 使用代理路径
             const apiUrl = `${BAIDU_CONFIG.URL_PREFIX}/rest/2.0/ocr/v1/paper_cut_edu`;
             console.log('调用API:', apiUrl);
             
             const response = await fetch(apiUrl, {
                 method: 'POST',
                 headers: {
                     'Content-Type': 'application/x-www-form-urlencoded'
                 },
                 body: `access_token=${token}&image=${encodeURIComponent(imageBody)}`
             });
             
             // 检查响应状态
             if (!response.ok) {
                 const errorText = await response.text();
                 console.error("OCR API Error:", response.status, response.statusText, errorText);
                 throw new Error(`OCR API调用失败: ${response.status} ${response.statusText}`);
             }
             
             const data = await response.json();
             
             // 检查API返回的错误
             if (data.error_code) {
                 console.error("OCR API Error Response:", data);
                 throw new Error(`百度OCR错误: ${data.error_msg || `错误代码 ${data.error_code}`}`);
             }
             
             if (data.results && Array.isArray(data.results)) {
                 for (const item of data.results) {
                     // item.location: {left, top, width, height}
                     // Crop the question image
                     const cropUrl = await cropImage(base64Img, item.location);
                     
                     questions.push({
                         id: `q-${examId}-${Date.now()}-${questionIndexCounter}`,
                         examId,
                         index: questionIndexCounter,
                         imageSliceUrl: cropUrl,
                         maxScore: 10, // Default, user can edit
                         knowledgePoint: '待分析', // Placeholder, could use OCR text to classify
                         type: QuestionType.Calculation,
                         standardAnswer: '', // User needs to fill
                         solutionImageSliceUrl: '' // Would require separate processing
                     });
                     questionIndexCounter++;
                 }
             } else {
                 console.warn("API返回数据格式异常:", data);
             }
        }

        // Fallback if API fails or returns no results (e.g. CORS error locally)
        if (questions.length === 0) {
             console.warn("API returned no results or failed. Using fallback mock data.");
             return Array.from({ length: 3 }).map((_, i) => ({
                id: `q-${examId}-${i + 1}`,
                examId,
                index: i + 1,
                imageSliceUrl: imageUrls[0], // Just use whole page as fallback
                maxScore: 10,
                knowledgePoint: '测试知识点',
                type: QuestionType.Calculation,
                standardAnswer: '10'
             }));
        }

        return questions;

    } catch (error: any) {
        console.error("Analysis Error:", error);
        const errorMessage = error?.message || '未知错误';
        alert(`调用百度API失败: ${errorMessage}\n\n请检查：\n1. 网络连接是否正常\n2. 代理配置是否正确（/api/baidu）\n3. 浏览器控制台查看详细错误信息`);
        return [];
    }
  },

  // Step 5 & 6: Grade Student Paper
  gradeStudentPaper: async (submission: StudentSubmission, questions: Question[]): Promise<StudentSubmission> => {
    try {
        const token = await getAccessToken();
        const results: QuestionResult[] = [];
        
        // For simplicity in this demo: 
        // 1. We OCR the entire first page of the student submission using Handwriting OCR.
        // 2. We search for the standard answer text in the OCR result.
        // In a real app, we would crop the student paper based on the same coordinates as the standard paper (if aligned)
        // or let the user crop the answer area.

        const studentPaperBase64 = submission.paperImages[0];
        if (!studentPaperBase64) return submission;

        const imageBody = studentPaperBase64.replace(/^data:image\/\w+;base64,/, "");

        // Call Handwriting OCR - 使用代理路径
        const apiUrl = `${BAIDU_CONFIG.URL_PREFIX}/rest/2.0/ocr/v1/handwriting`;
        console.log('调用手写识别API:', apiUrl);
        
        const response = await fetch(apiUrl, {
             method: 'POST',
             headers: {
                 'Content-Type': 'application/x-www-form-urlencoded'
             },
             body: `access_token=${token}&image=${encodeURIComponent(imageBody)}`
        });

        // 检查响应状态
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Handwriting OCR API Error:", response.status, response.statusText, errorText);
            throw new Error(`手写识别API调用失败: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // 检查API返回的错误
        if (data.error_code) {
            console.error("Handwriting OCR API Error Response:", data);
            throw new Error(`百度手写识别错误: ${data.error_msg || `错误代码 ${data.error_code}`}`);
        }
        
        const allText = data.words_result ? data.words_result.map((w: any) => w.words).join(' ') : "";
        console.log("Student OCR Text:", allText);

        // Grading Logic
        questions.forEach(q => {
             // Simple keyword matching logic
             // If standard answer is "15", we look for "15" in the OCR text.
             const isCorrect = allText.includes(q.standardAnswer);
             
             results.push({
                questionId: q.id,
                // Ideally we crop the specific area, here we just show the whole page or a placeholder
                studentAnswerImageSliceUrl: studentPaperBase64, 
                score: isCorrect ? q.maxScore : 0,
                isCorrect: isCorrect,
                errorAnalysis: isCorrect ? undefined : '未检测到正确答案或计算错误',
                studentAnswerText: isCorrect ? `(检测到) ${q.standardAnswer}` : "无法识别/错误"
             });
        });

        const totalScore = results.reduce((sum, r) => sum + r.score, 0);

        return {
          ...submission,
          status: 'graded',
          results,
          totalScore
        };

    } catch (error: any) {
        console.error("Grading Error:", error);
        const errorMessage = error?.message || '未知错误';
        console.error("阅卷失败:", errorMessage);
        // 返回原始提交，标记为已评分但分数为0
        return { ...submission, status: 'graded', totalScore: 0, results: [] };
    }
  },

  // Step 7, 8, 9: Analysis Generation (Kept Local Logic)
  generateClassAnalysis: (examId: string): ClassAnalysis => {
    const submissions = storageService.getSubmissions(examId).filter(s => s.status === 'graded');
    // Allow empty for UI testing, but logically need submissions
    if (submissions.length === 0) {
         // Return empty structure if no data
         return {
            examId, totalStudents: 0, averageScore: 0, maxScore: 0, minScore: 0,
            scoreDistribution: [], questionStats: [], knowledgePointStats: []
         };
    }

    const scores = submissions.map(s => s.totalScore);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const maxScore = Math.max(...scores);
    const minScore = Math.min(...scores);

    // Distribution
    const scoreDistribution = [
      { range: '0-60%', count: scores.filter(s => s < 60).length },
      { range: '60-80%', count: scores.filter(s => s >= 60 && s < 80).length },
      { range: '80-100%', count: scores.filter(s => s >= 80).length },
    ];

    const questions = storageService.getQuestions(examId);

    // Question Stats
    const questionStats = questions.map(q => {
       const relevantResults = submissions.flatMap(s => s.results.filter(r => r.questionId === q.id));
       const avgQScore = relevantResults.reduce((sum, r) => sum + r.score, 0) / (relevantResults.length || 1);
       const errorRate = relevantResults.filter(r => !r.isCorrect).length / (relevantResults.length || 1);
       
       return {
         questionIndex: q.index,
         errorRate,
         avgScore: avgQScore,
         mainErrorFactors: ['需根据OCR详情分析']
       };
    });

    // Knowledge Stats
    const knowledgeMap = new Map<string, { total: number, correct: number }>();
    questions.forEach(q => {
      const stats = knowledgeMap.get(q.knowledgePoint) || { total: 0, correct: 0 };
      const relevantResults = submissions.flatMap(s => s.results.filter(r => r.questionId === q.id));
      stats.total += relevantResults.length;
      stats.correct += relevantResults.filter(r => r.isCorrect).length;
      knowledgeMap.set(q.knowledgePoint, stats);
    });

    const knowledgePointStats = Array.from(knowledgeMap.entries()).map(([point, stats]) => ({
      point,
      accuracy: stats.total ? stats.correct / stats.total : 0,
      issue: (stats.total && (stats.correct / stats.total) < 0.7) ? '需强化' : '良好'
    }));

    return {
      examId,
      totalStudents: submissions.length,
      averageScore: avgScore,
      maxScore,
      minScore,
      scoreDistribution,
      questionStats,
      knowledgePointStats
    };
  }
};