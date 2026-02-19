import type { ResumeData } from "@/lib/agents/resumeDataExtractor";

export const JAKE_TEMPLATE_META = {
  id: "jake",
  name: "Jake's Resume",
  description:
    "A popular ATS-friendly template based on Jake Gutierrez's resume with custom LaTeX commands for clean formatting.",
} as const;

const PREAMBLE = `%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}`;

function escapeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/&/g, "\\&")
    .replace(/%/g, "\\%")
    .replace(/\$/g, "\\$")
    .replace(/#/g, "\\#")
    .replace(/_/g, "\\_")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

function e(text: string | undefined): string {
  return escapeLatex(text ?? "");
}

function buildHeading(data: ResumeData): string {
  const parts: string[] = [];

  if (data.phone) parts.push(e(data.phone));
  if (data.email)
    parts.push(
      `\\href{mailto:${e(data.email)}}{\\underline{${e(data.email)}}}`
    );
  for (const link of data.links ?? []) {
    parts.push(`\\href{${e(link.url)}}{\\underline{${e(link.label)}}}`);
  }

  return `\\begin{center}
    \\textbf{\\Huge \\scshape ${e(data.name)}} \\\\ \\vspace{1pt}
    \\small ${parts.join(" $|$ ")}
\\end{center}`;
}

function buildEducation(data: ResumeData): string {
  if (!data.education?.length) return "";

  const entries = data.education
    .map((edu) => {
      const degree = [edu.degree, edu.field].filter(Boolean).join(" in ");
      const dates = [edu.start_date, edu.end_date].filter(Boolean).join(" -- ");
      return `    \\resumeSubheading
      {${e(edu.institution)}}{${e(edu.location)}}
      {${e(degree)}}{${e(dates)}}`;
    })
    .join("\n");

  return `\\section{Education}
  \\resumeSubHeadingListStart
${entries}
  \\resumeSubHeadingListEnd`;
}

function buildExperience(data: ResumeData): string {
  if (!data.work_experience?.length) return "";

  const entries = data.work_experience
    .map((job) => {
      const dates =
        job.date_ranges && job.date_ranges.length > 0
          ? job.date_ranges
              .map((r) => [r.start_date, r.end_date].filter(Boolean).join(" -- "))
              .join(", ")
          : [job.start_date, job.end_date].filter(Boolean).join(" -- ");
      const bulletList = job.description.filter(Boolean);
      const bulletBlock = bulletList.length
        ? `\n      \\resumeItemListStart\n${bulletList.map((b) => `        \\resumeItem{${e(b)}}`).join("\n")}\n      \\resumeItemListEnd`
        : "";

      return `    \\resumeSubheading
      {${e(job.title)}}{${e(dates)}}
      {${e(job.company)}}{${e(job.location)}}${bulletBlock}`;
    })
    .join("\n\n");

  return `\\section{Experience}
  \\resumeSubHeadingListStart

${entries}

  \\resumeSubHeadingListEnd`;
}

function buildProjects(data: ResumeData): string {
  if (!data.projects?.length) return "";

  const entries = data.projects
    .map((proj) => {
      const tech = proj.technologies?.length
        ? ` $|$ \\emph{${e(proj.technologies.join(", "))}}`
        : "";
      const bulletList = proj.description.filter(Boolean);
      const bulletBlock = bulletList.length
        ? `\n          \\resumeItemListStart\n${bulletList.map((b) => `            \\resumeItem{${e(b)}}`).join("\n")}\n          \\resumeItemListEnd`
        : "";

      return `      \\resumeProjectHeading
          {\\textbf{${e(proj.name)}}${tech}}{}${bulletBlock}`;
    })
    .join("\n");

  return `\\section{Projects}
    \\resumeSubHeadingListStart
${entries}
    \\resumeSubHeadingListEnd`;
}

function buildSkills(data: ResumeData): string {
  if (!data.skills?.length) return "";

  const rows = data.skills
    .map((group) => `     \\textbf{${e(group.category)}}{: ${e(group.items.join(", "))}}`)
    .join(" \\\\\n");

  return `\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${rows}
    }}
 \\end{itemize}`;
}

function buildSummary(data: ResumeData): string {
  if (!data.summary) return "";

  return `\\section{Summary}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     ${e(data.summary)}
    }}
 \\end{itemize}`;
}

function buildCertifications(data: ResumeData): string {
  if (!data.certifications?.length) return "";

  const items = data.certifications
    .map((cert) => `     ${e(cert)}`)
    .join(" \\\\\n");

  return `\\section{Certifications}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
${items}
    }}
 \\end{itemize}`;
}

export function buildJakeResume(data: ResumeData): string {
  const sections = [
    PREAMBLE,
    "",
    "\\begin{document}",
    "",
    buildHeading(data),
    "",
    buildSummary(data),
    "",
    buildEducation(data),
    "",
    buildExperience(data),
    "",
    buildProjects(data),
    "",
    buildSkills(data),
    "",
    buildCertifications(data),
    "",
    "\\end{document}",
  ];

  return sections.filter((s) => s !== undefined).join("\n");
}
