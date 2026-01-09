import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Users, FileText, Upload, CheckCircle, BarChart2, 
  Settings, ChevronRight, PieChart, AlertCircle, Printer,
  FileDown, Plus, Trash2, Edit3, ArrowLeft, Brain, RotateCcw, AlertTriangle, FileUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RePieChart, Pie, Cell
} from 'recharts';

import { Exam, Student, Question, StudentSubmission, QuestionType, ClassAnalysis } from './types';
import { storageService, aiService } from './services';

// --- Shared Components ---

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="min-h-screen flex bg-slate-50 print:bg-white print:block">
      {/* Sidebar - Hidden when printing */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 print:hidden">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Brain className="text-indigo-400" />
            <span>奥数智能阅卷</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">小学奥数专用版</p>
        </div>
        <nav className="p-4 space-y-2">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${location.pathname === '/' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <BarChart2 size={18} />
            仪表盘
          </Link>
          <Link to="/students" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/students') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <Users size={18} />
            学生名单
          </Link>
          <Link to="/exams" className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/exams') ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>
            <FileText size={18} />
            考试与阅卷
          </Link>
        </nav>
        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-700">
             <button onClick={() => {if(confirm('确定要清除所有数据吗？')) { storageService.clearAll(); window.location.reload(); }}} className="text-xs text-slate-500 hover:text-red-400 flex items-center gap-1">
                <Trash2 size={12}/> 重置演示数据
             </button>
        </div>
      </aside>

      {/* Main Content - Fix overflow for printing */}
      <main className="flex-1 overflow-auto p-8 print:p-0 print:overflow-visible print:h-auto">
        {children}
      </main>
    </div>
  );
};

const Card = ({ title, children, className = '' }: { title?: React.ReactNode, children?: React.ReactNode, className?: string, key?: React.Key }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden ${className}`}>
    {title && <div className="px-6 py-4 border-b border-slate-100 font-semibold text-slate-800">{title}</div>}
    <div className="p-6">{children}</div>
  </div>
);

const Button = ({ children, onClick, variant = 'primary', icon: Icon, disabled = false, className = '' }: any) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants: any = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100",
    secondary: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-200"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const labels: any = {
    draft: '草稿',
    analyzed: '已解析',
    grading: '阅卷中',
    completed: '已完成',
    uploaded: '已上传',
    graded: '已评分',
  };
  const styles: any = {
    draft: 'bg-slate-100 text-slate-600',
    analyzed: 'bg-blue-50 text-blue-600',
    grading: 'bg-orange-50 text-orange-600',
    completed: 'bg-green-50 text-green-600',
    uploaded: 'bg-yellow-50 text-yellow-600',
    graded: 'bg-green-50 text-green-600',
  };
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase tracking-wide ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
};

// --- Page Components ---

const Dashboard = () => {
  const exams = storageService.getExams();
  const students = storageService.getStudents();
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">欢迎回来，老师</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
           <div className="flex items-center gap-4">
             <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Users size={24}/></div>
             <div>
               <p className="text-sm text-slate-500">学生总数</p>
               <p className="text-2xl font-bold">{students.length}</p>
             </div>
           </div>
        </Card>
        <Card>
           <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-100 rounded-lg text-indigo-600"><FileText size={24}/></div>
             <div>
               <p className="text-sm text-slate-500">已创建考试</p>
               <p className="text-2xl font-bold">{exams.length}</p>
             </div>
           </div>
        </Card>
        <Card>
           <div className="flex items-center gap-4">
             <div className="p-3 bg-green-100 rounded-lg text-green-600"><CheckCircle size={24}/></div>
             <div>
               <p className="text-sm text-slate-500">已完成阅卷</p>
               <p className="text-2xl font-bold">{exams.filter(e => e.status === 'completed').length}</p>
             </div>
           </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="最近考试">
          {exams.length === 0 ? <p className="text-slate-500">暂无考试，请创建。</p> : (
             <div className="space-y-4">
               {exams.slice(-3).map(exam => (
                 <Link to={`/exams/${exam.id}/dashboard`} key={exam.id} className="block p-4 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-center">
                       <div>
                         <h4 className="font-semibold text-slate-800">{exam.title}</h4>
                         <p className="text-sm text-slate-500">{exam.date}</p>
                       </div>
                       <StatusBadge status={exam.status} />
                    </div>
                 </Link>
               ))}
             </div>
          )}
        </Card>
        <Card title="快捷操作">
           <div className="space-y-3">
             <Link to="/exams/new">
                <Button variant="secondary" icon={Plus} className="w-full justify-start">创建新考试</Button>
             </Link>
             <Link to="/students">
                <Button variant="secondary" icon={Upload} className="w-full justify-start">更新学生名单</Button>
             </Link>
           </div>
        </Card>
      </div>
    </div>
  );
};

const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  
  useEffect(() => {
    setStudents(storageService.getStudents());
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Simulated Excel parsing
    if (e.target.files && e.target.files[0]) {
      alert("模拟上传Excel... 已添加示例学生数据。");
      const demoStudents: Student[] = [
        { id: 'S001', name: '张伟', grade: '五年级', classType: '奥数A班', teacher: '王老师' },
        { id: 'S002', name: '李强', grade: '五年级', classType: '奥数A班', teacher: '王老师' },
        { id: 'S003', name: '王芳', grade: '五年级', classType: '奥数A班', teacher: '王老师' },
      ];
      storageService.addStudents(demoStudents);
      setStudents(storageService.getStudents());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">学生名单管理</h2>
        <div className="relative">
          <input type="file" id="upload-students" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} />
          <label htmlFor="upload-students">
             <div className="bg-indigo-600 text-white px-4 py-2 rounded-lg cursor-pointer flex items-center gap-2 hover:bg-indigo-700">
                <Upload size={18} /> 导入Excel名单
             </div>
          </label>
        </div>
      </div>

      <Card>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-sm">
              <th className="p-3">姓名</th>
              <th className="p-3">年级</th>
              <th className="p-3">班型</th>
              <th className="p-3">授课老师</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="p-3 font-medium text-slate-800">{s.name}</td>
                <td className="p-3 text-slate-600">{s.grade}</td>
                <td className="p-3 text-slate-600">{s.classType}</td>
                <td className="p-3 text-slate-600">{s.teacher}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={4} className="p-6 text-center text-slate-400">暂无学生信息，请点击右上角导入。</td></tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

const ExamList = () => {
    const exams = storageService.getExams();
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-800">考试列表</h2>
                <Link to="/exams/new"><Button icon={Plus}>创建考试</Button></Link>
            </div>
            <div className="grid gap-4">
                {exams.map(exam => (
                    <Card key={exam.id} className="hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">{exam.title}</h3>
                                <p className="text-sm text-slate-500">{exam.date} • {exam.standardPaperImages.length} 页试卷</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <StatusBadge status={exam.status} />
                                {exam.status === 'draft' && <Link to={`/exams/${exam.id}/analysis`}><Button variant="secondary" icon={Edit3}>设置试卷</Button></Link>}
                                {exam.status === 'analyzed' && <Link to={`/exams/${exam.id}/upload`}><Button variant="secondary" icon={Upload}>上传答卷</Button></Link>}
                                {/* Show supplemental upload button even for grading/completed exams */}
                                {(exam.status === 'grading' || exam.status === 'completed') && (
                                    <>
                                       <Link to={`/exams/${exam.id}/upload`}><Button variant="secondary" icon={FileUp}>补录答卷</Button></Link>
                                       <Link to={`/exams/${exam.id}/grading`}><Button variant="secondary" icon={CheckCircle}>智能阅卷</Button></Link>
                                       <Link to={`/exams/${exam.id}/dashboard`}><Button variant="primary" icon={BarChart2}>查看分析</Button></Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    )
}

const CreateExam = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    setProcessing(true);
    
    // Process images into base64 for API usage
    const processedImages = await aiService.processImages(files);
    
    const newExam: Exam = {
      id: Date.now().toString(),
      title,
      date: new Date().toISOString().split('T')[0],
      standardPaperImages: processedImages.length > 0 ? processedImages : [],
      status: 'draft'
    };
    storageService.saveExam(newExam);
    setProcessing(false);
    navigate(`/exams/${newExam.id}/analysis`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        setFiles(Array.from(e.target.files));
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
       <Link to="/exams" className="text-slate-500 hover:text-indigo-600 flex items-center gap-1 mb-4"><ArrowLeft size={16}/> 返回</Link>
       <h2 className="text-2xl font-bold text-slate-800">创建新考试</h2>
       <Card>
         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">考试名称</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500" placeholder="例如：2023秋季奥数期末考试" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">标准试卷及答案 (图片/PDF，支持多选)</label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:bg-white transition-colors">
                 <input type="file" multiple onChange={handleFileChange} className="hidden" id="exam-upload" accept="image/*,.pdf" />
                 <label htmlFor="exam-upload" className="cursor-pointer flex flex-col items-center w-full h-full justify-center">
                    <Upload className="text-slate-400 mb-2" size={32} />
                    <span className="text-indigo-600 font-medium">{files.length > 0 ? `已选择 ${files.length} 个文件` : "点击上传标准试卷"}</span>
                    <span className="text-xs text-slate-400 mt-1">支持 JPG, PNG, 多张同时上传</span>
                    <span className="text-xs text-green-500 mt-1 flex items-center gap-1"><RotateCcw size={10}/> 系统将自动处理图片以便于OCR识别</span>
                 </label>
              </div>
              {files.length > 0 && (
                  <div className="mt-2 text-sm text-slate-600">
                      <ul>
                          {files.map((f, i) => <li key={i}>📄 {f.name}</li>)}
                      </ul>
                  </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
               <Button variant="primary" type="submit" disabled={processing || files.length === 0} icon={processing ? RotateCcw : CheckCircle}>
                   {processing ? '正在处理并连接AI...' : '创建并开始分析'}
               </Button>
            </div>
         </form>
       </Card>
    </div>
  );
};

// Step 3: Standard Analysis
const StandardAnalysis = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [analyzed, setAnalyzed] = useState(false);

    useEffect(() => {
        if(id) {
            const qs = storageService.getQuestions(id);
            if (qs.length > 0) {
                setQuestions(qs);
                setAnalyzed(true);
            }
        }
    }, [id]);

    const runAnalysis = async () => {
        setLoading(true);
        if (id) {
            const exam = storageService.getExamById(id);
            if (exam) {
                // Call Real Baidu API
                const newQuestions = await aiService.analyzeStandardPaper(id, exam.standardPaperImages);
                setQuestions(newQuestions);
                storageService.saveQuestions(newQuestions);
                setAnalyzed(true);
            }
        }
        setLoading(false);
    };

    const confirmSetup = () => {
        if (id) {
            const exam = storageService.getExamById(id);
            if (exam) {
                exam.status = 'analyzed';
                storageService.saveExam(exam);
                navigate(`/exams/${id}/upload`);
            }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">标准试卷结构分析</h2>
                <div className="flex gap-3">
                   {!analyzed && <Button onClick={runAnalysis} disabled={loading} icon={Brain}>{loading ? 'AI分析中...' : '开始AI切题与分析'}</Button>}
                   {analyzed && <Button onClick={confirmSetup} icon={CheckCircle}>确认无误，下一步</Button>}
                </div>
            </div>

            {loading && (
                <div className="p-12 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">正在调用百度教育OCR进行智能切题...</p>
                    <p className="text-xs text-slate-400 mt-2">通过代理 /api/baidu 调用API，请稍候...</p>
                    <p className="text-xs text-slate-400 mt-1">如遇问题，请打开浏览器控制台（F12）查看详细错误</p>
                </div>
            )}

            {analyzed && (
                <div className="grid gap-6">
                    {questions.length === 0 && <div className="text-center text-red-500">API分析未返回结果或发生错误。请检查控制台。</div>}
                    {questions.map((q, i) => (
                        <Card key={q.id}>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="w-full md:w-1/3">
                                    <div className="text-sm font-bold text-slate-500 mb-2">第 {q.index} 题 图片切片</div>
                                    <img src={q.imageSliceUrl} alt="Question" className="w-full rounded border" />
                                </div>
                                <div className="w-full md:w-2/3 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase">考查知识点</label>
                                            <input type="text" defaultValue={q.knowledgePoint} className="w-full border-b border-slate-300 focus:border-indigo-500 outline-none py-1" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase">满分分值</label>
                                            <input type="number" defaultValue={q.maxScore} className="w-full border-b border-slate-300 focus:border-indigo-500 outline-none py-1" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase">题型</label>
                                            <select defaultValue={q.type} className="w-full border-b border-slate-300 py-1 bg-transparent">
                                                {Object.values(QuestionType).map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-slate-500 uppercase">标准答案</label>
                                            <input type="text" defaultValue={q.standardAnswer} onChange={(e) => {
                                                q.standardAnswer = e.target.value;
                                                storageService.saveQuestions(questions); // Simple auto-save for demo
                                            }} placeholder="请输入答案用于自动阅卷" className="w-full border-b border-indigo-300 focus:border-indigo-500 outline-none py-1 bg-indigo-50 px-2" />
                                            <p className="text-[10px] text-slate-400 mt-1">AI阅卷将比对此答案</p>
                                        </div>
                                    </div>
                                    <div>
                                         <label className="text-xs font-semibold text-slate-500 uppercase">标准解答过程切片</label>
                                         <div className="h-20 border rounded bg-slate-50 flex items-center justify-center text-slate-400 text-sm">
                                             暂无解析图
                                         </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

// Step 4: Student Upload
const StudentUpload = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [students, setStudents] = useState(storageService.getStudents());
    const [selectedStudent, setSelectedStudent] = useState('');
    const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
    const [uploadFiles, setUploadFiles] = useState<File[]>([]);

    useEffect(() => {
        if (id) setSubmissions(storageService.getSubmissions(id));
        setStudents(storageService.getStudents());
    }, [id]);

    const handleUpload = async () => {
        if (!id || !selectedStudent || uploadFiles.length === 0) return;
        
        // Convert to Base64 for processing
        const base64Images = await aiService.processImages(uploadFiles);

        const sub: StudentSubmission = {
            id: `sub-${Date.now()}`,
            examId: id,
            studentId: selectedStudent,
            paperImages: base64Images,
            status: 'uploaded',
            results: [],
            totalScore: 0
        };
        storageService.saveSubmission(sub);
        setSubmissions(storageService.getSubmissions(id));
        setSelectedStudent('');
        setUploadFiles([]);
        alert("上传成功！");
    };

    const handlePaperFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setUploadFiles(Array.from(e.target.files));
        }
    };

    const handleStudentListUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            alert("已更新学生名单！(模拟)");
            // Add mock student to show effect
            const newStudent = { id: `S-NEW-${Date.now()}`, name: '新同学', grade: '五年级', classType: '补录班', teacher: '王老师' };
            const updated = [...storageService.getStudents(), newStudent];
            storageService.saveStudents(updated);
            setStudents(updated);
        }
    };

    const finishUpload = () => {
        if (id) {
             const exam = storageService.getExamById(id);
             if (exam) {
                 // Do not change status if already grading or completed to allow supplemental
                 if (exam.status !== 'grading' && exam.status !== 'completed') {
                    exam.status = 'grading';
                    storageService.saveExam(exam);
                 }
                 navigate(`/exams/${id}/grading`);
             }
        }
    }

    const missingStudents = students.filter(s => !submissions.find(sub => sub.studentId === s.id));

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">上传学生答卷</h2>
                <div className="flex gap-2">
                     <div className="relative">
                        <input type="file" id="update-roster" className="hidden" accept=".xlsx,.xls,.csv" onChange={handleStudentListUpdate} />
                        <label htmlFor="update-roster">
                            <div className="px-4 py-2 border border-indigo-200 text-indigo-700 rounded-lg cursor-pointer bg-indigo-50 hover:bg-indigo-100 flex items-center gap-2">
                                <Users size={18} /> 导入/更新名单
                            </div>
                        </label>
                     </div>
                     <Button onClick={finishUpload} icon={CheckCircle}>
                        {submissions.length > 0 ? "开始智能阅卷/返回阅卷" : "开始智能阅卷"}
                     </Button>
                </div>
            </div>

            {/* Missing Students Alert */}
            {missingStudents.length > 0 ? (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertTriangle className="text-orange-500 mt-1 shrink-0" size={20} />
                    <div>
                        <h4 className="font-bold text-orange-800">还有 {missingStudents.length} 位同学未上传答卷</h4>
                        <p className="text-sm text-orange-600 mt-1 leading-relaxed">
                            缺交名单：{missingStudents.map(s => s.name).join('、')}
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                     <CheckCircle className="text-green-500" size={20} />
                     <span className="text-green-800 font-medium">太棒了！全班同学已全部上传完成。</span>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="上传/补录答卷" className="h-fit">
                    <div className="space-y-4">
                        <select className="w-full p-2 border rounded" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                            <option value="">选择学生...</option>
                            {missingStudents.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.classType})</option>
                            ))}
                            {/* Allow re-uploading for existing too if needed, but prioritize missing */}
                            <optgroup label="已上传（重新上传将覆盖）">
                                {submissions.map(sub => {
                                    const s = students.find(st => st.id === sub.studentId);
                                    return s ? <option key={s.id} value={s.id}>{s.name}</option> : null;
                                })}
                            </optgroup>
                        </select>
                        
                        <div className="relative group">
                            <input type="file" id="paper-upload" className="hidden" accept="image/*" multiple onChange={handlePaperFileChange} />
                            <label htmlFor="paper-upload" className="block border-2 border-dashed border-slate-300 rounded-lg p-8 text-center bg-slate-50 hover:bg-white hover:border-indigo-400 transition-all cursor-pointer">
                                <div className="flex flex-col items-center">
                                    <Upload className={`mb-2 ${uploadFiles.length > 0 ? 'text-green-500' : 'text-slate-400'}`} size={32} />
                                    <span className="text-indigo-600 font-medium">
                                        {uploadFiles.length > 0 ? `已选择 ${uploadFiles.length} 个文件` : "点击选择或拖拽答卷图片"}
                                    </span>
                                    {uploadFiles.length === 0 && <span className="text-xs text-slate-400 mt-1">支持 JPG, PNG (支持多选)</span>}
                                    {uploadFiles.length > 0 && (
                                        <ul className="mt-2 text-xs text-slate-500 text-left w-full max-h-24 overflow-y-auto">
                                            {uploadFiles.map((f, i) => (
                                                <li key={i} className="truncate">• {f.name}</li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </label>
                        </div>

                        <Button onClick={handleUpload} disabled={!selectedStudent || uploadFiles.length === 0} className="w-full">确认上传</Button>
                    </div>
                </Card>

                <div className="md:col-span-2 space-y-4">
                    <h3 className="font-semibold text-slate-600">已上传学生 ({submissions.length}/{students.length})</h3>
                    {submissions.length === 0 && <p className="text-slate-400">暂无上传记录。</p>}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {submissions.map(sub => {
                            const st = students.find(s => s.id === sub.studentId);
                            return (
                                <div key={sub.id} className="flex justify-between items-center p-3 bg-white border rounded">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                                            {st?.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-800">{st?.name}</div>
                                            <div className="text-xs text-slate-400">{sub.status === 'graded' ? '已评分' : '待阅卷'}</div>
                                        </div>
                                    </div>
                                    <span className="text-green-600 text-sm flex items-center gap-1"><CheckCircle size={14}/> 已上传</span>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Step 5 & 6: Grading
const Grading = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
    const [grading, setGrading] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (id) setSubmissions(storageService.getSubmissions(id));
    }, [id]);

    const startAutoGrading = async () => {
        if (!id) return;
        setGrading(true);
        const questions = storageService.getQuestions(id);
        const toGrade = submissions.filter(s => s.status === 'uploaded');
        
        for (let i = 0; i < toGrade.length; i++) {
            const sub = toGrade[i];
            const gradedSub = await aiService.gradeStudentPaper(sub, questions);
            storageService.saveSubmission(gradedSub);
            setProgress(((i + 1) / toGrade.length) * 100);
        }
        
        setSubmissions(storageService.getSubmissions(id));
        setGrading(false);
        const exam = storageService.getExamById(id);
        if (exam) {
            exam.status = 'completed';
            storageService.saveExam(exam);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">智能阅卷中心</h2>
                <div className="flex gap-2">
                     <Link to={`/exams/${id}/upload`}>
                        <Button variant="secondary" icon={Upload}>补录答卷</Button>
                     </Link>
                     {!grading && submissions.some(s => s.status === 'uploaded') && (
                        <Button onClick={startAutoGrading} icon={Brain}>开始自动阅卷</Button>
                     )}
                     <Link to={`/exams/${id}/dashboard`}>
                        <Button variant="secondary" icon={BarChart2}>查看分析报告</Button>
                     </Link>
                </div>
            </div>

            {grading && (
                 <div className="bg-white p-6 rounded-lg shadow-sm">
                    <div className="flex justify-between mb-2 text-sm font-medium">
                        <span>AI 正在识别笔迹并自动评分...</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2.5">
                        <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">调用接口: ocr/v1/handwriting</p>
                 </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {submissions.map(sub => {
                     const st = storageService.getStudents().find(s => s.id === sub.studentId);
                     return (
                         <Card key={sub.id}>
                             <div className="flex justify-between items-center mb-4 border-b pb-4">
                                 <div>
                                     <h3 className="font-bold text-lg">{st?.name}</h3>
                                     <p className="text-sm text-slate-500">学号: {st?.id}</p>
                                 </div>
                                 <div className="text-right">
                                     <div className="text-2xl font-bold text-indigo-600">{sub.totalScore} <span className="text-sm text-slate-400 font-normal">分</span></div>
                                     <StatusBadge status={sub.status} />
                                 </div>
                             </div>
                             {sub.status === 'graded' && (
                                 <div className="overflow-x-auto">
                                     <div className="flex gap-4">
                                         {sub.results.map((r, i) => (
                                             <div key={i} className={`min-w-[150px] p-3 rounded border ${r.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                                 <div className="text-xs font-bold text-slate-500 mb-1">第{i+1}题</div>
                                                 {/* Ideally crop the student's specific answer, here we use full page/slice */}
                                                 <img src={r.studentAnswerImageSliceUrl} className="h-12 w-full object-cover mb-2 rounded bg-white" alt="ans"/>
                                                 <div className="flex justify-between items-center">
                                                     <span className={`font-bold ${r.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                                                         {r.score} 分
                                                     </span>
                                                     {r.isCorrect ? <CheckCircle size={16} className="text-green-500"/> : <AlertCircle size={16} className="text-red-500"/>}
                                                 </div>
                                                 <p className="text-[10px] text-slate-500 mt-1">{r.studentAnswerText}</p>
                                                 {!r.isCorrect && <p className="text-[10px] text-red-600 mt-1 leading-tight">{r.errorAnalysis}</p>}
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )}
                         </Card>
                     )
                })}
            </div>
        </div>
    );
};

// Step 7: Dashboard Analysis
const ExamDashboard = () => {
    const { id } = useParams();
    const [data, setData] = useState<ClassAnalysis | null>(null);

    useEffect(() => {
        if(id) {
            try {
               const analysis = aiService.generateClassAnalysis(id);
               setData(analysis);
            } catch(e) {
                // Not ready
            }
        }
    }, [id]);

    if (!data) return <div className="p-8 text-center text-slate-500">分析数据尚未生成，请先完成阅卷。</div>;

    const COLORS = ['#FF8042', '#FFBB28', '#00C49F', '#0088FE'];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                 <h2 className="text-2xl font-bold text-slate-800">考试分析仪表盘</h2>
                 <div className="flex gap-2">
                    <Link to={`/exams/${id}/report/class`}><Button variant="secondary" icon={FileText}>班级报告</Button></Link>
                    <Link to={`/exams/${id}/report/student`}><Button variant="secondary" icon={Users}>学生个人报告</Button></Link>
                 </div>
            </div>

            {/* Score Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500">平均分</div>
                    <div className="text-3xl font-bold text-indigo-600">{data.averageScore}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500">最高分</div>
                    <div className="text-3xl font-bold text-green-600">{data.maxScore}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500">最低分</div>
                    <div className="text-3xl font-bold text-red-500">{data.minScore}</div>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="text-sm text-slate-500">参考人数</div>
                    <div className="text-3xl font-bold text-slate-700">{data.totalStudents}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="成绩分布">
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.scoreDistribution}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="range" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{fill: 'transparent'}} />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card title="知识点掌握情况">
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.knowledgePointStats} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" domain={[0, 1]} tickFormatter={(v) => `${Math.round(v*100)}%`} />
                                <YAxis dataKey="point" type="category" width={100} tick={{fontSize: 12}} />
                                <Tooltip formatter={(value: number) => `${Math.round(value * 100)}%`} />
                                <Bar dataKey="accuracy" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                         </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card title="题目表现详情">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                                <th className="px-4 py-2">题号</th>
                                <th className="px-4 py-2">错误率</th>
                                <th className="px-4 py-2">平均得分</th>
                                <th className="px-4 py-2">主要问题</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.questionStats.map((q) => (
                                <tr key={q.questionIndex} className="border-b">
                                    <td className="px-4 py-3 font-medium">第{q.questionIndex}题</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 bg-slate-200 rounded-full h-1.5">
                                                <div className="bg-red-500 h-1.5 rounded-full" style={{ width: `${q.errorRate * 100}%` }}></div>
                                            </div>
                                            <span>{Math.round(q.errorRate * 100)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{q.avgScore.toFixed(1)}</td>
                                    <td className="px-4 py-3 text-slate-500">{q.mainErrorFactors.join(', ')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// Step 8: Class Report
const ClassReport = () => {
    const { id } = useParams();
    const handlePrint = () => window.print();

    // Re-use logic for fetching data (simplified for brevity)
    const data = aiService.generateClassAnalysis(id || '');
    if(!data) return null;

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 md:shadow-lg min-h-screen print:shadow-none print:w-full">
            <div className="flex justify-between items-start mb-8 print:hidden">
                <Link to={`/exams/${id}/dashboard`} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600"><ArrowLeft size={16}/> 返回</Link>
                <Button onClick={handlePrint} icon={Printer}>打印 / 另存为PDF</Button>
            </div>

            <div className="text-center mb-8 border-b-2 border-indigo-600 pb-4">
                <h1 className="text-3xl font-bold text-slate-900">班级学情分析报告</h1>
                <p className="text-slate-500 mt-2">奥数测评 • 奥数A班 • 王老师</p>
            </div>

            <div className="space-y-8">
                <section>
                    <h3 className="text-xl font-bold text-indigo-900 mb-4 border-l-4 border-indigo-500 pl-3">1. 整体考试概况</h3>
                    <div className="grid grid-cols-3 gap-4 text-center mb-6">
                        <div className="p-4 bg-slate-50 rounded">
                            <div className="text-3xl font-bold text-indigo-600">{data.averageScore}</div>
                            <div className="text-sm text-slate-500">平均分</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded">
                             <div className="text-3xl font-bold text-green-600">{data.maxScore}</div>
                             <div className="text-sm text-slate-500">最高分</div>
                        </div>
                        <div className="p-4 bg-slate-50 rounded">
                             <div className="text-3xl font-bold text-slate-700">{data.totalStudents}</div>
                             <div className="text-sm text-slate-500">考试人数</div>
                        </div>
                    </div>
                </section>

                <section className="page-break">
                    <h3 className="text-xl font-bold text-indigo-900 mb-4 border-l-4 border-indigo-500 pl-3">2. 知识点掌握分析</h3>
                    <div className="space-y-4">
                        {data.knowledgePointStats.map((k, i) => (
                             <div key={i} className="flex items-center gap-4">
                                 <span className="w-32 font-medium text-sm text-slate-700">{k.point}</span>
                                 <div className="flex-1 bg-slate-100 rounded-full h-3">
                                     <div className={`h-3 rounded-full ${k.accuracy > 0.8 ? 'bg-green-500' : (k.accuracy > 0.6 ? 'bg-yellow-400' : 'bg-red-400')}`} style={{ width: `${k.accuracy * 100}%` }}></div>
                                 </div>
                                 <span className="w-12 text-sm font-bold">{Math.round(k.accuracy * 100)}%</span>
                             </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold text-indigo-900 mb-4 border-l-4 border-indigo-500 pl-3">3. 核心结论与教学建议</h3>
                    <div className="bg-blue-50 p-6 rounded-lg text-slate-700 text-sm leading-relaxed space-y-2">
                        <p><strong>• 基础巩固：</strong> 学生在“{data.knowledgePointStats.sort((a,b) => a.accuracy - b.accuracy)[0]?.point}”知识点上表现较弱，建议下周进行针对性复习。</p>
                        <p><strong>• 计算准确率：</strong> 有 {data.questionStats.filter(q => q.mainErrorFactors.includes('计算错误')).length} 道题目出现了高频计算错误。建议每日增加5分钟速算训练。</p>
                        <p><strong>• 培优补差：</strong> {data.scoreDistribution[0].count} 名学生处于待提高区间（60分以下）。建议对几何概念进行单独辅导。</p>
                    </div>
                </section>
            </div>
        </div>
    );
};

const StudentReport = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const students = storageService.getStudents();
    const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.id || '');

    const submission = storageService.getSubmissions(id || '').find(s => s.studentId === selectedStudentId);
    
    // NOTE: Removed early return to ensure Layout (Back button) is always rendered
    const student = students.find(s => s.id === selectedStudentId);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4 print:hidden">
                 <Link to={`/exams/${id}/dashboard`}><Button variant="secondary" icon={ArrowLeft}>返回</Button></Link>
                 <select className="p-2 border rounded" value={selectedStudentId} onChange={e => setSelectedStudentId(e.target.value)}>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                 </select>
                 {submission && <Button onClick={() => window.print()} icon={Printer}>打印 / 另存为PDF</Button>}
            </div>

            {!submission ? (
                 <div className="bg-white p-12 rounded-xl shadow-sm text-center border border-slate-200">
                    <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">暂无该学生的考情报告</h3>
                    <p className="text-slate-500 mb-6">该学生（{student?.name || '未知'}）尚未上传试卷或试卷未阅。</p>
                    <Link to={`/exams/${id}/upload`}>
                        <Button icon={Upload}>去上传/补录试卷</Button>
                    </Link>
                 </div>
            ) : (
                <div className="bg-white p-8 max-w-4xl mx-auto shadow-sm border border-slate-200 print:shadow-none print:w-full" id="student-report-print">
                    <div className="flex justify-between border-b pb-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">学生个人考情分析</h1>
                            <p className="text-slate-500">姓名: <span className="font-semibold text-slate-800">{student?.name}</span></p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-bold text-indigo-600">{submission.totalScore}</div>
                            <div className="text-sm text-slate-400">总分</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h3 className="font-bold text-slate-800 mb-3">表现摘要</h3>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex justify-between"><span>预估排名:</span> <span className="font-semibold">前 20%</span></li>
                                <li className="flex justify-between"><span>答对题数:</span> <span className="font-semibold">{submission.results.filter(r => r.isCorrect).length} / {submission.results.length}</span></li>
                                <li className="flex justify-between"><span>正确率:</span> <span className="font-semibold">{Math.round((submission.results.filter(r => r.isCorrect).length / submission.results.length) * 100)}%</span></li>
                            </ul>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded text-sm text-slate-700">
                            <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2"><Brain size={16}/> 学习建议</h4>
                            <p>在几何图形题上表现优秀！但是在涉及行程和比例的应用题中容易失分。建议复习圆的面积公式，并注意审题细节。</p>
                        </div>
                    </div>

                    <h3 className="font-bold text-slate-800 mb-4">逐题详细分析</h3>
                    <div className="space-y-4">
                        {submission.results.map((r, i) => (
                            <div key={i} className="border rounded-lg p-4 flex gap-4">
                                <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-lg flex-shrink-0 ${r.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {i+1}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between mb-2">
                                        <span className="font-semibold text-slate-700">知识点: 几何图形</span>
                                        <span className="text-sm text-slate-500">得分: {r.score}</span>
                                    </div>
                                    {!r.isCorrect && (
                                        <div className="bg-red-50 text-red-700 text-sm p-2 rounded">
                                            <strong>错因分析:</strong> {r.errorAnalysis || "第二步计算出现偏差。"}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


// --- App Router ---

const App = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/exams" element={<ExamList />} />
          <Route path="/exams/new" element={<CreateExam />} />
          <Route path="/exams/:id/analysis" element={<StandardAnalysis />} />
          <Route path="/exams/:id/upload" element={<StudentUpload />} />
          <Route path="/exams/:id/grading" element={<Grading />} />
          <Route path="/exams/:id/dashboard" element={<ExamDashboard />} />
          <Route path="/exams/:id/report/class" element={<ClassReport />} />
          <Route path="/exams/:id/report/student" element={<StudentReport />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;