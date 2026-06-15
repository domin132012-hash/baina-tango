/* ===== EJU MODULE START ===== */
// EJU 真题试炼前端逻辑
// 依赖：index.html 中的 supabaseClient / switchView / toast / apiUrl / $

// =====================================================================
// A. 全局变量
// =====================================================================
var ejuPhase = '';          // '' | 'structure' | 'questionRead' | 'locate' | 'answer'
var ejuSeconds = 0;
var ejuPaused = false;
var ejuTimerInterval = null;
var ejuCurrentQ = null;     // 当前题目对象
var ejuPhaseStartTime = 0;  // 当前阶段开始时间戳
var ejuElapsed = {};        // { structure:20, questionRead:5, ... }
var ejuStructureType = '';
var ejuSummary = '';
var ejuQuestionType = '';
var ejuEvidence = '';
var ejuSelectedAnswer = '';
var ejuSubmitted = false;
var ejuCurrentSets = [];    // 可用年份/回数列表
var ejuCurrentList = [];    // 当前选集的题目列表
var ejuCurrentYear = 0;
var ejuCurrentSession = 0;
var ejuScannedData = null;  // 本地扫描卷数据：math1/math2/humanities/science
var ejuScannedDataPromise = null;
var ejuCurrentScanSubject = '';
var ejuCurrentScanSetId = '';
var ejuReadingSelectRenderToken = 0;
var ejuReadingListRenderToken = 0;
var ejuMathPaperPage = 3;
var ejuMathPaperAnswers = {};
var ejuRikaSubjectId = '';   // 当前理科科目 physics/chemistry/biology
var ejuRikaPage = 1;         // 当前科目内页索引（1-based）
var ejuRikaAnswers = {};     // 本套理科作答：{ '科目id:解答番号': 选项号 }
var ejuRikaGraded = false;   // 是否已採点

var EJU_PHASE_DURATIONS = { structure: 20, questionRead: 5, locate: 20, answer: 30 };
var EJU_STRUCTURE_TYPES = ['主张型', '说明型', '对比型', '事例型', '原因结果型', '其他'];
var EJU_QUESTION_TYPES = ['作者主张题', '理由题', '内容一致题', '指示词题', '空欄补充题', '细节定位题'];
var EJU_SCAN_CATEGORY_SUBJECT = { sogo: 'humanities', science: 'science' };
var EJU_SCAN_STATUS_LABEL = { pass: '已检查', needs_review: '需复核', fail: '有失败页' };
var EJU_SCAN_STATUS_CLASS = { pass: 'ok', needs_review: 'due', fail: 'due' };
var EJU_MATH_PAPER_PROTOTYPES = {
  'math2/2024-1': {
    title: '数学2 · 2024年第1回',
    pageCount: 8,
    firstQuestionPage: 1,
    pages: [2,4,6,7,8,10,12,13],
    imageBase: './assets/eju-media/math2/2024-1/page-',
    answerLabelsBySourcePage: {
      2: ['A','B','C','D','E','F','G','H','I','JK','LM','N'],
      4: ['O','PQ','R','S','T','UV','WX','YZ'],
      6: ['A','B','C','D','E','F','G'],
      7: ['H','I','J','K','L','M'],
      8: ['N','O','P','Q','R','S','T','U','V','W','X','Y'],
      10: ['A','B','C','D','E','F','G','H','IJ','K','L','M','N','O','PQ','RS','T','U','VW','X','Y'],
      12: ['A','B','C','D','EF','G','H'],
      13: ['IJ','K','L','M','N','O','P','Q','R']
    }
  },
  'math2/2021-1': {
    title: '数学2 · 2021年第1回',
    pageCount: 6,
    firstQuestionPage: 1,
    pages: [4,6,8,10,12,14],
    imageBase: './assets/eju-media/math2/2021-1/page-',
    answerLabelsBySourcePage: {
      4: ['A','BC','DE','F','G','H','I','JK'],
      6: ['L','M','N','O','P','QR','ST','UV','WX'],
      8: ['A','B','C','D','E','F','G','H','I','J','K','L','M'],
      10: ['N','O','P','Q','R','S','T','U','V','W','X','Y'],
      12: ['A','B','CD','EF','G','H','I','J','KL','M','NO','P','QR','ST','U','V','WX','Y'],
      14: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R']
    }
  },
  'math2/2018-1': {
    title: '数学2 · 2018年第1回',
    pageCount: 8,
    firstQuestionPage: 1,
    pages: [3,4,5,6,7,8,9,10],
    imageBase: './assets/eju-media/math2/2018-1/page-',
    answerLabelsBySourcePage: {
      3: ['A','B','C','D','E','F','G','H','I','JK','LM'],
      4: ['NOP','QR','ST','UVW','XY'],
      5: ['A','B','C','D','E','F','G','HI','JK','L'],
      6: ['M','N','O','P','Q','R','S','T','U','V','W','X'],
      7: [],
      8: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','QR','ST','U','V','W','XY'],
      9: ['A','B','C','D','E','F','G','H','I','J','K','L','MN'],
      10: ['O','P','Q','R','S','T','U']
    }
  },
  'math2/2018-2': {
    title: '数学2 · 2018年第2回',
    pageCount: 8,
    firstQuestionPage: 1,
    pages: [3,4,5,6,7,8,9,10],
    imageBase: './assets/eju-media/math2/2018-2/page-',
    answerLabelsBySourcePage: {
      3: ['A','B','C','D','E','F','G','H','I','J','K','LM'],
      4: ['N','OPQ','R','S','TU','VW','X','Y'],
      5: ['A','B','C','D','E','F','G','HI','J','K','L','M','N','O'],
      6: ['PQ','R','S','T','U','V','W','X','Y'],
      7: ['A','B','C','D','EF','G','H','I','J','K'],
      8: ['L','MN','OP','QR','S','T','U','V','W','X','Y'],
      9: ['A','B','C','D','E','F','G','H'],
      10: ['I','J','K','L']
    }
  },
  'math2/2019-1': {
    title: '数学2 · 2019年第1回',
    pageCount: 9,
    firstQuestionPage: 1,
    pages: [3,5,6,7,9,11,12,13,14],
    imageBase: './assets/eju-media/math2/2019-1/page-',
    answerLabelsBySourcePage: {
      3: ['A','B','C','D','E','F','G','H','I','J','K'],
      5: ['L','M','N','O','PQ','RS','TU','VW','X'],
      6: ['Y'],
      7: ['A','B','C','D','E','F','G','H','I','J','K','L'],
      9: ['M','N','O','P','Q','R','S','T','U','V','W','X','Y'],
      11: ['A','B','C','D','E','F','G','H','I','J','K','L','M'],
      12: ['N','O','P','Q','R','S'],
      13: ['A','B','C','D','E','F','G','H','I','J','K'],
      14: ['L','M','N','O','P','Q','R','S','T','U','V','W']
    }
  },
  'math2/2021-2': {
    title: '数学2 · 2021年第2回',
    pageCount: 8,
    firstQuestionPage: 1,
    pages: [4,6,8,9,10,12,13,14],
    imageBase: './assets/eju-media/math2/2021-2/page-',
    answerLabelsBySourcePage: {
      4: ['A','B','C','D','E','F','G','H','IJ','KLM'],
      6: ['NOP','QRS','TU','V','WXY'],
      8: ['A','B','C','D','E'],
      9: ['F','G','H','I','J','K','L','M'],
      10: ['N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
      12: ['A','B','C','D','E','F'],
      13: ['G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W'],
      14: ['A','B','C','DE','F','G','H','I','J','KL','M','N','O','P','Q','R','S','T','U']
    }
  },
  'math2/2022-1': {
    title: '数学2 · 2022年第1回',
    pageCount: 8,
    firstQuestionPage: 1,
    pages: [2,4,6,8,9,10,11,12],
    imageBase: './assets/eju-media/math2/2022-1/page-',
    answerLabelsBySourcePage: {
      2: ['A','B','C','D','E','F','GH','IJ','K','LM'],
      4: ['N','OP','QR','STU','V','WX','Y','Z'],
      6: ['A','BC','D','EF','G','H','I','J','K','L','M'],
      8: ['N','O','P'],
      9: ['Q','R','S','T','U','V','W','X','Y'],
      10: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N'],
      11: ['O','P','Q','R','S','T','U','V','W','X'],
      12: ['A','B','C','D','E','F','G','HI','J','K','L','M','N','OP','QR','S','TU','V','W','X']
    }
  },
  'math2/2022-2': {
    title: '数学2 · 2022年第2回',
    pageCount: 8,
    firstQuestionPage: 1,
    pages: [2,3,4,5,6,7,8,9],
    imageBase: './assets/eju-media/math2/2022-2/page-',
    answerLabelsBySourcePage: {
      2: ['A','B','C','D','E','F','G','H','I','J','K','L','M'],
      3: ['N','O','P','Q','R','S','T'],
      4: ['A','B','C','D','E'],
      5: ['F','G','H','I','J','K','L','M'],
      6: ['N','O','P','Q','R','S','T','U','V','W','X','YZ'],
      7: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','RS','T','U','V','W'],
      8: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O'],
      9: ['P','Q','R','S','T','U','VW','XYZ']
    }
  },
  'math2/2023-1': {
    title: '数学2 · 2023年第1回',
    pageCount: 10,
    firstQuestionPage: 1,
    pages: [3,5,7,8,9,10,11,12,13,14],
    imageBase: './assets/eju-media/math2/2023-1/page-',
    answerLabelsBySourcePage: {
      3: ['A','B','C','D','E','F','G','HI','J','K','L'],
      5: ['M','N','O','P','Q','R','S'],
      7: ['A','B','C','D','E','F','G','H','I','J','K'],
      8: ['L'],
      9: ['M','N','O','P','Q','RS'],
      10: ['T','U','V','W','X','Y'],
      11: ['A','BC','D','E','F','GH','I','J','K','LM','N','O','P','Q','R'],
      12: ['S','T','U','V','W','X'],
      13: ['A','B','CD','E','F','G','H','I','J','K','L','M','N','O','P','Q'],
      14: ['R','S','T','U','V','W']
    }
  },
  'math2/2023-2': {
    title: '数学2 · 2023年第2回',
    pageCount: 7,
    firstQuestionPage: 1,
    pages: [3,5,7,9,11,13,14],
    imageBase: './assets/eju-media/math2/2023-2/page-',
    answerLabelsBySourcePage: {
      3: ['A','B','C','D','E','F','G','H','I','J'],
      5: ['KL','M','NO','PQ','RS'],
      7: ['A','B','C','D','E','F','G','H','I','J','K','L','M'],
      9: ['N','O','P','Q','R','S','T','U','V','W','X'],
      11: ['AB','C','D','E','F','G','HI','J','K','LM','NO','PQ','RS','T','U','V','W','XY'],
      13: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q'],
      14: ['R','S','T','U','V','W']
    }
  },
  'math2/2025-1': {
    title: '数学2 · 2025年第1回',
    pageCount: 9,
    firstQuestionPage: 1,
    pages: [2,3,4,5,6,7,8,9,10],
    imageBase: './assets/eju-media/math2/2025-1/page-',
    answerLabelsBySourcePage: {
      2: ['A','B','C','D','E'],
      3: ['F','G','H','I','JKL'],
      4: ['M','NO','P','Q','RS','T','UV','W','XY'],
      5: ['A','B','C','D','E','F','G','H','I','J','K','L','M'],
      6: ['N','O','P','Q','R','S','T','U','V','W','X'],
      7: ['A','B','C','D','E','F','G','H','I','J','K'],
      8: ['L','M','N','O','P','Q','R','S','T','U','VW','X'],
      9: ['A','B','C','D','E','F','G','H','I','J'],
      10: ['K','L','MN','O','PQ','R','S','T','U','V','W']
    }
  },
  'math2/2020-2': {
    title: '数学2 · 2020年第2回',
    pageCount: 8,
    firstQuestionPage: 1,
    pages: [3,5,7,8,9,11,13,14],
    imageBase: './assets/eju-media/math2/2020-2/page-',
    answerLabelsBySourcePage: {
      3: ['A','B','C','D','E','FG','H','I','J','K','LM','N','O'],
      5: ['P','QR','ST','U','VW','XY'],
      7: ['A','B','C'],
      8: ['D','EF','G','H','I','J','K','L'],
      9: ['MN','O','P','Q','R','S','T','U','V','W','XY'],
      11: ['A','B','C','DE','F','G','H','I','J','K','L','M','N','OP','Q','R','ST','U','V','W'],
      13: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T'],
      14: ['UV','W']
    }
  },
  'math1/2018-1': {
    title: '数学1 · 2018年第1回',
    pageCount: 6,
    firstQuestionPage: 1,
    pages: [3,4,5,6,7,8],
    imageBase: './assets/eju-media/math1/2018-1/page-',
    answerLabelsBySourcePage: {
      3: ['A','B','C','D','E','F','G','H','I','JK','LM'],
      4: ['NOP','QR','ST','UVW','XY'],
      5: ['AB','C','D','E','F','G','H','I','J','K','L'],
      6: ['MN','OP','Q','R','S','TU','V','WX'],
      7: ['AB','CD','E','F','G','HI','J','K','L','MN','OP','QR','ST'],
      8: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','RS','T']
    }
  },
  'math1/2018-2': {
    title: '数学1 · 2018年第2回',
    pageCount: 7,
    firstQuestionPage: 1,
    pages: [3,4,5,6,7,8,9],
    imageBase: './assets/eju-media/math1/2018-2/page-',
    answerLabelsBySourcePage: {
      3: ['A','B','C','D','E','F','G','H','I','J','K','LM'],
      4: ['N','OPQ','R','S','TU','VW','X','Y'],
      5: ['A','B','C','D','E','F','GH','IJ','KL','M'],
      6: ['N','O','P','Q','R','S','T','U','V','W'],
      7: ['A','B','C','D','E','FG','H','I','JKL','MN','O','P','Q','R','ST'],
      8: ['A','B','C','D','E','F','G','H','I','J'],
      9: ['K','L','M','N','O','P','Q','R','S','T','U','V','W','X','YZ']
    }
  },
  'math1/2019-1': {
    title: '数学1 · 2019年第1回',
    pageCount: 7,
    firstQuestionPage: 1,
    pages: [4,6,7,8,10,12,14],
    imageBase: './assets/eju-media/math1/2019-1/page-',
    answerLabelsBySourcePage: {
      4: ['A','B','C','D','E','F','G','H','I','J','K'],
      6: ['L','M','N','O','PQ','RS','TU','VW','X'],
      7: ['Y'],
      8: ['A','BC','D','E','F','G','H','I','J'],
      10: ['K','L','M','N','O','P','Q','R','S','T','U','V'],
      12: ['A','B','CD','EFG','HIJ','KL','MN','O','P','Q','R','S'],
      14: ['A','BC','D','E','F','GH','I','J','K','L','M','NO','P','Q','R','ST','U','V','W']
    }
  },
  'math1/2021-1': {
    title: '数学1 · 2021年第1回',
    pageCount: 6,
    firstQuestionPage: 1,
    pages: [3,4,5,6,7,8],
    imageBase: './assets/eju-media/math1/2021-1/page-',
    answerLabelsBySourcePage: {
      3: ['A','BC','DE','F','G','H','I','JK'],
      4: ['L','M','N','O','P','QR','ST','UV','WX'],
      5: ['A','B','CD','E','F','G','H','I','J','K','L','M'],
      6: ['N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
      7: ['A','B','C','D','E','F','GH','I','JK','L','M','NO','P','Q','R','STU','VWXY'],
      8: ['A','B','C','DE','F','G','H','I','J','KL','MN','O','P','Q','R','S','T']
    }
  },
  'math1/2020-2': {
    title: '数学1 · 2020年第2回',
    pageCount: 6,
    firstQuestionPage: 1,
    pages: [4,6,8,10,12,14],
    imageBase: './assets/eju-media/math1/2020-2/page-',
    answerLabelsBySourcePage: {
      4: ['A','B','C','D','E','FG','H','I','J','K','LM','N','O'],
      6: ['P','QR','ST','U','VW','XY'],
      8: ['A','B','C','D','E','F','G','H','IJ','K','L'],
      10: ['M','N','O','P','Q','R','S','T','U','V','W'],
      12: ['A','BC','D','E','FG','H','I','J','K','L','M','N','O','P','Q','RS','T','U','VW','XY'],
      14: ['AB','C','DEF','G','H','IJK','L','M','N','OP','QR','ST','UV','WXY']
    }
  },
  'math1/2021-2': {
    title: '数学1 · 2021年第2回',
    pageCount: 7,
    firstQuestionPage: 1,
    pages: [4,6,8,10,11,12,14],
    imageBase: './assets/eju-media/math1/2021-2/page-',
    answerLabelsBySourcePage: {
      4: ['A','B','C','D','E','F','G','H','IJ','KLM'],
      6: ['NOP','QRS','TU','V','WXY'],
      8: ['A','B','C','DE','FG','HI','JKL'],
      10: ['MN','O','P','Q','R','S'],
      11: ['T','U','V','W'],
      12: ['A','B','C','D','EF','G','H','IJ','K','LMN','O','P','QR','ST','UVW'],
      14: ['A','BC','D','E','FG','HI','J','K','L','M','N','O','P','Q','R','S','T','U','V','W']
    }
  },
  'math1/2022-1': {
    title: '数学1 · 2022年第1回',
    pageCount: 8,
    firstQuestionPage: 1,
    pages: [3,5,7,9,11,12,13,14],
    imageBase: './assets/eju-media/math1/2022-1/page-',
    answerLabelsBySourcePage: {
      3: ['A','B','C','D','E','F','GH','IJ','K','LM'],
      5: ['N','OP','QR','STU','V','WX','Y','Z'],
      7: ['A','B','C','D','E','FG','H','IJ','K','L'],
      9: ['M','N','O','P','Q','R','S','T','U','V','W','X','Y'],
      11: ['A','B','C','D','E','F','G','H','I','J','K','L'],
      12: ['M','N','O','P','Q','RS','T','U'],
      13: ['AB','C','D','E'],
      14: ['F','G','H','I','J','KL','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
    }
  },
  'math1/2022-2': {
    title: '数学1 · 2022年第2回',
    pageCount: 7,
    firstQuestionPage: 1,
    pages: [3,4,5,6,7,8,9],
    imageBase: './assets/eju-media/math1/2022-2/page-',
    answerLabelsBySourcePage: {
      3: ['A','B','C','D','E','F','G','H','I','J','K','L','M'],
      4: ['N','O','P','Q','R','S','T'],
      5: ['A','B','C','D','E','FG','HI','J','KL','MN'],
      6: ['O','P','Q','R','S','T','U','V','W','X','Y','Z'],
      7: ['AB','C','DE','F','G','HI','JK','LM','NO','PQ'],
      8: ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','PQ'],
      9: ['R','S','T','U','V','WX','Y']
    }
  },
  'math1/2023-1': {
    title: '数学1 · 2023年第1回',
    pageCount: 7,
    firstQuestionPage: 1,
    pages: [4,6,8,10,11,12,14],
    imageBase: './assets/eju-media/math1/2023-1/page-',
    answerLabelsBySourcePage: {
      4: ['A','B','C','D','E','F','G','HI','J','K','L'],
      6: ['M','N','O','P','Q','R','S'],
      8: ['A','B','C','D','E','F','G','H','I','J','K','L'],
      10: ['M','N','O'],
      11: ['P','Q','R','S','T','U','V','W','X','Y'],
      12: ['ABC','DEF','GHI','JKL','MNO','PQR','STU'],
      14: ['A','B','CD','EFG','HI','JK','L','M','N','O','P']
    }
  },
  'math1/2023-2': {
    title: '数学1 · 2023年第2回',
    pageCount: 7,
    firstQuestionPage: 1,
    pages: [3,5,7,9,10,11,13],
    imageBase: './assets/eju-media/math1/2023-2/page-',
    answerLabelsBySourcePage: {
      3: ['A','B','C','D','E','F','G','H','I','J'],
      5: ['KL','M','NO','PQ','RS'],
      7: ['ABC','D','EF','GH','I','JK'],
      9: ['L','M','N','O','P','Q'],
      10: ['RS','T','U','VW','X','Y'],
      11: ['A','B','C','D','E','F','G','HI','J','KLM','N','OP','Q','R','S','T','UV','W','X'],
      13: ['AB','C','D','E','F','G','H','I','JK','L','M','N','O','P','Q','R','S']
    }
  },
  'math1/2024-1': {
    title: '数学1 · 2024年第1回',
    pageCount: 7,
    firstQuestionPage: 1,
    pages: [4,6,8,10,12,14,15],
    imageBase: './assets/eju-media/math1/2024-1/page-',
    answerLabelsBySourcePage: {
      4: ['A','B','C','D','E','F','G','H','I','JK','LM','N'],
      6: ['O','PQ','R','S','T','UV','WX','YZ'],
      8: ['A','B','C','D','E','F','G','H','IJ','K','L','M'],
      10: ['N','O','P','QR','S','T','U','V','W'],
      12: ['A','B','C','D','E','F','G','H','I','J','K','LMN','OP','QRS','T','UVW'],
      14: ['A','B','CD','E','F','G','H','I','J','K','L','M','N'],
      15: ['O','P','Q','R','S']
    }
  },
  'math1/2025-1': {
    title: '数学1 · 2025年第1回',
    pageCount: 7,
    firstQuestionPage: 1,
    pages: [3,4,5,6,7,8,9],
    imageBase: './assets/eju-media/math1/2025-1/page-',
    answerLabelsBySourcePage: {
      3: ['A','B','C','D','EF','GH','IJ','K','L','M'],
      4: ['N','O','P','Q','R','S','T','UV','W','XY'],
      5: ['A','B','C','D','E','F','G','H','I','J','K','L','M'],
      6: ['N','O','P','Q','R','S','T','U','V'],
      7: ['W','X','Y','Z'],
      8: ['A','BC','DEF','G','H','I','JK','L','M','N','O','P','Q','RS','TU','VW','XY'],
      9: ['AB','C','D','E','F','G','H','I','J','KL','M','NO','PQ','RS','T','U','V','WX','YZ']
    }
  }
};

// =====================================================================
// 理科真题（マークシート单选）原型：每题 {no:解答番号, page:源页理科-N, opts:选项数, ans:官方正解}
// 源图 page-NNN.png（NNN=理科-N）。答案取自官方正解表。
// =====================================================================
var EJU_RIKA_PROTOTYPES = {
  'science/2023-1': {
    title: '理科 · 2023年第1回',
    imageBase: './assets/eju-media/science/2023-1/page-',
    subjects: [
      { id: 'physics', label: '物理',
        pages: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
        questions: [
          {no:1,page:2,opts:5,ans:2}, {no:2,page:3,opts:6,ans:5}, {no:3,page:4,opts:4,ans:3},
          {no:4,page:5,opts:5,ans:4}, {no:5,page:6,opts:5,ans:4}, {no:6,page:7,opts:6,ans:4},
          {no:7,page:8,opts:6,ans:1}, {no:8,page:9,opts:5,ans:3}, {no:9,page:10,opts:6,ans:2},
          {no:10,page:11,opts:6,ans:4}, {no:11,page:12,opts:4,ans:2}, {no:12,page:13,opts:5,ans:5},
          {no:13,page:14,opts:8,ans:1}, {no:14,page:15,opts:6,ans:6}, {no:15,page:16,opts:8,ans:6},
          {no:16,page:17,opts:6,ans:2}, {no:17,page:18,opts:8,ans:1}, {no:18,page:19,opts:6,ans:4},
          {no:19,page:20,opts:4,ans:1}
        ] },
      { id: 'chemistry', label: '化学',
        refPage: 23, refLabel: '常数表 · 周期表',
        pages: [24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41],
        questions: [
          {no:1,page:24,opts:6,ans:5}, {no:2,page:25,opts:7,ans:4}, {no:3,page:26,opts:6,ans:6},
          {no:4,page:27,opts:6,ans:6}, {no:5,page:28,opts:6,ans:2}, {no:6,page:29,opts:4,ans:4},
          {no:7,page:30,opts:6,ans:3}, {no:8,page:31,opts:6,ans:5}, {no:9,page:32,opts:6,ans:2},
          {no:10,page:33,opts:6,ans:3}, {no:11,page:34,opts:6,ans:5}, {no:12,page:34,opts:6,ans:1},
          {no:13,page:35,opts:5,ans:1}, {no:14,page:35,opts:5,ans:3}, {no:15,page:36,opts:6,ans:6},
          {no:16,page:37,opts:5,ans:3}, {no:17,page:38,opts:6,ans:1}, {no:18,page:39,opts:6,ans:5},
          {no:19,page:40,opts:6,ans:3}, {no:20,page:41,opts:6,ans:4}
        ],
        problems: [
          {page:24,answers:[1]}, {page:25,answers:[2]}, {page:26,answers:[3]}, {page:27,answers:[4]},
          {page:28,answers:[5]}, {page:29,answers:[6]}, {page:30,answers:[7]}, {page:31,answers:[8]},
          {page:32,answers:[9]}, {page:33,answers:[10]}, {page:34,image:'034-q11',answers:[11]},
          {page:34,image:'034-q12',answers:[12]}, {page:35,image:'035-q13',answers:[13]},
          {page:35,image:'035-q14',answers:[14]}, {page:36,answers:[15]}, {page:37,answers:[16]},
          {page:38,answers:[17]}, {page:39,answers:[18]}, {page:40,answers:[19]}, {page:41,answers:[20]}
        ] },
      { id: 'biology', label: '生物',
        pages: [43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58],
        questions: [
          {no:1,page:43,opts:6,ans:3}, {no:2,page:44,opts:6,ans:3}, {no:3,page:44,opts:6,ans:3},
          {no:4,page:45,opts:6,ans:5}, {no:5,page:45,opts:6,ans:5}, {no:6,page:46,opts:6,ans:5},
          {no:7,page:47,opts:4,ans:3}, {no:8,page:48,opts:6,ans:4}, {no:9,page:49,opts:5,ans:4},
          {no:10,page:50,opts:6,ans:6}, {no:11,page:51,opts:8,ans:3}, {no:12,page:52,opts:8,ans:2},
          {no:13,page:53,opts:6,ans:4}, {no:14,page:54,opts:6,ans:6}, {no:15,page:55,opts:5,ans:4},
          {no:16,page:56,opts:6,ans:1}, {no:17,page:57,opts:5,ans:5}, {no:18,page:58,opts:4,ans:1}
        ],
        problems: [
          {page:43,answers:[1]}, {page:44,answers:[2,3]}, {page:45,image:'045-q3',answers:[4]},
          {page:45,image:'045-q4',answers:[5]}, {page:46,answers:[6]}, {page:47,answers:[7]},
          {page:48,answers:[8]}, {page:49,answers:[9]}, {page:50,answers:[10]}, {page:51,answers:[11]},
          {page:52,answers:[12]}, {page:53,answers:[13]}, {page:54,answers:[14]}, {page:55,answers:[15]},
          {page:56,answers:[16]}, {page:57,answers:[17]}, {page:58,answers:[18]}
        ] }
    ]
  },
  'science/2023-2': {
    title: '理科 · 2023年第2回',
    imageBase: './assets/eju-media/science/2023-2/page-',
    subjects: [
      { id: 'physics', label: '物理',
        pages: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
        questions: [
          {no:1,page:3,opts:6,ans:4}, {no:2,page:4,opts:6,ans:2}, {no:3,page:5,opts:6,ans:4},
          {no:4,page:6,opts:6,ans:5}, {no:5,page:7,opts:6,ans:2}, {no:6,page:8,opts:6,ans:6},
          {no:7,page:9,opts:6,ans:5}, {no:8,page:10,opts:6,ans:3}, {no:9,page:11,opts:6,ans:4},
          {no:10,page:12,opts:6,ans:3}, {no:11,page:13,opts:6,ans:4}, {no:12,page:14,opts:7,ans:7},
          {no:13,page:15,opts:6,ans:5}, {no:14,page:16,opts:6,ans:1}, {no:15,page:17,opts:6,ans:5},
          {no:16,page:18,opts:8,ans:8}, {no:17,page:19,opts:6,ans:3}, {no:18,page:20,opts:6,ans:2},
          {no:19,page:21,opts:6,ans:3}
        ] },
      { id: 'chemistry', label: '化学',
        refPage: 24, refLabel: '常数表 · 周期表',
        pages: [25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40],
        questions: [
          {no:1,page:25,opts:6,ans:4}, {no:2,page:25,opts:6,ans:4}, {no:3,page:26,opts:6,ans:1},
          {no:4,page:26,opts:6,ans:5}, {no:5,page:27,opts:6,ans:2}, {no:6,page:28,opts:6,ans:5},
          {no:7,page:29,opts:6,ans:3}, {no:8,page:30,opts:6,ans:5}, {no:9,page:31,opts:6,ans:2},
          {no:10,page:32,opts:6,ans:4}, {no:11,page:33,opts:6,ans:4}, {no:12,page:33,opts:6,ans:2},
          {no:13,page:34,opts:6,ans:1}, {no:14,page:34,opts:6,ans:1}, {no:15,page:35,opts:6,ans:2},
          {no:16,page:36,opts:6,ans:1}, {no:17,page:37,opts:6,ans:3}, {no:18,page:38,opts:6,ans:2},
          {no:19,page:39,opts:6,ans:5}, {no:20,page:40,opts:6,ans:3}
        ],
        problems: [
          {page:25,answers:[1,2]}, {page:26,answers:[3,4]}, {page:27,answers:[5]}, {page:28,answers:[6]},
          {page:29,answers:[7]}, {page:30,answers:[8]}, {page:31,answers:[9]}, {page:32,answers:[10]},
          {page:33,answers:[11,12]}, {page:34,answers:[13,14]}, {page:35,answers:[15]}, {page:36,answers:[16]},
          {page:37,answers:[17]}, {page:38,answers:[18]}, {page:39,answers:[19]}, {page:40,answers:[20]}
        ] },
      { id: 'biology', label: '生物',
        pages: [42,43,44,45,46,47,48,49,50,51,52,53,54,55],
        questions: [
          {no:1,page:42,opts:6,ans:4}, {no:2,page:43,opts:6,ans:2}, {no:3,page:44,opts:6,ans:5},
          {no:4,page:44,opts:6,ans:3}, {no:5,page:45,opts:6,ans:2}, {no:6,page:46,opts:6,ans:3},
          {no:7,page:47,opts:6,ans:3}, {no:8,page:48,opts:6,ans:2}, {no:9,page:49,opts:6,ans:5},
          {no:10,page:50,opts:6,ans:5}, {no:11,page:51,opts:6,ans:3}, {no:12,page:52,opts:6,ans:3},
          {no:13,page:53,opts:6,ans:1}, {no:14,page:53,opts:6,ans:4}, {no:15,page:54,opts:6,ans:6},
          {no:16,page:55,opts:6,ans:2}, {no:17,page:55,opts:6,ans:2}, {no:18,page:55,opts:6,ans:3}
        ],
        problems: [
          {page:42,answers:[1]}, {page:43,answers:[2]}, {page:44,answers:[3,4]}, {page:45,answers:[5]},
          {page:46,answers:[6]}, {page:47,answers:[7]}, {page:48,answers:[8]}, {page:49,answers:[9]},
          {page:50,answers:[10]}, {page:51,answers:[11]}, {page:52,answers:[12]}, {page:53,answers:[13,14]},
          {page:54,answers:[15]}, {page:55,answers:[16,17,18]}
        ] }
    ]
  },
  'science/2022-1': {
    title: '理科 · 2022年第1回',
    imageBase: './assets/eju-media/science/2022-1/page-',
    subjects: [
      { id: 'physics', label: '物理',
        pages: [3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20,21,22],
        questions: [
          {no:1,page:3,opts:6,ans:2}, {no:2,page:4,opts:7,ans:7}, {no:3,page:5,opts:6,ans:2},
          {no:4,page:6,opts:6,ans:4}, {no:5,page:7,opts:6,ans:3}, {no:6,page:8,opts:6,ans:2},
          {no:7,page:9,opts:6,ans:5}, {no:8,page:10,opts:6,ans:3}, {no:9,page:11,opts:8,ans:6},
          {no:10,page:13,opts:6,ans:6}, {no:11,page:14,opts:6,ans:3}, {no:12,page:15,opts:6,ans:5},
          {no:13,page:16,opts:8,ans:8}, {no:14,page:17,opts:6,ans:2}, {no:15,page:18,opts:6,ans:3},
          {no:16,page:19,opts:8,ans:8}, {no:17,page:20,opts:6,ans:1}, {no:18,page:21,opts:6,ans:5},
          {no:19,page:22,opts:6,ans:5}
        ] },
      { id: 'chemistry', label: '化学',
        refPage: 24, refLabel: '常数表 · 周期表',
        pages: [25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40],
        questions: [
          {no:1,page:25,opts:6,ans:6}, {no:2,page:25,opts:6,ans:4}, {no:3,page:26,opts:6,ans:3},
          {no:4,page:27,opts:6,ans:1}, {no:5,page:28,opts:6,ans:5}, {no:6,page:29,opts:6,ans:2},
          {no:7,page:30,opts:6,ans:4}, {no:8,page:31,opts:6,ans:4}, {no:9,page:32,opts:6,ans:5},
          {no:10,page:33,opts:6,ans:4}, {no:11,page:34,opts:6,ans:5}, {no:12,page:34,opts:6,ans:1},
          {no:13,page:35,opts:6,ans:1}, {no:14,page:35,opts:6,ans:2}, {no:15,page:36,opts:6,ans:5},
          {no:16,page:36,opts:6,ans:3}, {no:17,page:37,opts:6,ans:2}, {no:18,page:38,opts:6,ans:2},
          {no:19,page:39,opts:6,ans:4}, {no:20,page:40,opts:6,ans:3}
        ],
        problems: [
          {page:25,answers:[1,2]}, {page:26,answers:[3]}, {page:27,answers:[4]}, {page:28,answers:[5]},
          {page:29,answers:[6]}, {page:30,answers:[7]}, {page:31,answers:[8]}, {page:32,answers:[9]},
          {page:33,answers:[10]}, {page:34,answers:[11,12]}, {page:35,answers:[13,14]}, {page:36,answers:[15,16]},
          {page:37,answers:[17]}, {page:38,answers:[18]}, {page:39,answers:[19]}, {page:40,answers:[20]}
        ] },
      { id: 'biology', label: '生物',
        pages: [42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58],
        questions: [
          {no:1,page:42,opts:6,ans:2}, {no:2,page:43,opts:6,ans:1}, {no:3,page:44,opts:6,ans:4},
          {no:4,page:45,opts:8,ans:8}, {no:5,page:46,opts:6,ans:2}, {no:6,page:47,opts:6,ans:2},
          {no:7,page:48,opts:6,ans:4}, {no:8,page:49,opts:6,ans:4}, {no:9,page:50,opts:6,ans:2},
          {no:10,page:51,opts:6,ans:5}, {no:11,page:51,opts:6,ans:4}, {no:12,page:52,opts:6,ans:3},
          {no:13,page:53,opts:6,ans:2}, {no:14,page:54,opts:6,ans:5}, {no:15,page:55,opts:6,ans:1},
          {no:16,page:56,opts:6,ans:2}, {no:17,page:57,opts:6,ans:4}, {no:18,page:58,opts:6,ans:3}
        ],
        problems: [
          {page:42,answers:[1]}, {page:43,answers:[2]}, {page:44,answers:[3]}, {page:45,answers:[4]},
          {page:46,answers:[5]}, {page:47,answers:[6]}, {page:48,answers:[7]}, {page:49,answers:[8]},
          {page:50,answers:[9]}, {page:51,answers:[10,11]}, {page:52,answers:[12]}, {page:53,answers:[13]},
          {page:54,answers:[14]}, {page:55,answers:[15]}, {page:56,answers:[16]}, {page:57,answers:[17]},
          {page:58,answers:[18]}
        ] }
    ]
  },
  'science/2022-2': {
    title: '理科 · 2022年第2回',
    imageBase: './assets/eju-media/science/2022-2/page-',
    subjects: [
      { id: 'physics', label: '物理',
        pages: [3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21],
        questions: [
          {no:1,page:3,opts:6,ans:3}, {no:2,page:4,opts:6,ans:3}, {no:3,page:5,opts:6,ans:4},
          {no:4,page:6,opts:6,ans:2}, {no:5,page:7,opts:6,ans:4}, {no:6,page:8,opts:6,ans:5},
          {no:7,page:9,opts:6,ans:3}, {no:8,page:10,opts:6,ans:1}, {no:9,page:11,opts:6,ans:4},
          {no:10,page:12,opts:6,ans:2}, {no:11,page:13,opts:6,ans:1}, {no:12,page:14,opts:6,ans:4},
          {no:13,page:15,opts:8,ans:8}, {no:14,page:16,opts:6,ans:5}, {no:15,page:17,opts:6,ans:2},
          {no:16,page:18,opts:6,ans:1}, {no:17,page:19,opts:6,ans:1}, {no:18,page:20,opts:6,ans:6},
          {no:19,page:21,opts:6,ans:5}
        ] },
      { id: 'chemistry', label: '化学',
        refPage: 23, refLabel: '常数表 · 周期表',
        pages: [24,25,26,27,28,29,30,31,32,33,34,35,36,37],
        questions: [
          {no:1,page:24,opts:6,ans:4}, {no:2,page:24,opts:6,ans:2}, {no:3,page:25,opts:6,ans:6},
          {no:4,page:26,opts:6,ans:3}, {no:5,page:27,opts:6,ans:3}, {no:6,page:27,opts:6,ans:2},
          {no:7,page:28,opts:6,ans:3}, {no:8,page:29,opts:6,ans:2}, {no:9,page:30,opts:6,ans:1},
          {no:10,page:31,opts:6,ans:4}, {no:11,page:32,opts:6,ans:1}, {no:12,page:32,opts:6,ans:3},
          {no:13,page:33,opts:6,ans:2}, {no:14,page:33,opts:6,ans:5}, {no:15,page:34,opts:6,ans:4},
          {no:16,page:34,opts:6,ans:3}, {no:17,page:35,opts:6,ans:3}, {no:18,page:36,opts:6,ans:1},
          {no:19,page:36,opts:6,ans:2}, {no:20,page:37,opts:6,ans:4}
        ],
        problems: [
          {page:24,answers:[1,2]}, {page:25,answers:[3]}, {page:26,answers:[4]}, {page:27,answers:[5,6]},
          {page:28,answers:[7]}, {page:29,answers:[8]}, {page:30,answers:[9]}, {page:31,answers:[10]},
          {page:32,answers:[11,12]}, {page:33,answers:[13,14]}, {page:34,answers:[15,16]}, {page:35,answers:[17]},
          {page:36,answers:[18,19]}, {page:37,answers:[20]}
        ] },
      { id: 'biology', label: '生物',
        pages: [39,40,41,42,43,44,45,46,47,48,49,50,51],
        questions: [
          {no:1,page:39,opts:6,ans:4}, {no:2,page:40,opts:6,ans:2}, {no:3,page:41,opts:6,ans:4},
          {no:4,page:42,opts:6,ans:6}, {no:5,page:42,opts:6,ans:1}, {no:6,page:43,opts:6,ans:4},
          {no:7,page:44,opts:6,ans:2}, {no:8,page:45,opts:6,ans:3}, {no:9,page:45,opts:6,ans:2},
          {no:10,page:46,opts:6,ans:3}, {no:11,page:47,opts:6,ans:3}, {no:12,page:48,opts:6,ans:6},
          {no:13,page:48,opts:6,ans:2}, {no:14,page:49,opts:6,ans:3}, {no:15,page:50,opts:6,ans:4},
          {no:16,page:51,opts:6,ans:1}, {no:17,page:51,opts:6,ans:5}, {no:18,page:51,opts:6,ans:4}
        ],
        problems: [
          {page:39,answers:[1]}, {page:40,answers:[2]}, {page:41,answers:[3]}, {page:42,answers:[4,5]},
          {page:43,answers:[6]}, {page:44,answers:[7]}, {page:45,answers:[8,9]}, {page:46,answers:[10]},
          {page:47,answers:[11]}, {page:48,answers:[12,13]}, {page:49,answers:[14]}, {page:50,answers:[15]},
          {page:51,answers:[16,17,18]}
        ] }
    ]
  },
  'science/2021-1': {
    title: '理科 · 2021年第1回',
    imageBase: './assets/eju-media/science/2021-1/page-',
    subjects: [
      { id: 'physics', label: '物理',
        pages: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],
        questions: [
          {no:1,page:4,opts:6,ans:2}, {no:2,page:5,opts:6,ans:4}, {no:3,page:6,opts:6,ans:2},
          {no:4,page:7,opts:6,ans:3}, {no:5,page:8,opts:6,ans:6}, {no:6,page:9,opts:6,ans:2},
          {no:7,page:10,opts:6,ans:2}, {no:8,page:11,opts:6,ans:1}, {no:9,page:12,opts:6,ans:1},
          {no:10,page:13,opts:6,ans:3}, {no:11,page:14,opts:6,ans:6}, {no:12,page:15,opts:6,ans:4},
          {no:13,page:16,opts:6,ans:6}, {no:14,page:17,opts:6,ans:3}, {no:15,page:18,opts:6,ans:5},
          {no:16,page:19,opts:6,ans:4}, {no:17,page:20,opts:6,ans:3}, {no:18,page:21,opts:6,ans:2},
          {no:19,page:22,opts:6,ans:3}
        ] },
      { id: 'chemistry', label: '化学',
        refPage: 24, refLabel: '常数表 · 周期表',
        pages: [25,26,27,28,29,30,31,32,33,34,35,36,37,38],
        questions: [
          {no:1,page:25,opts:6,ans:3}, {no:2,page:25,opts:6,ans:5}, {no:3,page:26,opts:6,ans:4},
          {no:4,page:26,opts:6,ans:6}, {no:5,page:27,opts:6,ans:3}, {no:6,page:28,opts:6,ans:1},
          {no:7,page:29,opts:6,ans:2}, {no:8,page:30,opts:6,ans:2}, {no:9,page:31,opts:6,ans:3},
          {no:10,page:32,opts:6,ans:3}, {no:11,page:32,opts:6,ans:1}, {no:12,page:33,opts:6,ans:5},
          {no:13,page:33,opts:6,ans:5}, {no:14,page:34,opts:6,ans:1}, {no:15,page:34,opts:6,ans:5},
          {no:16,page:35,opts:6,ans:4}, {no:17,page:36,opts:6,ans:2}, {no:18,page:37,opts:6,ans:4},
          {no:19,page:38,opts:6,ans:4}, {no:20,page:38,opts:6,ans:2}
        ],
        problems: [
          {page:25,answers:[1,2]}, {page:26,answers:[3,4]}, {page:27,answers:[5]}, {page:28,answers:[6]},
          {page:29,answers:[7]}, {page:30,answers:[8]}, {page:31,answers:[9]}, {page:32,answers:[10,11]},
          {page:33,answers:[12,13]}, {page:34,answers:[14,15]}, {page:35,answers:[16]}, {page:36,answers:[17]},
          {page:37,answers:[18]}, {page:38,answers:[19,20]}
        ] },
      { id: 'biology', label: '生物',
        pages: [39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54],
        questions: [
          {no:1,page:39,opts:6,ans:4}, {no:2,page:40,opts:6,ans:4}, {no:3,page:41,opts:6,ans:6},
          {no:4,page:42,opts:6,ans:3}, {no:5,page:43,opts:6,ans:4}, {no:6,page:44,opts:6,ans:2},
          {no:7,page:45,opts:7,ans:7}, {no:8,page:46,opts:6,ans:1}, {no:9,page:47,opts:6,ans:2},
          {no:10,page:48,opts:6,ans:4}, {no:11,page:48,opts:6,ans:6}, {no:12,page:49,opts:6,ans:1},
          {no:13,page:49,opts:6,ans:6}, {no:14,page:50,opts:6,ans:6}, {no:15,page:51,opts:6,ans:3},
          {no:16,page:52,opts:6,ans:4}, {no:17,page:53,opts:6,ans:3}, {no:18,page:54,opts:6,ans:4}
        ],
        problems: [
          {page:39,answers:[1]}, {page:40,answers:[2]}, {page:41,answers:[3]}, {page:42,answers:[4]},
          {page:43,answers:[5]}, {page:44,answers:[6]}, {page:45,answers:[7]}, {page:46,answers:[8]},
          {page:47,answers:[9]}, {page:48,answers:[10,11]}, {page:49,answers:[12,13]}, {page:50,answers:[14]},
          {page:51,answers:[15]}, {page:52,answers:[16]}, {page:53,answers:[17]}, {page:54,answers:[18]}
        ] }
    ]
  },
  'science/2021-2': {
    title: '理科 · 2021年第2回',
    imageBase: './assets/eju-media/science/2021-2/page-',
    subjects: [
      { id: 'physics', label: '物理',
        pages: [4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],
        questions: [
          {no:1,page:4,opts:6,ans:6}, {no:2,page:5,opts:6,ans:2}, {no:3,page:6,opts:6,ans:4},
          {no:4,page:7,opts:6,ans:6}, {no:5,page:8,opts:6,ans:3}, {no:6,page:9,opts:6,ans:2},
          {no:7,page:10,opts:6,ans:5}, {no:8,page:11,opts:6,ans:3}, {no:9,page:12,opts:6,ans:6},
          {no:10,page:13,opts:6,ans:4}, {no:11,page:14,opts:6,ans:3}, {no:12,page:15,opts:6,ans:2},
          {no:13,page:16,opts:6,ans:1}, {no:14,page:17,opts:6,ans:1}, {no:15,page:18,opts:6,ans:2},
          {no:16,page:19,opts:6,ans:5}, {no:17,page:20,opts:6,ans:4}, {no:18,page:21,opts:6,ans:6},
          {no:19,page:22,opts:6,ans:4}
        ] },
      { id: 'chemistry', label: '化学',
        refPage: 24, refLabel: '常数表 · 周期表',
        pages: [25,26,27,28,29,30,31,32,33,34,35,36,37,38],
        questions: [
          {no:1,page:25,opts:6,ans:3}, {no:2,page:26,opts:6,ans:3}, {no:3,page:26,opts:6,ans:1},
          {no:4,page:27,opts:6,ans:6}, {no:5,page:27,opts:6,ans:1}, {no:6,page:28,opts:6,ans:2},
          {no:7,page:29,opts:6,ans:5}, {no:8,page:29,opts:6,ans:4}, {no:9,page:30,opts:6,ans:5},
          {no:10,page:30,opts:6,ans:3}, {no:11,page:31,opts:6,ans:5}, {no:12,page:32,opts:6,ans:4},
          {no:13,page:33,opts:6,ans:2}, {no:14,page:33,opts:6,ans:3}, {no:15,page:34,opts:6,ans:2},
          {no:16,page:34,opts:6,ans:3}, {no:17,page:35,opts:6,ans:4}, {no:18,page:36,opts:6,ans:4},
          {no:19,page:37,opts:6,ans:1}, {no:20,page:38,opts:6,ans:5}
        ],
        problems: [
          {page:25,answers:[1]}, {page:26,answers:[2,3]}, {page:27,answers:[4,5]}, {page:28,answers:[6]},
          {page:29,answers:[7,8]}, {page:30,answers:[9,10]}, {page:31,answers:[11]}, {page:32,answers:[12]},
          {page:33,answers:[13,14]}, {page:34,answers:[15,16]}, {page:35,answers:[17]}, {page:36,answers:[18]},
          {page:37,answers:[19]}, {page:38,answers:[20]}
        ] },
      { id: 'biology', label: '生物',
        pages: [39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55],
        questions: [
          {no:1,page:39,opts:6,ans:1}, {no:2,page:40,opts:6,ans:4}, {no:3,page:41,opts:6,ans:2},
          {no:4,page:42,opts:6,ans:4}, {no:5,page:43,opts:6,ans:4}, {no:6,page:44,opts:6,ans:5},
          {no:7,page:45,opts:6,ans:3}, {no:8,page:46,opts:6,ans:6}, {no:9,page:47,opts:6,ans:2},
          {no:10,page:48,opts:6,ans:1}, {no:11,page:48,opts:6,ans:1}, {no:12,page:49,opts:6,ans:1},
          {no:13,page:50,opts:6,ans:3}, {no:14,page:51,opts:6,ans:2}, {no:15,page:52,opts:6,ans:1},
          {no:16,page:53,opts:6,ans:6}, {no:17,page:54,opts:6,ans:3}, {no:18,page:55,opts:6,ans:4}
        ],
        problems: [
          {page:39,answers:[1]}, {page:40,answers:[2]}, {page:41,answers:[3]}, {page:42,answers:[4]},
          {page:43,answers:[5]}, {page:44,answers:[6]}, {page:45,answers:[7]}, {page:46,answers:[8]},
          {page:47,answers:[9]}, {page:48,answers:[10,11]}, {page:49,answers:[12]}, {page:50,answers:[13]},
          {page:51,answers:[14]}, {page:52,answers:[15]}, {page:53,answers:[16]}, {page:54,answers:[17]},
          {page:55,answers:[18]}
        ] }
    ]
  }
};

// 综合科目（総合科目）练习原型 — 复用理科引擎渲染（ejuRikaProtoFor 共用）。
// 单科目 + マークシート单选 + 官方正解判分。key 用 humanities/<setId>，不与理科/数学混用。
var EJU_SOGO_PROTOTYPES = {
  'humanities/2024-1': {
    title: '総合科目 · 2024年',
    // 页眉印刷页号 = PDF 物理页号 + pageNumberOffset（综合科目卷内 p3=総合科目-1 起算，故 -2）。
    pageLabel: '総合科目-',
    pageNumberOffset: -2,
    imageBase: './assets/eju-media/humanities/2024-1/page-',
    subjects: [
      { id: 'sogo', label: '総合科目',
        pages: [3,4,5,6,7,8,10,11,12,13,14,15,16,17,18,19,20,21,22,24,25,26,27,28,29,30,31],
        // 显式题屏：p3=問1 材料页、p7=問2 材料页（answers:[]，无作答，仅展示下線部所依据的会話/文章）。
        problems: [
          {page:3,label:'問1 材料',answers:[]},
          {page:4,answers:[1,2]}, {page:5,answers:[3]}, {page:6,answers:[4]},
          {page:7,label:'問2 材料',answers:[]},
          {page:8,answers:[5]}, {page:10,answers:[6]}, {page:11,answers:[7,8]},
          {page:12,answers:[9]}, {page:13,answers:[10]}, {page:14,answers:[11,12]},
          {page:15,answers:[13]}, {page:16,answers:[14,15]}, {page:17,answers:[16,17]},
          {page:18,answers:[18]}, {page:19,answers:[19]}, {page:20,answers:[20]},
          {page:21,answers:[21,22]}, {page:22,answers:[23]}, {page:24,answers:[24,25]},
          {page:25,answers:[26,27,28]}, {page:26,answers:[29,30]}, {page:27,answers:[31,32]},
          {page:28,answers:[33,34]}, {page:29,answers:[35]}, {page:30,answers:[36,37]},
          {page:31,answers:[38]}
        ],
        questions: [
          {no:1,page:4,opts:4,ans:4}, {no:2,page:4,opts:4,ans:4}, {no:3,page:5,opts:4,ans:3},
          {no:4,page:6,opts:4,ans:2}, {no:5,page:8,opts:4,ans:3}, {no:6,page:10,opts:4,ans:2},
          {no:7,page:11,opts:4,ans:4}, {no:8,page:11,opts:4,ans:4}, {no:9,page:12,opts:4,ans:1},
          {no:10,page:13,opts:4,ans:3}, {no:11,page:14,opts:4,ans:1}, {no:12,page:14,opts:4,ans:1},
          {no:13,page:15,opts:4,ans:2}, {no:14,page:16,opts:4,ans:4}, {no:15,page:16,opts:4,ans:1},
          {no:16,page:17,opts:4,ans:3}, {no:17,page:17,opts:4,ans:1}, {no:18,page:18,opts:4,ans:2},
          {no:19,page:19,opts:4,ans:2}, {no:20,page:20,opts:4,ans:2}, {no:21,page:21,opts:4,ans:3},
          {no:22,page:21,opts:4,ans:3}, {no:23,page:22,opts:4,ans:1}, {no:24,page:24,opts:4,ans:4},
          {no:25,page:24,opts:4,ans:3}, {no:26,page:25,opts:4,ans:2}, {no:27,page:25,opts:4,ans:4},
          {no:28,page:25,opts:4,ans:1}, {no:29,page:26,opts:4,ans:1}, {no:30,page:26,opts:4,ans:2},
          {no:31,page:27,opts:4,ans:3}, {no:32,page:27,opts:4,ans:4}, {no:33,page:28,opts:4,ans:1},
          {no:34,page:28,opts:4,ans:2}, {no:35,page:29,opts:4,ans:3}, {no:36,page:30,opts:4,ans:1},
          {no:37,page:30,opts:4,ans:3}, {no:38,page:31,opts:4,ans:4}
        ] }
    ]
  }
};

// 理科 + 综合科目共用一套渲染引擎，按 key 取对应原型。
function ejuRikaProtoFor(key) {
  var rikaProto = (typeof EJU_RIKA_PROTOTYPES !== 'undefined') ? EJU_RIKA_PROTOTYPES[key] : null;
  var sogoProto = (typeof EJU_SOGO_PROTOTYPES !== 'undefined') ? EJU_SOGO_PROTOTYPES[key] : null;
  return rikaProto || sogoProto;
}

function ejuHasPracticePrototype(subject, setId) {
  var key = subject + '/' + setId;
  if (typeof EJU_MATH_PAPER_PROTOTYPES !== 'undefined' && EJU_MATH_PAPER_PROTOTYPES[key]) return true;
  if (typeof EJU_RIKA_PROTOTYPES !== 'undefined' && EJU_RIKA_PROTOTYPES[key]) return true;
  if (typeof EJU_SOGO_PROTOTYPES !== 'undefined' && EJU_SOGO_PROTOTYPES[key]) return true;
  return false;
}

function ejuShowComingSoon() {
  if (typeof toast === 'function') toast('建设中，暂未开放');
  else alert('建设中，暂未开放');
}

function ejuIsLocalStaticHost() {
  if (typeof location === 'undefined') return false;
  return location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.hostname === '::1';
}

function ejuFallbackCategories() {
  return [
    { id: 'japanese', label: '日本語', labelZh: '日语', available: true },
    { id: 'sogo', label: '総合科目', labelZh: '综合科目', available: false },
    { id: 'science', label: '理科', labelZh: '理科', available: false },
    { id: 'math', label: '数学', labelZh: '数学', available: false }
  ];
}

// =====================================================================
// G. 辅助函数
// =====================================================================

function ejuUUID() {
  var arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  arr[6] = (arr[6] & 0x0f) | 0x40;
  arr[8] = (arr[8] & 0x3f) | 0x80;
  var h = Array.from(arr).map(function(b) { return b.toString(16).padStart(2, '0'); }).join('');
  return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
}

async function ejuGetToken() {
  try {
    var sb = null;
    if (typeof supabaseClient !== 'undefined' && supabaseClient) sb = supabaseClient;
    else if (window.supabaseClient) sb = window.supabaseClient;
    else if (typeof initSupabase === 'function') sb = initSupabase();
    if (!sb) return '';
    var res = await sb.auth.getSession();
    return (res.data && res.data.session && res.data.session.access_token) || '';
  } catch(e) { return ''; }
}

async function ejuFetch(path, opts) {
  var token = await ejuGetToken();
  var headers = Object.assign({
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  }, (opts && opts.headers) || {});
  var finalOpts = Object.assign({}, opts || {}, { headers: headers });
  var url = (typeof apiUrl === 'function') ? apiUrl(path.replace('/api/', '')) : path;
  var res = await fetch(url, finalOpts);
  if (!res.ok) {
    var errText = await res.text().catch(function() { return 'unknown error'; });
    var errObj;
    try { errObj = JSON.parse(errText); } catch(e) { errObj = { error: errText }; }
    throw Object.assign(new Error(errObj.error || ('HTTP ' + res.status)), { code: errObj.code, status: res.status });
  }
  return res.json();
}

async function ejuLoadScannedData() {
  if (ejuScannedData) return ejuScannedData;
  if (!ejuScannedDataPromise) {
    ejuScannedDataPromise = (async function() {
      try {
        var res = await fetch('./assets/eju-scanned-data.json?v=20260614-sogo-2024-1-materials-fix', { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        ejuScannedData = await res.json();
        return ejuScannedData;
      } catch(e) {
        ejuScannedDataPromise = null;
        return null;
      }
    })();
  }
  return ejuScannedDataPromise;
}

function ejuHasScanSubject(subject, data) {
  data = data || ejuScannedData;
  return !!(data && (data.sets || []).some(function(s) { return s.subject === subject; }));
}

function ejuScanSubjectInfo(subject) {
  var data = ejuScannedData || {};
  return (data.subjects && data.subjects[subject]) || { label: subject, labelJa: subject };
}

function ejuScanSubjectLabel(subject) {
  var info = ejuScanSubjectInfo(subject);
  return info.label || info.labelJa || subject;
}

function ejuScanStatusBadge(status) {
  var label = EJU_SCAN_STATUS_LABEL[status] || status || '未知';
  var cls = EJU_SCAN_STATUS_CLASS[status] || '';
  return '<span class="pill ' + cls + '" style="font-size:11px">' + ejuEsc(label) + '</span>';
}

function ejuNextReadingSelectRender() {
  ejuReadingSelectRenderToken += 1;
  return ejuReadingSelectRenderToken;
}

function ejuIsReadingSelectRenderCurrent(token) {
  return token === ejuReadingSelectRenderToken;
}

function ejuNextReadingListRender() {
  ejuReadingListRenderToken += 1;
  return ejuReadingListRenderToken;
}

function ejuIsReadingListRenderCurrent(token) {
  return token === ejuReadingListRenderToken;
}

function ejuMergeScannedCategories(cats, scanned) {
  var byId = {};
  (cats || []).forEach(function(cat) {
    byId[cat.id] = Object.assign({}, cat);
  });
  if (!scanned || !scanned.sets || !scanned.sets.length) return cats || [];

  if (ejuHasScanSubject('humanities', scanned)) {
    byId.sogo = Object.assign({ id: 'sogo', label: '総合科目', labelZh: '综合科目', skills: [] }, byId.sogo || {}, {
      available: true,
      localScan: true
    });
  }
  if (ejuHasScanSubject('science', scanned)) {
    byId.science = Object.assign({ id: 'science', label: '理科', labelZh: '理科', skills: [] }, byId.science || {}, {
      available: true,
      localScan: true
    });
  }
  if (ejuHasScanSubject('math1', scanned) || ejuHasScanSubject('math2', scanned)) {
    byId.math = Object.assign({ id: 'math', label: '数学', labelZh: '数学', skills: [] }, byId.math || {}, {
      available: true,
      localScan: true,
      skills: [
        { id: 'math1', label: '数学コース1', labelZh: '数学1', available: ejuHasScanSubject('math1', scanned) },
        { id: 'math2', label: '数学コース2', labelZh: '数学2', available: ejuHasScanSubject('math2', scanned) }
      ]
    });
  }

  var order = ['japanese', 'sogo', 'science', 'math'];
  return order.map(function(id) { return byId[id]; }).filter(Boolean);
}

function ejuEsc(str) {
  return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function ejuJsString(str) {
  return String(str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '');
}

function ejuFormatSec(sec) {
  sec = Math.round(sec || 0);
  if (sec < 60) return sec + 's';
  return Math.floor(sec/60) + 'm' + (sec%60) + 's';
}

// =====================================================================
// B. Hub 渲染
// =====================================================================

async function initEjuHub() {
  var el = document.getElementById('view-exam-trial');
  if (!el) return;
  var mount = el.querySelector('#ejuHubMount');
  if (!mount) return;
  mount.innerHTML = '<p style="color:#8b86a3;padding:16px 0">加载科目列表…</p>';
  try {
    var scanned = await ejuLoadScannedData();
    var cats = [];
    if (scanned && ejuIsLocalStaticHost()) {
      cats = ejuFallbackCategories();
    } else {
      try {
        var data = await ejuFetch('/api/eju-categories');
        cats = data.categories || [];
      } catch(apiError) {
        if (!scanned) throw apiError;
        cats = ejuFallbackCategories();
      }
    }
    cats = ejuMergeScannedCategories(cats, scanned);
    var html = '<div class="eju-cat-grid">';
    cats.forEach(function(cat) {
      var disabled = !cat.available;
      html += '<button class="eju-cat-card' + (disabled ? ' disabled' : '') + '"'
        + (disabled ? ' disabled' : ' onclick="ejuSelectCategory(\'' + ejuEsc(cat.id) + '\')"')
        + '>';
      html += '<div class="hub-icon">' + ejuCatIcon(cat.id) + '</div>';
      html += '<strong>' + ejuEsc(cat.labelZh || cat.label) + '</strong>';
      html += '<span>' + ejuEsc(cat.label) + '</span>';
      if (cat.localScan) html += '<span class="pill ok" style="margin-top:8px;font-size:11px">扫描数据</span>';
      if (disabled) html += '<span class="pill" style="margin-top:8px;font-size:11px">建设中</span>';
      html += '</button>';
    });
    html += '</div>';
    mount.innerHTML = html;
  } catch(e) {
    mount.innerHTML = '<p style="color:#f05b7b">加载失败：' + ejuEsc(e.message) + '</p>';
  }
}

function ejuCatIcon(id) {
  var icons = { japanese: '🇯🇵', sogo: '📊', science: '🔬', math: '📐' };
  return icons[id] || '📝';
}

function ejuSelectCategory(catId) {
  if (catId === 'japanese') {
    switchView('eju-japanese');
    renderEjuJapanese();
  } else if (catId === 'math') {
    renderEjuMathScannedMenu();
  } else if (EJU_SCAN_CATEGORY_SUBJECT[catId]) {
    renderEjuScannedSubject(EJU_SCAN_CATEGORY_SUBJECT[catId]);
  } else {
    if (typeof toast === 'function') toast('该科目暂未开放，敬请期待');
  }
}

function ejuSetSubjectTitle(text) {
  var title = document.getElementById('ejuSubjectTitle');
  if (!title) {
    var el = document.getElementById('view-eju-japanese');
    title = el ? el.querySelector('h2') : null;
  }
  if (title) title.textContent = text;
}

function ejuOpenEssayEntry() {
  if (typeof window.ejuEssayRenderHome === 'function') {
    window.ejuEssayRenderHome();
    return;
  }
  if (typeof toast === 'function') toast('作文批改模块加载中，请刷新后重试');
}

function renderEjuJapanese() {
  var el = document.getElementById('view-eju-japanese');
  if (!el) return;
  var mount = el.querySelector('#ejuJapaneseMount');
  if (!mount) return;
  ejuSetSubjectTitle('日本語');
  mount.innerHTML = ''
    + '<div class="eju-skill-grid">'
    + '<button class="eju-skill-card" id="ejuReadingSkillBtn" onclick="loadEjuReadingSets()">'
    + '<div class="eju-skill-icon">📖</div>'
    + '<div class="eju-skill-info">'
    + '<div class="eju-skill-title">読解</div>'
    + '<div class="eju-skill-desc">日语阅读四阶段训练</div>'
    + '</div>'
    + '<span class="eju-cat-badge">开放中</span>'
    + '</button>'
    + '<button class="eju-skill-card disabled" disabled>'
    + '<div class="eju-skill-icon">🎧</div>'
    + '<div class="eju-skill-info">'
    + '<div class="eju-skill-title">聴読解</div>'
    + '<div class="eju-skill-desc">建设中</div>'
    + '</div>'
    + '<span class="eju-cat-badge soon">建设中</span>'
    + '</button>'
    + '<button class="eju-skill-card" id="ejuEssaySkillBtn" onclick="ejuOpenEssayEntry()">'
    + '<div class="eju-skill-icon">✍️</div>'
    + '<div class="eju-skill-info">'
    + '<div class="eju-skill-title">記述</div>'
    + '<div class="eju-skill-desc">EJU 記述作文 AI 批改</div>'
    + '</div>'
    + '<span class="eju-cat-badge">试验开放</span>'
    + '</button>'
    + '</div>';
  var readingBtn = document.getElementById('ejuReadingSkillBtn');
  if (readingBtn) readingBtn.onclick = loadEjuReadingSets;
}

async function renderEjuMathScannedMenu() {
  var renderToken = ejuNextReadingSelectRender();
  var data = await ejuLoadScannedData();
  if (!ejuIsReadingSelectRenderCurrent(renderToken)) return;
  switchView('eju-japanese');
  ejuSetSubjectTitle('数学');
  var el = document.getElementById('view-eju-japanese');
  if (!el) return;
  var mount = el.querySelector('#ejuJapaneseMount');
  if (!mount) return;

  var html = '<div class="eju-skill-grid">';
  ['math1', 'math2'].forEach(function(subject) {
    var info = ejuScanSubjectInfo(subject);
    var available = ejuHasScanSubject(subject, data);
    html += '<button class="eju-skill-card' + (available ? '' : ' disabled') + '"'
      + (available ? ' onclick="renderEjuScannedSubject(\'' + subject + '\')"' : ' disabled')
      + '>';
    html += '<div class="eju-skill-icon">📐</div>';
    html += '<div class="eju-skill-info">';
    html += '<div class="eju-skill-title">' + ejuEsc(info.label || subject) + '</div>';
    html += '<div class="eju-skill-desc">' + ejuEsc(info.labelJa || '') + ' 扫描卷 OCR 浏览</div>';
    html += '</div>';
    html += '<span class="eju-cat-badge' + (available ? '' : ' soon') + '">' + (available ? '扫描数据' : '暂无') + '</span>';
    html += '</button>';
  });
  html += '</div>';
  mount.innerHTML = html;
}

async function renderEjuScannedSubject(subject) {
  var renderToken = ejuNextReadingSelectRender();
  ejuNextReadingListRender();
  ejuCurrentScanSubject = subject;
  ejuCurrentScanSetId = '';
  switchView('eju-reading-select');
  var el = document.getElementById('view-eju-reading-select');
  if (!el) return;
  var title = el.querySelector('h2');
  var back = el.querySelector('.eju-back-btn');
  if (title) title.textContent = ejuScanSubjectLabel(subject) + ' — 扫描卷';
  if (back) {
    back.textContent = '← 返回';
    back.onclick = function() {
      if (subject === 'math1' || subject === 'math2') renderEjuMathScannedMenu();
      else switchView('exam-trial');
    };
  }

  var mount = el.querySelector('#ejuReadingSelectMount');
  if (!mount) return;
  mount.innerHTML = '<p style="color:#8b86a3;padding:16px 0">加载扫描卷列表…</p>';
  var data = await ejuLoadScannedData();
  if (!ejuIsReadingSelectRenderCurrent(renderToken)) return;
  if (!data) {
    mount.innerHTML = '<p style="color:#f05b7b">未找到本地扫描数据，请稍后重试。</p>';
    return;
  }

  var sets = (data.sets || []).filter(function(s) { return s.subject === subject; });
  if (!sets.length) {
    mount.innerHTML = '<p style="color:#8b86a3">暂无扫描卷。</p>';
    return;
  }

  var counts = {};
  sets.forEach(function(s) { counts[s.status] = (counts[s.status] || 0) + 1; });
  var html = '<div style="display:flex;gap:8px;flex-wrap:wrap;margin:6px 0 14px">'
    + ejuScanStatusBadge('pass') + '<span class="pill" style="font-size:11px">' + (counts.pass || 0) + ' 套</span>'
    + ejuScanStatusBadge('needs_review') + '<span class="pill" style="font-size:11px">' + (counts.needs_review || 0) + ' 套</span>'
    + ejuScanStatusBadge('fail') + '<span class="pill" style="font-size:11px">' + (counts.fail || 0) + ' 套</span>'
    + '</div>';
  html += '<div class="eju-year-grid">';
  sets.sort(function(a, b) {
    if (a.year !== b.year) return b.year - a.year;
    return b.session - a.session;
  }).forEach(function(s) {
    var isReady = ejuHasPracticePrototype(subject, s.setId);
    var cardClass = 'eju-year-card' + (isReady ? '' : ' disabled coming-soon');
    var clickHandler = isReady
      ? 'renderEjuScannedSet(\'' + ejuJsString(subject) + '\',\'' + ejuJsString(s.setId) + '\')'
      : 'ejuShowComingSoon()';
    html += '<button class="' + cardClass + '" onclick="' + clickHandler + '">';
    html += '<strong>' + ejuEsc(s.year) + ' 年</strong>';
    html += '<span>第 ' + ejuEsc(s.session) + ' 回 · ' + (isReady ? ejuEsc(s.pageCount) + ' 页' : '建设中') + '</span>';
    html += '<span class="eju-cat-badge' + (isReady ? '' : ' soon') + '">' + (isReady ? '开放中' : '建设中') + '</span>';
    html += '</button>';
  });
  html += '</div>';
  mount.innerHTML = html;
}

async function renderEjuScannedSet(subject, setId) {
  var renderToken = ejuNextReadingListRender();
  ejuCurrentScanSubject = subject;
  ejuCurrentScanSetId = setId;
  switchView('eju-reading-list');
  var el = document.getElementById('view-eju-reading-list');
  if (!el) return;
  var back = el.querySelector('.eju-back-btn');
  if (back) {
    back.textContent = '← 套卷列表';
    back.onclick = function() { renderEjuScannedSubject(subject); };
  }
  var mount = el.querySelector('#ejuReadingListMount');
  if (!mount) return;
  mount.innerHTML = '<p style="color:#8b86a3;padding:16px 0">加载套卷…</p>';
  var data = await ejuLoadScannedData();
  if (!ejuIsReadingListRenderCurrent(renderToken)) return;
  if (!data) {
    mount.innerHTML = '<p style="color:#f05b7b">未找到本地扫描数据，请稍后重试。</p>';
    return;
  }
  var item = (data.sets || []).find(function(s) { return s.subject === subject && s.setId === setId; });
  if (!item) {
    mount.innerHTML = '<p style="color:#f05b7b">未找到该套扫描数据。</p>';
    return;
  }
  var key = subject + '/' + setId;
  if (!ejuHasPracticePrototype(subject, setId)) {
    ejuShowComingSoon();
    renderEjuScannedSubject(subject);
    return;
  }
  if (typeof EJU_MATH_PAPER_PROTOTYPES !== 'undefined' && EJU_MATH_PAPER_PROTOTYPES[key]) {
    renderEjuMathPaperPractice(subject, setId, item);
    return;
  }
  if (typeof EJU_RIKA_PROTOTYPES !== 'undefined' && EJU_RIKA_PROTOTYPES[key]) {
    renderEjuRikaPractice(subject, setId, item);
    return;
  }
  if (typeof EJU_SOGO_PROTOTYPES !== 'undefined' && EJU_SOGO_PROTOTYPES[key]) {
    if (typeof renderEjuSogoPractice === 'function') {
      renderEjuSogoPractice(subject, setId, item);
      return;
    }
    if (typeof renderEjuRikaPractice === 'function' && ejuRikaProtoFor(key)) {
      renderEjuRikaPractice(subject, setId, item);
      return;
    }
  }
  ejuShowComingSoon();
  renderEjuScannedSubject(subject);
  return;
}

function ejuMathPaperStorageKey(key) {
  return 'baina-eju-math-paper-' + key;
}

function ejuLoadMathPaperAnswers(key) {
  try {
    return JSON.parse(localStorage.getItem(ejuMathPaperStorageKey(key)) || '{}') || {};
  } catch(e) {
    return {};
  }
}

function ejuSaveMathPaperAnswer(answerKey, value) {
  var key = ejuCurrentScanSubject + '/' + ejuCurrentScanSetId;
  ejuMathPaperAnswers[answerKey] = value;
  try {
    localStorage.setItem(ejuMathPaperStorageKey(key), JSON.stringify(ejuMathPaperAnswers));
  } catch(e) {}
}

function ejuMathPaperSourcePage(proto, page) {
  return proto.pages ? proto.pages[page - 1] : page;
}

function ejuMathPaperAnswerLabels(proto, page) {
  var sourcePage = ejuMathPaperSourcePage(proto, page);
  if (proto.answerLabelsBySourcePage && proto.answerLabelsBySourcePage[sourcePage]) {
    return proto.answerLabelsBySourcePage[sourcePage];
  }
  return proto.answerLabels || [];
}

function ejuMathPaperAnswerKey(proto, page, label) {
  return ejuMathPaperSourcePage(proto, page) + ':' + label;
}

function ejuMathPaperImageSrc(proto, page) {
  var sourcePage = ejuMathPaperSourcePage(proto, page);
  return proto.imageBase + String(sourcePage).padStart(3, '0') + '.png';
}

function renderEjuMathPaperPractice(subject, setId, item) {
  var key = subject + '/' + setId;
  var proto = EJU_MATH_PAPER_PROTOTYPES[key];
  if (!proto) return;
  document.body.classList.add('eju-paper-focus');
  ejuCurrentScanSubject = subject;
  ejuCurrentScanSetId = setId;
  ejuMathPaperPage = proto.firstQuestionPage || 1;
  ejuMathPaperAnswers = ejuLoadMathPaperAnswers(key);

  var el = document.getElementById('view-eju-reading-list');
  if (!el) return;
  var title = el.querySelector('#ejuReadingListTitle') || el.querySelector('#ejuListTitle');
  var back = el.querySelector('.eju-back-btn');
  if (title) title.textContent = proto.title;
  if (back) {
    back.textContent = '← 套卷列表';
    back.onclick = function() { renderEjuScannedSubject(subject); };
  }
  ejuRenderMathPaperView();
}

function ejuMathPaperGo(delta) {
  var key = ejuCurrentScanSubject + '/' + ejuCurrentScanSetId;
  var proto = EJU_MATH_PAPER_PROTOTYPES[key];
  if (!proto) return;
  ejuMathPaperPage = Math.max(1, Math.min(proto.pageCount, ejuMathPaperPage + delta));
  ejuRenderMathPaperView();
}

function ejuMathPaperJump(page) {
  var key = ejuCurrentScanSubject + '/' + ejuCurrentScanSetId;
  var proto = EJU_MATH_PAPER_PROTOTYPES[key];
  if (!proto) return;
  ejuMathPaperPage = Math.max(1, Math.min(proto.pageCount, Number(page) || 1));
  ejuRenderMathPaperView();
}

function ejuRenderMathPaperView() {
  var key = ejuCurrentScanSubject + '/' + ejuCurrentScanSetId;
  var proto = EJU_MATH_PAPER_PROTOTYPES[key];
  var mount = document.getElementById('ejuReadingListMount');
  if (!proto || !mount) return;

  var page = Math.max(1, Math.min(proto.pageCount, ejuMathPaperPage || 1));
  ejuMathPaperPage = page;
  var prevDisabled = page <= 1 ? ' disabled' : '';
  var nextDisabled = page >= proto.pageCount ? ' disabled' : '';
  var pageButtons = '';
  for (var i = 1; i <= proto.pageCount; i++) {
    pageButtons += '<button class="ghost" style="padding:7px 10px;border-radius:12px;min-width:38px' + (i === page ? ';background:rgba(124,92,255,.16);color:#5d43e8;font-weight:950' : '') + '" onclick="ejuMathPaperJump(' + i + ')">' + i + '</button>';
  }

  var answersHtml = ejuMathPaperAnswerLabels(proto, page).map(function(label) {
    var answerKey = ejuMathPaperAnswerKey(proto, page, label);
    return '<label style="display:flex;align-items:center;gap:8px;background:rgba(255,255,255,.78);border:1px solid rgba(124,92,255,.14);border-radius:14px;padding:8px 10px">'
      + '<span style="font-weight:950;color:#5d43e8;min-width:30px">' + ejuEsc(label) + '</span>'
      + '<input value="' + ejuEsc(ejuMathPaperAnswers[answerKey] || '') + '" oninput="ejuSaveMathPaperAnswer(\'' + ejuJsString(answerKey) + '\', this.value)" style="border:0;background:transparent;outline:0;min-width:0;width:100%;font:inherit;color:#30294d;font-weight:800" />'
      + '</label>';
  }).join('');

  mount.innerHTML = ''
    + '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px">'
    + '<button class="ghost" onclick="ejuMathPaperGo(-1)"' + prevDisabled + '>← 上一页</button>'
    + '<div style="font-size:18px;font-weight:950;color:#30294d">' + page + ' / ' + proto.pageCount + '</div>'
    + '<button class="ghost" onclick="ejuMathPaperGo(1)"' + nextDisabled + '>下一页 →</button>'
    + '</div>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' + pageButtons + '</div>'
    + '<div style="background:#fff;border:1px solid rgba(124,92,255,.16);border-radius:18px;overflow:hidden;box-shadow:0 10px 28px rgba(105,80,200,.10)">'
    + '<img src="' + ejuEsc(ejuMathPaperImageSrc(proto, page)) + '" alt="' + ejuEsc(proto.title + ' page ' + page) + '" style="display:block;width:100%;height:auto" />'
    + '</div>'
    + '<div class="eju-question-card" style="margin-top:14px">'
    + '<div style="font-weight:950;color:#30294d;margin-bottom:10px">答案</div>'
    + '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px">' + answersHtml + '</div>'
    + '</div>';
}

// =====================================================================
// 理科练习（マークシート单选 + 对照官方正解判分）
// =====================================================================
var EJU_RIKA_CIRCLES = ['⓪','①','②','③','④','⑤','⑥','⑦','⑧','⑨'];
function ejuRikaCircle(n) { return EJU_RIKA_CIRCLES[n] || ('(' + n + ')'); }

function ejuRikaGetSubject(proto, id) {
  if (!proto || !proto.subjects) return null;
  for (var i = 0; i < proto.subjects.length; i++) {
    if (proto.subjects[i].id === id) return proto.subjects[i];
  }
  return proto.subjects[0] || null;
}

function ejuLoadRikaAnswers(key) {
  try {
    return JSON.parse(localStorage.getItem(ejuMathPaperStorageKey(key)) || '{}') || {};
  } catch(e) { return {}; }
}

function ejuRikaSaveAnswer(answerKey, value) {
  var key = ejuCurrentScanSubject + '/' + ejuCurrentScanSetId;
  ejuRikaAnswers[answerKey] = value;
  try { localStorage.setItem(ejuMathPaperStorageKey(key), JSON.stringify(ejuRikaAnswers)); } catch(e) {}
}

function ejuRikaPick(answerKey, value) {
  if (ejuRikaGraded) return;       // 採点后锁定
  ejuRikaSaveAnswer(answerKey, String(value));
  ejuRenderRikaView();
}

function ejuRikaImageSrc(proto, pageRef) {
  if (typeof pageRef === 'string') return proto.imageBase + pageRef + '.png';
  return proto.imageBase + String(pageRef).padStart(3, '0') + '.png';
}

function ejuRikaProblemList(subj) {
  if (subj.problems && subj.problems.length) return subj.problems;
  return (subj.pages || []).map(function(page) {
    var answers = subj.questions.filter(function(q) { return q.page === page; }).map(function(q) { return q.no; });
    return { page: page, answers: answers };
  });
}

function ejuRikaProblemQuestions(subj, problem) {
  var answers = problem.answers || [];
  if (!answers.length) return subj.questions.filter(function(q) { return q.page === problem.page; });
  return answers.map(function(no) {
    return subj.questions.find(function(q) { return q.no === no; });
  }).filter(Boolean);
}

function ejuRikaProblemLabel(subj, problem) {
  var qs = ejuRikaProblemQuestions(subj, problem);
  if (qs.length) return qs.map(function(q) { return q.no; }).join('·');
  return problem.label || '';
}

function renderEjuRikaPractice(subject, setId, item) {
  var key = subject + '/' + setId;
  var proto = ejuRikaProtoFor(key);
  if (!proto) return;
  document.body.classList.add('eju-paper-focus');
  ejuCurrentScanSubject = subject;
  ejuCurrentScanSetId = setId;
  ejuRikaSubjectId = (proto.subjects[0] || {}).id || '';
  ejuRikaPage = 1;
  ejuRikaGraded = false;
  ejuRikaAnswers = ejuLoadRikaAnswers(key);

  var el = document.getElementById('view-eju-reading-list');
  if (!el) return;
  var title = el.querySelector('#ejuReadingListTitle') || el.querySelector('#ejuListTitle');
  var back = el.querySelector('.eju-back-btn');
  if (title) title.textContent = proto.title;
  if (back) {
    back.textContent = '← 套卷列表';
    back.onclick = function() { renderEjuScannedSubject(subject); };
  }
  ejuRenderRikaView();
}

function ejuRikaSelectSubject(id) {
  ejuRikaSubjectId = id;
  ejuRikaPage = 1;
  ejuRikaGraded = false;
  ejuRenderRikaView();
}

function ejuRikaGo(delta) {
  var proto = ejuRikaProtoFor(ejuCurrentScanSubject + '/' + ejuCurrentScanSetId);
  var subj = ejuRikaGetSubject(proto, ejuRikaSubjectId);
  if (!subj) return;
  var problems = ejuRikaProblemList(subj);
  ejuRikaPage = Math.max(1, Math.min(problems.length, ejuRikaPage + delta));
  ejuRenderRikaView();
}

function ejuRikaJump(page) {
  var proto = ejuRikaProtoFor(ejuCurrentScanSubject + '/' + ejuCurrentScanSetId);
  var subj = ejuRikaGetSubject(proto, ejuRikaSubjectId);
  if (!subj) return;
  var problems = ejuRikaProblemList(subj);
  ejuRikaPage = Math.max(1, Math.min(problems.length, Number(page) || 1));
  ejuRenderRikaView();
}

function ejuRikaGrade() {
  ejuRikaGraded = true;
  ejuRenderRikaView();
}

function ejuRikaRetry() {
  ejuRikaGraded = false;
  ejuRenderRikaView();
}

function ejuRikaSubjectScore(subj) {
  var done = 0, correct = 0;
  subj.questions.forEach(function(q) {
    var v = ejuRikaAnswers[subj.id + ':' + q.no];
    if (v) { done++; if (String(v) === String(q.ans)) correct++; }
  });
  return { total: subj.questions.length, done: done, correct: correct };
}

function ejuRenderRikaView() {
  var proto = ejuRikaProtoFor(ejuCurrentScanSubject + '/' + ejuCurrentScanSetId);
  var mount = document.getElementById('ejuReadingListMount');
  if (!proto || !mount) return;
  var subj = ejuRikaGetSubject(proto, ejuRikaSubjectId);
  if (!subj) return;

  var problems = ejuRikaProblemList(subj);
  var page = Math.max(1, Math.min(problems.length, ejuRikaPage || 1));
  ejuRikaPage = page;
  var problem = problems[page - 1];
  var sourcePage = problem.page;
  var imageRef = problem.image || sourcePage;
  var problemLabel = ejuRikaProblemLabel(subj, problem);
  // 本屏是否为无作答材料/资料页（如综合科目 問1/問2 引导文章页）
  var isMaterialPage = ejuRikaProblemQuestions(subj, problem).length === 0;

  // 页眉标签：理科='理科-'，综合科目='総合科目-'。
  // 印刷页号 = PDF 物理页号 + pageNumberOffset（理科 offset=0；综合科目 -2）。
  var pageLabel = proto.pageLabel || '理科-';
  var printedPage = sourcePage + (proto.pageNumberOffset || 0);
  // 印刷页号与 PDF 页号不一致时（如综合科目）标注 PDF 页，避免误导。
  var pdfNote = proto.pageNumberOffset ? ('PDF p' + sourcePage + ' · ') : '';

  // 科目切换条（单科目如综合科目则隐藏）
  var subjectBar = proto.subjects.length <= 1 ? '' : proto.subjects.map(function(s) {
    var active = s.id === ejuRikaSubjectId;
    return '<button class="ghost" style="padding:8px 16px;border-radius:14px;font-weight:950'
      + (active ? ';background:rgba(124,92,255,.16);color:#5d43e8' : ';color:#756c9d') + '" '
      + 'onclick="ejuRikaSelectSubject(\'' + ejuJsString(s.id) + '\')">' + ejuEsc(s.label) + '</button>';
  }).join('');

  // 可折叠参考资料（如化学的常数表/周期表），不占题目页位
  var refHtml = '';
  if (subj.refPage) {
    refHtml = '<details style="margin-bottom:12px;background:#fff;border:1px solid rgba(124,92,255,.16);border-radius:14px;overflow:hidden">'
      + '<summary style="cursor:pointer;padding:10px 14px;font-weight:900;color:#5d43e8;list-style:none">📋 ' + ejuEsc(subj.refLabel || '参考资料') + '（点击展开）</summary>'
      + '<div style="padding:0 12px 12px"><img src="' + ejuEsc(ejuRikaImageSrc(proto, subj.refPage)) + '" alt="' + ejuEsc((subj.refLabel || '参考资料')) + '" style="display:block;width:100%;height:auto;border-radius:10px" /></div>'
      + '</details>';
  }

  // 页导航
  var prevDisabled = page <= 1 ? ' disabled' : '';
  var nextDisabled = page >= problems.length ? ' disabled' : '';
  var pageButtons = '';
  for (var i = 1; i <= problems.length; i++) {
    var navLabel = ejuRikaProblemLabel(subj, problems[i - 1]) || i;
    pageButtons += '<button class="ghost" style="padding:7px 10px;border-radius:12px;min-width:38px'
      + (i === page ? ';background:rgba(124,92,255,.16);color:#5d43e8;font-weight:950' : '') + '" '
      + 'onclick="ejuRikaJump(' + i + ')">' + ejuEsc(navLabel) + '</button>';
  }

  // 当前 problem 的题目（按解答番号）
  var qs = ejuRikaProblemQuestions(subj, problem);
  var qHtml = qs.map(function(q) {
    var answerKey = subj.id + ':' + q.no;
    var picked = ejuRikaAnswers[answerKey] || '';
    var opts = '';
    for (var o = 1; o <= q.opts; o++) {
      var isPicked = String(picked) === String(o);
      var bg = 'rgba(255,255,255,.78)', col = '#5d43e8', bd = 'rgba(124,92,255,.18)';
      if (ejuRikaGraded) {
        if (o === q.ans) { bg = 'rgba(46,196,127,.16)'; col = '#1f9d63'; bd = 'rgba(46,196,127,.5)'; }
        else if (isPicked) { bg = 'rgba(240,91,123,.14)'; col = '#e0436a'; bd = 'rgba(240,91,123,.5)'; }
      } else if (isPicked) { bg = 'rgba(124,92,255,.18)'; col = '#5d43e8'; bd = 'rgba(124,92,255,.6)'; }
      opts += '<button onclick="ejuRikaPick(\'' + ejuJsString(answerKey) + '\',' + o + ')" '
        + 'style="width:42px;height:42px;border-radius:50%;border:2px solid ' + bd + ';background:' + bg
        + ';color:' + col + ';font-weight:950;font-size:16px;cursor:' + (ejuRikaGraded ? 'default' : 'pointer') + '">'
        + ejuRikaCircle(o) + '</button>';
    }
    var mark = '';
    if (ejuRikaGraded && picked) {
      mark = String(picked) === String(q.ans)
        ? '<span style="color:#1f9d63;font-weight:950;margin-left:8px">✓ 正解</span>'
        : '<span style="color:#e0436a;font-weight:950;margin-left:8px">✗ 正解 ' + ejuRikaCircle(q.ans) + '</span>';
    } else if (ejuRikaGraded) {
      mark = '<span style="color:#9086ac;font-weight:800;margin-left:8px">未答 · 正解 ' + ejuRikaCircle(q.ans) + '</span>';
    }
    return '<div style="background:#fff;border:1px solid rgba(124,92,255,.14);border-radius:14px;padding:10px 12px;display:flex;align-items:center;gap:10px;flex-wrap:wrap">'
      + '<span style="font-weight:950;color:#30294d;min-width:54px">解答 ' + q.no + '</span>'
      + '<div style="display:flex;gap:6px;flex-wrap:wrap">' + opts + '</div>' + mark
      + '</div>';
  }).join('');
  if (!qs.length) {
    qHtml = '<p style="color:#9086ac;font-size:13px;padding:6px 2px">本页为说明/资料页，无作答题。</p>';
  }

  var score = ejuRikaSubjectScore(subj);
  var scoreBar = ejuRikaGraded
    ? '<div style="font-weight:950;color:#30294d">得分 ' + score.correct + ' / ' + score.total
        + '（已答 ' + score.done + '）<button class="ghost" style="margin-left:12px;padding:6px 14px;border-radius:12px" onclick="ejuRikaRetry()">重做</button></div>'
    : '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap"><span style="color:#756c9d;font-weight:800">已答 ' + score.done + ' / ' + score.total + '</span>'
        + '<button class="ghost" style="padding:8px 18px;border-radius:12px;background:rgba(124,92,255,.14);color:#5d43e8;font-weight:950" onclick="ejuRikaGrade()">採点</button></div>';

  mount.innerHTML = ''
    + (subjectBar ? '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">' + subjectBar + '</div>' : '')
    + refHtml
    + '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px">'
    + '<button class="ghost" onclick="ejuRikaGo(-1)"' + prevDisabled + '>← 上一题</button>'
    + '<div style="font-size:16px;font-weight:950;color:#30294d">' + subj.label + ' · ' + (isMaterialPage ? '資料' : '解答 ' + ejuEsc(problemLabel)) + ' · ' + ejuEsc(pageLabel) + printedPage + '（' + pdfNote + page + '/' + problems.length + '）</div>'
    + '<button class="ghost" onclick="ejuRikaGo(1)"' + nextDisabled + '>下一题 →</button>'
    + '</div>'
    + '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px">' + pageButtons + '</div>'
    + '<div style="background:#fff;border:1px solid rgba(124,92,255,.16);border-radius:18px;overflow:hidden;box-shadow:0 10px 28px rgba(105,80,200,.10)">'
    + '<img src="' + ejuEsc(ejuRikaImageSrc(proto, imageRef)) + '" alt="' + ejuEsc(proto.title + ' ' + subj.label + ' ' + pageLabel + printedPage + (isMaterialPage ? ' 資料' : ' 解答 ' + problemLabel)) + '" style="display:block;width:100%;height:auto" />'
    + '</div>'
    + '<div class="eju-question-card" style="margin-top:14px">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:10px">'
    + '<div style="font-weight:950;color:#30294d">作答</div>' + scoreBar + '</div>'
    + '<div style="display:flex;flex-direction:column;gap:8px">' + qHtml + '</div>'
    + '</div>';
}

// =====================================================================
// C. 年份/回数选择 + 题目列表
// =====================================================================

async function loadEjuReadingSets() {
  var renderToken = ejuNextReadingSelectRender();
  ejuNextReadingListRender();
  switchView('eju-reading-select');
  var el = document.getElementById('view-eju-reading-select');
  if (!el) return;
  var mount = el.querySelector('#ejuReadingSelectMount');
  if (!mount) return;
  mount.innerHTML = '<p style="color:#8b86a3;padding:16px 0">加载年份列表…</p>';
  try {
    var data = await ejuFetch('/api/eju-reading-sets');
    if (!ejuIsReadingSelectRenderCurrent(renderToken)) return;
    var sets = data.sets || [];
    if (!sets.length) {
      mount.innerHTML = '<p style="color:#8b86a3">暂无题目，管理员尚未上传题库。</p>';
      return;
    }
    // 按年份分组
    var byYear = {};
    sets.forEach(function(s) {
      if (!byYear[s.year]) byYear[s.year] = [];
      byYear[s.year].push(s.session);
    });
    var html = '<div class="eju-year-grid">';
    Object.keys(byYear).sort(function(a,b){return b-a;}).forEach(function(y) {
      byYear[y].sort().forEach(function(s) {
        html += '<button class="eju-year-card" onclick="loadEjuReadingList(' + y + ',' + s + ')">';
        html += '<strong>' + ejuEsc(y) + ' 年</strong>';
        html += '<span>第 ' + ejuEsc(s) + ' 回</span>';
        html += '</button>';
      });
    });
    html += '</div>';
    mount.innerHTML = html;
  } catch(e) {
    if (!ejuIsReadingSelectRenderCurrent(renderToken)) return;
    if (e.code === 'unauthenticated') {
      mount.innerHTML = '<p style="color:#f05b7b">请先登录账号才能访问题库。</p>';
    } else {
      mount.innerHTML = '<p style="color:#f05b7b">加载失败：' + ejuEsc(e.message) + '</p>';
    }
  }
}

async function loadEjuReadingList(year, session) {
  var renderToken = ejuNextReadingListRender();
  ejuCurrentYear = year;
  ejuCurrentSession = session;
  switchView('eju-reading-list');
  var el = document.getElementById('view-eju-reading-list');
  if (!el) return;
  var title = el.querySelector('#ejuReadingListTitle') || el.querySelector('#ejuListTitle');
  if (title) title.textContent = year + ' 年第 ' + session + ' 回 · 読解題一覧';
  var mount = el.querySelector('#ejuReadingListMount');
  if (!mount) return;
  mount.innerHTML = '<p style="color:#8b86a3;padding:16px 0">加载题目列表…</p>';
  try {
    var data = await ejuFetch('/api/eju-reading-list?year=' + year + '&session=' + session);
    if (!ejuIsReadingListRenderCurrent(renderToken)) return;
    ejuCurrentList = data.questions || [];
    if (!ejuCurrentList.length) {
      mount.innerHTML = '<p style="color:#8b86a3">该年份/回数暂无题目。</p>';
      return;
    }
    var html = '<div style="display:flex;flex-direction:column;gap:10px;margin-top:8px">';
    ejuCurrentList.forEach(function(q, i) {
      var tags = (q.tags || []).map(function(t) {
        return '<span class="pill" style="font-size:11px">' + ejuEsc(t) + '</span>';
      }).join(' ');
      var practiced = q.practiced ? '<span class="pill ok" style="font-size:11px">已练</span>' : '';
      var wrong = q.isWrong ? '<span class="pill due" style="font-size:11px">错题</span>' : '';
      html += '<div class="eju-question-card">';
      html += '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:6px">';
      html += '<span style="font-weight:900;color:#4d4770">第 ' + (q.question_no || (i+1)) + ' 题</span>';
      html += '<div style="display:flex;gap:6px;flex-wrap:wrap">' + practiced + wrong + tags + '</div>';
      html += '</div>';
      html += '<p style="color:#756c9d;font-size:14px;line-height:1.6;margin:0 0 10px">' + ejuEsc(q.questionPreview) + (q.questionPreview && q.questionPreview.length >= 60 ? '…' : '') + '</p>';
      html += '<button class="primary" style="width:100%;padding:10px" onclick="startEjuReadingTrain(\'' + ejuJsString(q.id) + '\')">开始训练</button>';
      html += '</div>';
    });
    html += '</div>';
    mount.innerHTML = html;
  } catch(e) {
    if (!ejuIsReadingListRenderCurrent(renderToken)) return;
    if (e.code === 'unauthenticated') {
      mount.innerHTML = '<p style="color:#f05b7b">请先登录账号才能访问题库。</p>';
    } else {
      mount.innerHTML = '<p style="color:#f05b7b">加载失败：' + ejuEsc(e.message) + '</p>';
    }
  }
}

// =====================================================================
// D. 训练状态机 + 计时器
// =====================================================================

async function startEjuReadingTrain(questionId) {
  // 检查登录
  var token = await ejuGetToken();
  if (!token) {
    if (typeof toast === 'function') toast('请先登录账号，然后再开始训练');
    return;
  }

  switchView('eju-reading-train');
  var mount = document.getElementById('ejuTrainMount');
  if (mount) mount.innerHTML = '<p style="color:#8b86a3;padding:20px 0;text-align:center">加载题目…</p>';

  try {
    var data = await ejuFetch('/api/eju-reading-question?id=' + encodeURIComponent(questionId));
    ejuCurrentQ = data.question;
  } catch(e) {
    if (mount) mount.innerHTML = '<p style="color:#f05b7b">加载失败：' + ejuEsc(e.message) + '</p>';
    return;
  }

  // 重置所有训练状态
  ejuPhase = '';
  ejuElapsed = {};
  ejuStructureType = '';
  ejuSummary = '';
  ejuQuestionType = '';
  ejuEvidence = '';
  ejuSelectedAnswer = '';
  ejuSubmitted = false;
  ejuPaused = false;

  // 进入第一阶段
  ejuGoPhase('structure');
}

function ejuGoPhase(phase) {
  ejuStopTimer();
  if (ejuPhaseStartTime > 0) {
    // 保存上一阶段耗时
    ejuElapsed[ejuPhase] = Math.round((Date.now() - ejuPhaseStartTime) / 1000);
  }
  ejuPhase = phase;
  ejuPhaseStartTime = Date.now();
  ejuPaused = false;
  renderEjuTrain();
  if (EJU_PHASE_DURATIONS[phase] > 0) {
    ejuStartTimer(EJU_PHASE_DURATIONS[phase]);
  }
}

function ejuAdvancePhase() {
  var order = ['structure', 'questionRead', 'locate', 'answer'];
  var idx = order.indexOf(ejuPhase);
  if (idx >= 0 && idx < order.length - 1) {
    // 保存当前阶段用户输入
    ejuSavePhaseInput();
    ejuGoPhase(order[idx + 1]);
  } else if (ejuPhase === 'answer') {
    ejuHandleSubmit(false);
  }
}

function ejuSavePhaseInput() {
  var phase = ejuPhase;
  if (phase === 'structure') {
    var stEl = document.getElementById('ejuStructureTypeInput');
    if (stEl) ejuStructureType = stEl.value || '';
    var sumEl = document.getElementById('ejuSummaryInput');
    if (sumEl) ejuSummary = sumEl.value || '';
  } else if (phase === 'questionRead') {
    var qtEl = document.getElementById('ejuQuestionTypeInput');
    if (qtEl) ejuQuestionType = qtEl.value || '';
  } else if (phase === 'locate') {
    var evEl = document.getElementById('ejuEvidenceInput');
    if (evEl) ejuEvidence = evEl.value || '';
  }
}

function renderEjuTrain() {
  var mount = document.getElementById('ejuTrainMount');
  if (!mount || !ejuCurrentQ) return;

  var q = ejuCurrentQ;
  var phaseLabels = {
    structure: '①骨架判断',
    questionRead: '②读题干',
    locate: '③定位根据',
    answer: '④选择答案'
  };
  var phaseOrder = ['structure', 'questionRead', 'locate', 'answer'];

  // Phase bar
  var phaseBarHtml = '<div class="eju-phase-bar">';
  phaseOrder.forEach(function(p, i) {
    var cls = 'eju-phase-step';
    var idx = phaseOrder.indexOf(ejuPhase);
    if (i < idx) cls += ' done';
    else if (i === idx) cls += ' active';
    phaseBarHtml += '<div class="' + cls + '">' + ejuEsc(phaseLabels[p]) + '</div>';
  });
  phaseBarHtml += '</div>';

  // Timer
  var total = EJU_PHASE_DURATIONS[ejuPhase] || 0;
  var pct = total > 0 ? Math.max(0, Math.min(100, Math.round(ejuSeconds / total * 100))) : 0;
  var timerCls = 'eju-timer';
  if (total > 0 && ejuSeconds <= Math.floor(total * 0.25)) timerCls += ' danger';
  else if (total > 0 && ejuSeconds <= Math.floor(total * 0.5)) timerCls += ' warn';
  var timerHtml = total > 0
    ? '<div class="' + timerCls + '" id="ejuTimerDisplay">'
      + '<div class="eju-timer-ring"><svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="none" stroke="rgba(124,92,255,.12)" stroke-width="4"/><circle cx="20" cy="20" r="17" fill="none" stroke="currentColor" stroke-width="4" stroke-dasharray="' + Math.round(2*Math.PI*17) + '" stroke-dashoffset="' + Math.round(2*Math.PI*17*(1-pct/100)) + '" transform="rotate(-90 20 20)"/></svg></div>'
      + '<span class="eju-timer-num" id="ejuTimerNum">' + ejuSeconds + '</span>'
      + (ejuPaused ? '<span class="eju-timer-label">已暂停</span>' : '')
      + '</div>'
    : '';

  // 阶段内容
  var contentHtml = '';
  if (ejuPhase === 'structure') {
    contentHtml = '<div class="eju-passage" id="ejuPassageEl">' + ejuEsc(q.passage) + '</div>'
      + '<div style="margin-top:14px">'
      + '<label style="font-size:13px;color:#8178a4;font-weight:700;display:block;margin-bottom:6px">文章类型（骨架判断）</label>'
      + '<select id="ejuStructureTypeInput" style="margin-bottom:10px">'
      + '<option value="">— 请选择 —</option>'
      + EJU_STRUCTURE_TYPES.map(function(t) {
          return '<option value="' + ejuEsc(t) + '"' + (ejuStructureType===t?' selected':'') + '>' + ejuEsc(t) + '</option>';
        }).join('')
      + '</select>'
      + '<label style="font-size:13px;color:#8178a4;font-weight:700;display:block;margin-bottom:6px">一句话概括文章大意（可选）</label>'
      + '<textarea id="ejuSummaryInput" placeholder="简要描述文章主旨…" style="min-height:60px">' + ejuEsc(ejuSummary) + '</textarea>'
      + '</div>';
  } else if (ejuPhase === 'questionRead') {
    contentHtml = '<div class="eju-passage" style="max-height:120px" id="ejuPassageEl">' + ejuEsc(q.passage) + '</div>'
      + '<div style="margin-top:14px;padding:16px;background:rgba(124,92,255,.06);border-radius:18px;border:1px solid rgba(124,92,255,.14)">'
      + '<div style="font-size:13px;color:#8b86a3;font-weight:700;margin-bottom:8px">题干</div>'
      + '<div style="font-weight:850;color:#30294d;line-height:1.7">' + ejuEsc(q.question) + '</div>'
      + '</div>'
      + '<div style="margin-top:14px">'
      + '<label style="font-size:13px;color:#8178a4;font-weight:700;display:block;margin-bottom:6px">题型判断</label>'
      + '<select id="ejuQuestionTypeInput">'
      + '<option value="">— 请选择 —</option>'
      + EJU_QUESTION_TYPES.map(function(t) {
          return '<option value="' + ejuEsc(t) + '"' + (ejuQuestionType===t?' selected':'') + '>' + ejuEsc(t) + '</option>';
        }).join('')
      + '</select>'
      + '</div>';
  } else if (ejuPhase === 'locate') {
    contentHtml = '<div class="eju-passage" id="ejuPassageEl">' + ejuEsc(q.passage) + '</div>'
      + '<div style="margin-top:14px;padding:14px;background:rgba(124,92,255,.06);border-radius:16px;border:1px solid rgba(124,92,255,.12);color:#756c9d;font-size:14px;line-height:1.65">'
      + '<b style="color:#4d4770">题干：</b>' + ejuEsc(q.question)
      + '</div>'
      + '<div style="margin-top:12px">'
      + '<label style="font-size:13px;color:#8178a4;font-weight:700;display:block;margin-bottom:6px">定位根据句（从文章中找到关键语句粘贴到这里）</label>'
      + '<textarea id="ejuEvidenceInput" placeholder="将你认为是答题根据的文章原文粘贴或输入到这里…" style="min-height:80px">' + ejuEsc(ejuEvidence) + '</textarea>'
      + '</div>';
  } else if (ejuPhase === 'answer') {
    var opts = q.options || {};
    contentHtml = '<div style="margin-bottom:12px;padding:14px;background:rgba(124,92,255,.06);border-radius:16px;border:1px solid rgba(124,92,255,.12)">'
      + '<div style="font-size:13px;color:#8b86a3;font-weight:700;margin-bottom:6px">题目</div>'
      + '<div style="font-weight:850;color:#30294d;line-height:1.7">' + ejuEsc(q.question) + '</div>'
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:10px">';
    ['1','2','3','4'].forEach(function(k) {
      if (!opts[k]) return;
      var sel = ejuSelectedAnswer === k;
      contentHtml += '<button class="eju-option' + (sel?' selected':'') + '" onclick="ejuSelectAnswer(\'' + ejuJsString(k) + '\')">'
        + '<span style="font-weight:900;min-width:22px;display:inline-block">(' + k + ')</span> '
        + ejuEsc(opts[k])
        + '</button>';
    });
    contentHtml += '</div>';
  }

  // 操作按钮
  var isLast = ejuPhase === 'answer';
  var btnHtml = '<div style="display:flex;gap:10px;margin-top:18px;flex-wrap:wrap">'
    + (ejuPaused
        ? '<button class="primary" onclick="ejuTogglePause()">继续</button>'
        : '<button class="ghost" onclick="ejuTogglePause()">暂停</button>')
    + '<button class="primary" style="flex:1" onclick="ejuAdvancePhase()">'
    + (isLast ? '提交答案' : '下一阶段')
    + '</button>'
    + '</div>';

  // 来源信息
  var metaHtml = '<div style="font-size:12px;color:#9086ac;margin-bottom:10px">'
    + ejuEsc(q.source || '') + (q.question_no ? ' · 第 '+q.question_no+' 题' : '')
    + '</div>';

  mount.innerHTML = phaseBarHtml
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin:12px 0 6px">'
    + '<div style="font-weight:900;color:#5a3df0;font-size:15px">' + ejuEsc(phaseLabels[ejuPhase] || '') + '</div>'
    + timerHtml
    + '</div>'
    + metaHtml
    + contentHtml
    + btnHtml;
}

function ejuSelectAnswer(key) {
  ejuSelectedAnswer = key;
  // 更新选项高亮（不重新渲染整个页面，避免清空输入）
  document.querySelectorAll('.eju-option').forEach(function(btn) {
    btn.classList.remove('selected');
  });
  var btns = document.querySelectorAll('.eju-option');
  var opts = (ejuCurrentQ && ejuCurrentQ.options) ? ejuCurrentQ.options : {};
  var k = 0;
  ['1','2','3','4'].forEach(function(num) {
    if (!opts[num]) return;
    if (btns[k]) {
      if (num === key) btns[k].classList.add('selected');
    }
    k++;
  });
}

function ejuTogglePause() {
  ejuPaused = !ejuPaused;
  if (ejuPaused) {
    ejuStopTimer();
  } else {
    ejuStartTimer(ejuSeconds);
  }
  // 只更新按钮区域
  var mount = document.getElementById('ejuTrainMount');
  if (mount) {
    var btnArea = mount.querySelector('[data-eju-buttons]');
    if (!btnArea) {
      // 重新渲染（只有第一次需要）
      renderEjuTrain();
      return;
    }
  }
  renderEjuTrain();
}

async function ejuHandleSubmit(timedOut) {
  if (ejuSubmitted) return;
  if (!timedOut && !ejuSelectedAnswer) {
    if (typeof toast === 'function') toast('请先选择一个答案');
    return;
  }
  ejuSubmitted = true;
  ejuStopTimer();
  ejuSavePhaseInput();

  // 记录最后阶段耗时
  ejuElapsed[ejuPhase] = Math.round((Date.now() - ejuPhaseStartTime) / 1000);

  var totalElapsed = Object.values(ejuElapsed).reduce(function(a, b) { return a + b; }, 0);

  var mount = document.getElementById('ejuTrainMount');
  if (mount) mount.innerHTML = '<p style="color:#8b86a3;text-align:center;padding:20px 0">提交中…</p>';

  try {
    var data = await ejuFetch('/api/eju-reading-submit', {
      method: 'POST',
      body: JSON.stringify({
        questionId: ejuCurrentQ.id,
        selectedAnswer: ejuSelectedAnswer || '0',
        phases: {
          structure: { elapsed: ejuElapsed.structure || 0, structureType: ejuStructureType, summary: ejuSummary },
          questionRead: { elapsed: ejuElapsed.questionRead || 0, questionType: ejuQuestionType },
          locate: { elapsed: ejuElapsed.locate || 0, evidence: ejuEvidence },
          answer: { elapsed: ejuElapsed.answer || 0, selectedAnswer: ejuSelectedAnswer || '0' }
        },
        totalElapsed: totalElapsed
      })
    });
    renderEjuResult(data.isCorrect, data.correctAnswer, data.explanation, data.recordId);
  } catch(e) {
    if (mount) mount.innerHTML = '<p style="color:#f05b7b">提交失败：' + ejuEsc(e.message) + '。<br><button class="ghost" style="margin-top:12px" onclick="ejuSubmitted=false;ejuHandleSubmit(false)">重试</button></p>';
  }
}

// =====================================================================
// Timer
// =====================================================================

function ejuStartTimer(secs) {
  ejuStopTimer();
  ejuSeconds = secs;
  ejuUpdateTimerDisplay();
  ejuTimerInterval = setInterval(ejuTickTimer, 1000);
}

function ejuStopTimer() {
  if (ejuTimerInterval) {
    clearInterval(ejuTimerInterval);
    ejuTimerInterval = null;
  }
}

function ejuTickTimer() {
  if (ejuPaused) return;
  ejuSeconds -= 1;
  if (ejuSeconds <= 0) {
    ejuSeconds = 0;
    ejuStopTimer();
    ejuUpdateTimerDisplay();
    // 超时自动进入下一阶段
    if (ejuPhase === 'answer') {
      ejuHandleSubmit(true);
    } else {
      ejuAdvancePhase();
    }
    return;
  }
  ejuUpdateTimerDisplay();
}

function ejuUpdateTimerDisplay() {
  var numEl = document.getElementById('ejuTimerNum');
  if (numEl) numEl.textContent = ejuSeconds;

  // 更新 SVG ring
  var timerEl = document.getElementById('ejuTimerDisplay');
  if (timerEl) {
    var total = EJU_PHASE_DURATIONS[ejuPhase] || 1;
    var pct = Math.max(0, Math.min(100, Math.round(ejuSeconds / total * 100)));
    var circle = timerEl.querySelector('circle:last-child');
    if (circle) {
      var dashLen = Math.round(2 * Math.PI * 17);
      circle.setAttribute('stroke-dashoffset', Math.round(dashLen * (1 - pct/100)));
    }
    // 颜色状态
    timerEl.className = 'eju-timer';
    if (ejuSeconds <= Math.floor(total * 0.25)) timerEl.classList.add('danger');
    else if (ejuSeconds <= Math.floor(total * 0.5)) timerEl.classList.add('warn');
  }
}

// =====================================================================
// E. 结果页
// =====================================================================

function renderEjuResult(isCorrect, correctAnswer, explanation, recordId) {
  switchView('eju-reading-result');
  var mount = document.getElementById('ejuResultMount');
  if (!mount) return;

  var q = ejuCurrentQ || {};
  var opts = q.options || {};

  var statusIcon = isCorrect ? '✅' : '❌';
  var statusText = isCorrect ? '回答正确！' : '回答错误';
  var statusColor = isCorrect ? 'var(--green)' : 'var(--red)';

  // 各阶段耗时
  var phaseRows = [
    { key: 'structure', label: '①骨架判断', input: ejuStructureType ? ('类型：' + ejuStructureType) : '' },
    { key: 'questionRead', label: '②读题干', input: ejuQuestionType ? ('题型：' + ejuQuestionType) : '' },
    { key: 'locate', label: '③定位根据', input: ejuEvidence ? ejuEvidence.slice(0,40)+'…' : '' },
    { key: 'answer', label: '④选择答案', input: ejuSelectedAnswer ? ('选了 ('+ejuSelectedAnswer+')' + (opts[ejuSelectedAnswer]?' '+opts[ejuSelectedAnswer].slice(0,20)+'…':'')) : '' }
  ];

  var phaseHtml = '<div style="display:flex;flex-direction:column;gap:8px;margin-top:14px">';
  phaseRows.forEach(function(row) {
    phaseHtml += '<div class="eju-score-row">'
      + '<span class="eju-score-label">' + ejuEsc(row.label) + '</span>'
      + '<span class="eju-score-time">' + ejuFormatSec(ejuElapsed[row.key] || 0) + '</span>'
      + (row.input ? '<span class="eju-score-input">' + ejuEsc(row.input) + '</span>' : '')
      + '</div>';
  });
  phaseHtml += '</div>';

  // 正确答案区
  var ansHtml = '<div style="margin-top:16px;padding:16px;border-radius:18px;background:rgba(32,180,134,.08);border:1px solid rgba(32,180,134,.22)">'
    + '<div style="font-size:13px;color:#20b486;font-weight:800;margin-bottom:8px">正确答案：(' + ejuEsc(correctAnswer) + ')</div>'
    + '<div style="color:#30294d;line-height:1.7">' + ejuEsc((opts[correctAnswer] || '')) + '</div>'
    + (explanation ? '<div style="margin-top:10px;font-size:13px;color:#756c9d;line-height:1.65">' + ejuEsc(explanation) + '</div>' : '')
    + '</div>';

  var html = '<div style="text-align:center;padding:20px 0 12px">'
    + '<div style="font-size:48px;margin-bottom:8px">' + statusIcon + '</div>'
    + '<div style="font-size:24px;font-weight:950;color:' + statusColor + ';letter-spacing:-.03em">' + ejuEsc(statusText) + '</div>'
    + '<div style="color:#8b86a3;font-size:14px;margin-top:6px">' + ejuEsc(q.source||'') + (q.question_no?' · 第'+q.question_no+'题':'') + '</div>'
    + '</div>'
    + ansHtml
    + '<div style="margin-top:16px"><h3 style="margin:0 0 4px;font-size:16px">各阶段用时</h3>'
    + phaseHtml + '</div>'
    + '<div id="ejuAiAnalysisMount" style="margin-top:16px"></div>'
    + '<div style="display:flex;gap:10px;margin-top:20px;flex-wrap:wrap">'
    + '<button class="ghost" style="flex:1" onclick="switchView(\'eju-reading-list\')">返回题目列表</button>'
    + '<button class="primary" style="flex:1" onclick="startEjuReadingTrain(\'' + ejuJsString(q.id || '') + '\')">重新练习</button>'
    + '</div>';

  mount.innerHTML = html;
}

// =====================================================================
// F. 历史记录
// =====================================================================

async function loadEjuHistory() {
  var mount = document.getElementById('ejuHistoryMount');
  if (!mount) return;
  mount.innerHTML = '<p style="color:#8b86a3;padding:16px 0">加载记录…</p>';
  try {
    var data = await ejuFetch('/api/eju-reading-history');
    var records = data.records || [];
    if (!records.length) {
      mount.innerHTML = '<div class="empty-message"><div class="empty-icon">📋</div><b>暂无训练记录</b><p>开始训练后，记录会出现在这里。</p></div>';
      return;
    }
    var html = '<div style="display:flex;flex-direction:column;gap:10px">';
    records.forEach(function(r) {
      var icon = r.isCorrect ? '✅' : '❌';
      var date = r.timestamp ? new Date(r.timestamp).toLocaleDateString('zh-CN') : '';
      html += '<div class="eju-question-card" style="display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center">'
        + '<div>'
        + '<div style="font-size:13px;color:#9086ac;margin-bottom:4px">' + ejuEsc(r.source||'') + ' · 第' + (r.questionNo||'?') + '题 · ' + ejuEsc(date) + '</div>'
        + '<div style="font-size:14px;color:#4d4770;line-height:1.6">' + ejuEsc(r.questionPreview || '') + '</div>'
        + '</div>'
        + '<div style="text-align:right">'
        + '<div style="font-size:20px">' + icon + '</div>'
        + '<div style="font-size:12px;color:#9086ac">' + ejuFormatSec(r.totalElapsed) + '</div>'
        + '<button class="ghost" style="margin-top:6px;padding:6px 10px;font-size:12px" onclick="startEjuReadingTrain(\'' + ejuJsString(r.questionId) + '\')">重练</button>'
        + '</div>'
        + '</div>';
    });
    html += '</div>';
    mount.innerHTML = html;
  } catch(e) {
    if (e.code === 'unauthenticated') {
      mount.innerHTML = '<p style="color:#f05b7b">请先登录账号。</p>';
    } else {
      mount.innerHTML = '<p style="color:#f05b7b">加载失败：' + ejuEsc(e.message) + '</p>';
    }
  }
}

function runEjuTests() {
  var sampleData = {
    sets: [
      { subject: 'humanities' },
      { subject: 'math1' }
    ]
  };
  console.assert(ejuHasScanSubject('humanities', sampleData) === true, 'EJU scanned subject lookup should find humanities');
  console.assert(ejuHasScanSubject('science', sampleData) === false, 'EJU scanned subject lookup should reject missing science data');

  var selectToken = ejuNextReadingSelectRender();
  console.assert(ejuIsReadingSelectRenderCurrent(selectToken) === true, 'EJU select render token should start current');
  ejuNextReadingSelectRender();
  console.assert(ejuIsReadingSelectRenderCurrent(selectToken) === false, 'EJU select render token should reject stale writes');

  var listToken = ejuNextReadingListRender();
  console.assert(ejuIsReadingListRenderCurrent(listToken) === true, 'EJU list render token should start current');
  ejuNextReadingListRender();
  console.assert(ejuIsReadingListRenderCurrent(listToken) === false, 'EJU list render token should reject stale writes');

  // 理科 proto 完整性：三科题数 19/20/18，每题 1<=ans<=opts，page 必须在 pages 内
  var rika = EJU_RIKA_PROTOTYPES['science/2023-1'];
  console.assert(!!rika, 'EJU rika sample science/2023-1 should exist');
  if (rika) {
    var expectCount = { physics: 19, chemistry: 20, biology: 18 };
    rika.subjects.forEach(function(s) {
      console.assert(s.questions.length === expectCount[s.id], 'EJU rika ' + s.id + ' should have ' + expectCount[s.id] + ' questions');
      s.questions.forEach(function(q) {
        console.assert(q.ans >= 1 && q.ans <= q.opts, 'EJU rika ' + s.id + ' no=' + q.no + ' ans must be within opts');
        console.assert(s.pages.indexOf(q.page) >= 0, 'EJU rika ' + s.id + ' no=' + q.no + ' page must be in pages[]');
      });
      ejuRikaProblemList(s).forEach(function(problem) {
        var qs = ejuRikaProblemQuestions(s, problem);
        console.assert(qs.length > 0, 'EJU rika ' + s.id + ' problem should have answers');
      });
    });
    var chemistry = ejuRikaGetSubject(rika, 'chemistry');
    var biology = ejuRikaGetSubject(rika, 'biology');
    console.assert(ejuRikaProblemLabel(chemistry, chemistry.problems[10]) === '11', 'EJU chemistry page 34 first split should be answer 11');
    console.assert(ejuRikaProblemLabel(chemistry, chemistry.problems[11]) === '12', 'EJU chemistry page 34 second split should be answer 12');
    console.assert(ejuRikaProblemLabel(biology, biology.problems[1]) === '2·3', 'EJU biology question 2 should keep answers 2 and 3 together');
    console.assert(ejuRikaProblemLabel(biology, biology.problems[2]) === '4', 'EJU biology page 45 first split should be answer 4');
    console.assert(ejuRikaProblemLabel(biology, biology.problems[3]) === '5', 'EJU biology page 45 second split should be answer 5');
  }

  // 综合科目 proto 完整性：38 题全 4 択，番号 1-38 连续，每题 page 必须在 pages 内，含 2 张材料页
  var sogo = ejuRikaProtoFor('humanities/2024-1');
  console.assert(!!sogo && sogo.pageLabel === '総合科目-', 'EJU sogo humanities/2024-1 should exist with 総合科目- label');
  if (sogo) {
    var sogoSubj = sogo.subjects[0];
    console.assert(sogo.subjects.length === 1, 'EJU sogo should be single-subject');
    console.assert(sogoSubj.questions.length === 38, 'EJU sogo should have 38 answer numbers');
    sogoSubj.questions.forEach(function(q, i) {
      console.assert(q.no === i + 1, 'EJU sogo answer numbers must be 1..38 contiguous');
      console.assert(q.opts === 4 && q.ans >= 1 && q.ans <= 4, 'EJU sogo no=' + q.no + ' must be 4択 with ans 1-4');
      console.assert(sogoSubj.pages.indexOf(q.page) >= 0, 'EJU sogo no=' + q.no + ' page must be in pages[]');
    });
    // 含 p3/p7 材料页后题屏从 25 → 27；p3/p7 为无作答材料页
    var sogoProblems = ejuRikaProblemList(sogoSubj);
    console.assert(sogoProblems.length === 27, 'EJU sogo should split into 27 problem screens (incl. 2 material pages)');
    var materialPages = sogoProblems.filter(function(p) { return ejuRikaProblemQuestions(sogoSubj, p).length === 0; });
    console.assert(materialPages.length === 2, 'EJU sogo should have exactly 2 material screens (p3 問1, p7 問2)');
    console.assert(sogoSubj.pages.indexOf(3) >= 0 && sogoSubj.pages.indexOf(7) >= 0, 'EJU sogo pages must include material pages 3 and 7');
    console.assert(sogoProblems[0].page === 3 && sogoProblems[4].page === 7, 'EJU sogo material pages must sit before their sub-questions (p3 first, p7 5th)');
  }
}

runEjuTests();

/* ===== EJU MODULE END ===== */
