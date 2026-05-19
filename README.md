# HELIXLAB 🧬

HelixLab is a modern full-stack bioinformatics platform for DNA sequence analysis, featuring ORF detection, CRISPR guide discovery, restriction mapping, codon optimization, and interactive genomic visualizations.

---

## 🚀 Features

- DNA sequence analysis
- ORF (Open Reading Frame) detection
- CRISPR Guide RNA finder
- Restriction enzyme mapping
- Codon optimization
- Reverse complement generation
- GC/AT content analysis
- 6-frame translation
- Interactive genomic visualizations
- PDF report export
- FASTA file support

---

## 🛠️ Tech Stack

### Frontend
- Next.js 16
- React 18
- TypeScript
- Tailwind CSS
- Framer Motion
- Three.js
- Recharts

### Backend
- Python 3.12
- Flask
- flask-cors
- pytest

---

## 🧬 Modules

### ORF Detection
- Detects ORFs across all 6 reading frames
- Calculates GC content, molecular weight, and isoelectric point
- Interactive ORF visualization

### Restriction Mapping
- Supports multiple restriction enzymes
- Detects cut positions and fragment sizes
- Sticky/blunt end analysis

### CRISPR Guide Finder
- SpCas9 NGG PAM support
- Guide efficiency scoring
- Off-target risk estimation

### Codon Optimizer
- Organism-specific codon optimization
- CAI calculation
- Protein sequence preservation

---

## 📸 Screenshots

### Landing Page
<img width="1866" height="846" alt="Screenshot 2026-05-19 191434" src="https://github.com/user-attachments/assets/182d6511-6be5-48f1-bfc1-c8540ddfcf41" />


### Analyzer Workspace
<img width="1851" height="832" alt="Screenshot 2026-05-19 191509" src="https://github.com/user-attachments/assets/81d342d4-0f34-49b8-9f7c-fd96d15dfae3" />


### ORF Detection
<img width="1857" height="832" alt="Screenshot 2026-05-19 191621" src="https://github.com/user-attachments/assets/5eeb6498-1ae8-414b-b681-c2e1099bd1b1" />
<img width="1852" height="837" alt="Screenshot 2026-05-19 191947" src="https://github.com/user-attachments/assets/fd24ab22-5714-4737-b2fc-de0758a9bec0" />


### Restriction Mapping
<img width="1852" height="826" alt="Screenshot 2026-05-19 191924" src="https://github.com/user-attachments/assets/62762a5f-f572-4fe6-8138-b36005656b69" />


### CRISPR Guide Finder
<img width="1851" height="828" alt="Screenshot 2026-05-19 191727" src="https://github.com/user-attachments/assets/14de9037-43f1-435d-9b13-fab8d2360238" />
<img width="1852" height="830" alt="Screenshot 2026-05-19 191744" src="https://github.com/user-attachments/assets/fdb8b6b7-8a37-43e4-8fe8-ee8c5cbed428" />


### Codon Optimizer
<img width="1858" height="841" alt="Screenshot 2026-05-19 191840" src="https://github.com/user-attachments/assets/13c99390-0ea1-4a12-8180-c694bc35769b" />

### Documentation
<img width="1847" height="832" alt="Screenshot 2026-05-19 192010" src="https://github.com/user-attachments/assets/b2af27a4-3803-45b2-be77-76b586ca2c43" />


---

## ⚙️ Installation

### Clone Repository

```bash
git clone https://github.com/Priya-T-S/HELIXLAB.git
cd HELIXLAB
```

---

## ▶️ Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```bash
http://localhost:3000
```

---

## ▶️ Run Backend

```bash
pip install -r dna_sequence_analyzer/requirements.txt
python -m dna_sequence_analyzer.api
```

Backend runs on:

```bash
http://localhost:5000
```

---

## 🧪 Running Tests

```bash
pytest dna_sequence_analyzer/tests/
```

---

## 🎨 UI/UX

- Dark biotech-inspired interface
- Glassmorphism components
- Responsive layouts
- Interactive animations
- 3D DNA helix visualization

---

## 📌 Future Improvements

- User authentication system
- Database persistence
- Advanced CRISPR off-target analysis
- Enhanced ORF prediction accuracy
- Cloud deployment
- Real-time collaboration

---


## 👩‍💻 Author

Priya T S

---

## 📄 License

This project is licensed under the MIT License.
