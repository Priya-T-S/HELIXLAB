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
![Landing Page](PASTE_IMAGE_LINK_HERE)

### Analyzer Workspace
![Analyzer](PASTE_IMAGE_LINK_HERE)

### ORF Detection
![ORF Detection](PASTE_IMAGE_LINK_HERE)

### Restriction Mapping
![Restriction Mapping](PASTE_IMAGE_LINK_HERE)

### CRISPR Guide Finder
![CRISPR](PASTE_IMAGE_LINK_HERE)

### Codon Optimizer
![Codon Optimizer](PASTE_IMAGE_LINK_HERE)

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
