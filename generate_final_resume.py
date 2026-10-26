import os
import subprocess
import pypdfium2 as pdfium
import pypdf

base_dir = os.path.dirname(os.path.abspath(__file__))
assets_dir = os.path.join(base_dir, 'assets')
os.makedirs(assets_dir, exist_ok=True)

html_file = os.path.join(base_dir, 'resume_source.html')
pdf_target = os.path.join(assets_dir, 'Arjun_Balpande_Resume_Updated.pdf')
edge_path = r'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe'

html_content = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Arjun Balpande - Resume</title>
<style>
  @page {
    size: 8.5in 14in; /* US Legal matching original 612x1008 pt */
    margin: 0.5in 0.6in 0.5in 0.6in;
  }
  * {
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body {
    margin: 0;
    padding: 0;
    font-family: 'Cambria', serif;
    font-size: 11pt;
    line-height: 1.34;
    color: #000000;
    background: #ffffff;
  }
  .header-name {
    font-family: 'Calibri', sans-serif;
    font-size: 26pt;
    font-weight: 400;
    color: #17365d;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 2px 0;
    line-height: 1.1;
  }
  .header-line {
    height: 1.2px;
    background-color: #4f81bd;
    width: 100%;
    margin-bottom: 10px;
  }
  .header-subtitle {
    font-family: 'Cambria', serif;
    font-size: 11pt;
    color: #000000;
    text-transform: uppercase;
    margin: 0 0 14px 0;
  }
  .section-title {
    font-family: 'Calibri', sans-serif;
    font-size: 14pt;
    font-weight: bold;
    color: #365f91;
    text-transform: uppercase;
    margin-top: 14px;
    margin-bottom: 5px;
    letter-spacing: 0.3px;
  }
  .section-title:first-of-type {
    margin-top: 0;
  }
  p {
    margin: 0 0 6px 0;
  }
  .entry-title {
    font-family: 'Cambria', serif;
    font-size: 11pt;
    font-weight: normal;
    color: #000000;
    margin-bottom: 2px;
  }
  .entry-subtitle {
    font-family: 'Cambria', serif;
    font-size: 11pt;
    font-weight: normal;
    color: #000000;
    margin-bottom: 6px;
  }
  .bullet-list {
    margin: 2px 0 6px 0;
    padding-left: 0;
    list-style: none;
  }
  .bullet-list li {
    position: relative;
    padding-left: 14px;
    margin-bottom: 2px;
  }
  .bullet-list li::before {
    content: "-";
    position: absolute;
    left: 0;
    top: 0;
  }
  .tech-line {
    font-style: normal;
    margin-bottom: 2px;
  }
  .project-item {
    margin-bottom: 8px;
  }
  a {
    color: #17365d;
    text-decoration: underline;
  }
  .skill-group {
    margin-bottom: 3px;
  }
  .page-break {
    page-break-before: always;
    break-before: page;
    padding-top: 5px;
  }
</style>
</head>
<body>

  <!-- PAGE 1 -->
  <!-- HEADER -->
  <div class="header-name">ARJUN BALPANDE</div>
  <div class="header-line"></div>
  <div class="header-subtitle">CSE STUDENT</div>

  <!-- PROFESSIONAL SUMMARY -->
  <div class="section-title">PROFESSIONAL SUMMARY</div>
  <p>
    I am a motivated and detail-oriented Computer Engineering student with a strong foundation in programming,
    software development, and problem-solving. Proficient in languages such as HTML, CSS, JavaScript, C, and Python,
    with hands-on experience in full-stack web development, machine learning, agentic AI workflows, and database
    management. I aim to apply my technical knowledge, learn new technologies, and contribute to innovative software solutions.
  </p>

  <!-- EDUCATION -->
  <div class="section-title">EDUCATION</div>
  <div class="entry-title">Bachelor of Technology, Computer Science, Expected in 06/2028</div>
  <div class="entry-subtitle">SYMBIOSIS INSTITUTE OF TECHNOLOGY - Nagpur, India</div>

  <div class="entry-title">Senior Secondary School, STUDENT, 04/2024</div>
  <div class="entry-subtitle">ST. PAUL SCHOOL - Nagpur</div>

  <div class="entry-title">No Degree, STUDENT, 04/2022</div>
  <div class="entry-subtitle">BHAVAN'S BP VIDYA MANDIR - Nagpur, India</div>

  <!-- INTERNSHIP EXPERIENCE -->
  <div class="section-title">INTERNSHIP EXPERIENCE</div>
  
  <div class="project-item">
    <div class="entry-title">Full Stack Web Development Intern, 05/2026 – 06/2026</div>
    <div class="entry-subtitle">SYTEOS LABS LLP - Pune, India (Remote)</div>
    <ul class="bullet-list">
      <li>Designed and developed responsive, accessible web interfaces adhering to modern UI/UX design standards.</li>
      <li>Implemented backend service endpoints, data persistence schemas, and database connectivity for seamless data flow.</li>
      <li>Gained practical exposure to industry-standard software engineering workflows and collaboration under CTO mentorship.</li>
    </ul>
  </div>

  <div class="project-item">
    <div class="entry-title">Python Developer Intern, 03/2026 – 04/2026</div>
    <div class="entry-subtitle">KODBUD - Remote</div>
    <ul class="bullet-list">
      <li>Developed and tested 4 modular Python CLI applications: Contact Book, Password Checker, Calculator, and Number Guessing Game.</li>
      <li>Implemented structured function design, robust input validation, exception handling, and clean code principles.</li>
    </ul>
  </div>

  <!-- SKILLS -->
  <div class="section-title">SKILLS</div>
  <p class="skill-group">Programming Languages: Python, C, C++, Basics of Java</p>
  <p class="skill-group">Web Technologies: HTML5, CSS3, JavaScript (ES6+), REST APIs</p>
  <p class="skill-group">AI & Machine Learning: TensorFlow, Keras, OpenCV, Scikit-learn, Pandas, NumPy, Matplotlib, Seaborn, LSTM Networks</p>
  <p class="skill-group">Agentic AI & Automation: OpenAI Agents SDK, Groq API (LLaMA 3.3, GPT-OSS-120B), Tavily AI Search, LangChain Core, Telegram Bot API</p>
  <p class="skill-group">Databases & Tools: MySQL, SQL, Git, GitHub, Linux/Bash, Gradio, Jupyter Notebooks</p>

  <!-- LANGUAGES -->
  <div class="section-title">LANGUAGES</div>
  <p>English - Intermediate (B1)</p>
  <p>Hindi - Intermediate (B1)</p>
  <p>Marathi - Intermediate (B1)</p>
  <p>German - Beginner (A1)</p>

  <!-- CERTIFICATIONS -->
  <div class="section-title">CERTIFICATIONS</div>
  <p>Infosys Springboard Data Structures and Algorithms using Python</p>
  <p>Red Hat Training Presents – Introduction to Python Programming (AD141)</p>
  <p>Red Hat Training – Red Hat System Administration I (RH124)</p>
  <p>Red Hat Training – Network Automation with Red Hat Ansible (DO457)</p>
  <p>Udemy – Mastering Agentic AI: From Prompt to Protocols to Production</p>

  <!-- PAGE BREAK FOR PAGE 2 -->
  <div class="page-break"></div>

  <!-- PAGE 2: PROJECTS & CONTACT -->
  <div class="section-title">PROJECTS</div>

  <div class="project-item">
    <div class="entry-title">Agentic AI</div>
    <div class="tech-line">Python, OpenAI Agents SDK, Groq API (LLaMA 3.3), Tavily AI Search, LangChain Core, Asyncio</div>
    <ul class="bullet-list">
      <li>Architected an autonomous multi-agent research workflow coordinating sequential Planner, Search, Analyst, and Writer agents to generate synthesized reports.</li>
      <li>Implemented a real-time fact-checking agent using OpenAI Agents SDK with Groq API integration and Tavily web-search tool execution.</li>
      <li>GitHub: <a href="https://github.com/arjunabalpande06/Agentic_AI">https://github.com/arjunabalpande06/Agentic_AI</a></li>
    </ul>
  </div>

  <div class="project-item">
    <div class="entry-title">Student Deadline Reminder Automation</div>
    <div class="tech-line">Python, Gradio, Groq API (GPT-OSS-120B), Telegram Bot API, Asyncio, JSON Persistence</div>
    <ul class="bullet-list">
      <li>Built a Gradio web application featuring an LLM-powered natural language task assistant that extracts assignment names, deadlines, and categories.</li>
      <li>Engineered an automated background deadline monitoring service dispatching scheduled notifications and same-day alerts via Telegram.</li>
      <li>GitHub: <a href="https://github.com/arjunabalpande06/Student_Deadline_Reminder_Automation">https://github.com/arjunabalpande06/Student_Deadline_Reminder_Automation</a></li>
    </ul>
  </div>

  <div class="project-item">
    <div class="entry-title">Smart Grid Energy Forecasting Using ML</div>
    <div class="tech-line">Python, TensorFlow, Keras, LSTM Networks, XGBoost Regressor, Scikit-learn, Gradio Web UI</div>
    <ul class="bullet-list">
      <li>Engineered comparative regression and deep learning pipelines forecasting micro-scale household power consumption (~2M rows) and national grid demand.</li>
      <li>Trained sequence-based LSTM recurrent neural networks and gradient boosting models; integrated a local Gradio UI for real-time inference on test data sequences.</li>
      <li>GitHub: <a href="https://github.com/arjunabalpande06/Smart_Grid_Energy_Forecasting_Using_ML">https://github.com/arjunabalpande06/Smart_Grid_Energy_Forecasting_Using_ML</a></li>
    </ul>
  </div>

  <div class="project-item">
    <div class="entry-title">Image Detection using R-CNN</div>
    <div class="tech-line">Python, TensorFlow, OpenCV</div>
    <ul class="bullet-list">
      <li>Conducted research on object detection using R-CNN architecture for image localization and classification.</li>
      <li>Designed and trained a deep learning model achieving accurate multi-object detection.</li>
    </ul>
  </div>

  <div class="project-item">
    <div class="entry-title">Customer Segmentation using Python (Patent Published)</div>
    <div class="tech-line">Python, Scikit-learn, Pandas</div>
    <ul class="bullet-list">
      <li>Performed research-based customer segmentation using K-Means clustering on behavioral datasets.</li>
      <li>Identified key customer groups for targeted marketing; work resulted in a published patent (Application No. 202521127272).</li>
    </ul>
  </div>

  <div class="project-item">
    <div class="entry-title">PYTHON:</div>
    <ul class="bullet-list">
      <li>Basic Bank Management System - Features account creation, balance inquiry, deposit/withdrawal validation, and file-based data persistence.</li>
    </ul>
    <div class="entry-title">C:</div>
    <ul class="bullet-list">
      <li>TIC-TAC-TOE game - Console game in C featuring procedural game loop, dynamic 3x3 matrix board rendering, and win/draw evaluations.</li>
    </ul>
  </div>

  <!-- CONTACT -->
  <div class="section-title">CONTACT</div>
  <p>Address: Nagpur, IN 440010</p>
  <p>Phone: 8010871941</p>
  <p>Email: <a href="mailto:arjunbalpande@gmail.com">arjunbalpande@gmail.com</a></p>
  <p>GitHub: <a href="https://github.com/arjunabalpande06">https://github.com/arjunabalpande06</a></p>
  <p>LinkedIn: <a href="https://www.linkedin.com/in/arjun-balpande-0a5114320/">https://www.linkedin.com/in/arjun-balpande-0a5114320/</a></p>
  <p>Portfolio: <a href="https://portfolio-kappa-fawn-aqhlu6pxji.vercel.app/">https://portfolio-kappa-fawn-aqhlu6pxji.vercel.app/</a></p>

</body>
</html>
"""

with open(html_file, 'w', encoding='utf-8') as f:
    f.write(html_content)

cmd = [
    edge_path,
    '--headless',
    '--disable-gpu',
    f'--print-to-pdf={pdf_target}',
    '--no-pdf-header-footer',
    html_file
]
subprocess.run(cmd, check=True)

# Verify generated PDF
reader = pypdf.PdfReader(pdf_target)
print(f'Successfully generated {pdf_target}')
print(f'Total pages: {len(reader.pages)}')
for i, page in enumerate(reader.pages):
    print(f'Page {i+1} mediabox: {page.mediabox}')
    annots = page.get('/Annots')
    print(f'Page {i+1} link annotations: {len(annots) if annots else 0}')

print('Done.')
