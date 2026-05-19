# Implementation Plan: DNA Sequence Analyzer

## Overview

Implement the DSA as a Streamlit web application with pure-Python analysis components, Plotly dark-themed charts, ReportLab PDF export, and Hypothesis property-based tests. Tasks follow the layered architecture: project scaffold → core components → analysis engine → output layer → Streamlit UI → visual design → tests.

## Tasks

- [x] 1. Scaffold project structure and install dependencies
  - Create the directory layout: `dna_sequence_analyzer/`, `components/`, `styles/`, `tests/`
  - Create `requirements.txt` with pinned versions: `streamlit>=1.32`, `plotly>=5.0`, `reportlab>=4.0`, `hypothesis>=6.0`, `pytest>=8.0`, `kaleido`
  - Create all `__init__.py` files for the `components/` package
  - Create empty stub files for each module: `app.py`, `cli.py`, `components/validator.py`, `components/parser.py`, `components/analyzer.py`, `components/exporter.py`, `components/pretty_printer.py`, `components/visualizer.py`, `styles/theme.py`
  - _Requirements: 13.2_

- [x] 2. Implement Validator
  - [x] 2.1 Implement `ValidationResult` dataclass and `Validator` class in `components/validator.py`
    - Define `IUPAC_ALPHABET` frozenset: `{A,T,G,C,N,R,Y,S,W,K,M,B,D,H,V}`
    - `validate()` strips whitespace, uppercases, rejects empty input, checks each character, returns `ValidationResult`
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

  - [ ]* 2.2 Write property tests for Validator (Properties 1, 2, 3)
    - **Property 1: Input Normalization to Uppercase** — `iupac_sequence` strategy (mixed case), assert all chars in result are uppercase
    - **Validates: Requirements 1.2, 12.4**
    - **Property 2: Valid IUPAC Input Acceptance** — `iupac_sequence` strategy (uppercase), assert `is_valid=True`
    - **Validates: Requirements 1.3**
    - **Property 3: Invalid Character Rejection and Reporting** — strings with injected non-IUPAC chars, assert `is_valid=False` and all non-IUPAC chars appear in `invalid_characters`
    - **Validates: Requirements 1.4**

  - [ ]* 2.3 Write unit tests for Validator in `tests/test_validator.py`
    - Test empty string, whitespace-only, all-ambiguous sequence, specific invalid chars (`!`, `1`, `Z`), IUPAC boundary chars, mixed case normalization
    - _Requirements: 1.2, 1.3, 1.4, 1.5_

- [x] 3. Implement Parser
  - [x] 3.1 Implement `SequenceRecord` dataclass, `ParseResult`, and `Parser` class in `components/parser.py`
    - `parse_fasta()`: split on `>` lines, join multi-line sequences, normalize to uppercase via `Validator`, skip invalid entries with warnings, detect malformed files (data before header)
    - `format_fasta()`: produce standard FASTA with 60-char line wrapping
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 12.1, 12.2, 12.4_

  - [ ]* 3.2 Write property tests for Parser (Properties 4, 5, 6)
    - **Property 4: FASTA Round-Trip Preservation** — generate valid FASTA strings, parse → format → parse, assert headers and sequences identical
    - **Validates: Requirements 2.8, 12.1, 12.2, 12.3**
    - **Property 5: FASTA Entry Count Preservation** — N-header FASTA strings, assert exactly N records returned
    - **Validates: Requirements 2.2**
    - **Property 6: FASTA Invalid Entry Skipping** — mixed valid/invalid FASTA, assert only valid records returned and one warning per skipped entry
    - **Validates: Requirements 2.4**

  - [ ]* 3.3 Write unit tests for Parser in `tests/test_parser.py`
    - Test multi-line FASTA, single-sequence FASTA, malformed FASTA (data before header), lowercase normalization, header preservation, file with all invalid entries
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 12.1, 12.2, 12.4_

- [x] 4. Checkpoint — Ensure all tests pass
  - Run `pytest tests/test_validator.py tests/test_parser.py tests/test_properties.py -k "validator or parser"` and confirm all pass. Ask the user if questions arise.

- [x] 5. Implement Analyzer — data models and statistics
  - [x] 5.1 Define `NucleotideStats`, `ORFResult`, and `AnalysisResult` dataclasses in `components/analyzer.py`
    - All dataclasses use `frozen=True`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 5.2 Implement `compute_stats()` in `Analyzer`
    - Count A, T, G, C individually; ambiguous = all other IUPAC chars; `gc_content = round((G+C)/length*100, 2)`; `at_content = round((A+T)/length*100, 2)`; handle all-ambiguous edge case (GC=0.00, AT=0.00)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.8_

  - [ ]* 5.3 Write property tests for statistics (Properties 7, 8)
    - **Property 7: Nucleotide Count Invariant** — `iupac_sequence`, assert `a+t+g+c+ambiguous == stats.length == len(sequence)`
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - **Property 8: GC and AT Content Formula Correctness** — `iupac_sequence`, assert formula values and `gc_content + at_content <= 100.0`
    - **Validates: Requirements 3.4, 3.5**

  - [ ]* 5.4 Write unit tests for `compute_stats()` in `tests/test_analyzer.py`
    - Known GC% values, all-ambiguous sequence, single-base sequences, sequences with only G/C
    - _Requirements: 3.1–3.8_

- [x] 6. Implement Analyzer — reverse complement
  - [x] 6.1 Implement `reverse_complement()` in `Analyzer`
    - Define full IUPAC complement table: `A↔T, G↔C, N↔N, R↔Y, Y↔R, S↔S, W↔W, K↔M, M↔K, B↔V, D↔H, H↔D, V↔B`
    - Complement each base then reverse the string
    - _Requirements: 4.1, 4.2_

  - [ ]* 6.2 Write property test for reverse complement (Property 9)
    - **Property 9: Reverse Complement Involution** — `iupac_sequence`, assert `rc(rc(seq)) == seq`
    - **Validates: Requirements 4.1, 4.2, 4.4**

  - [ ]* 6.3 Write unit tests for `reverse_complement()` in `tests/test_analyzer.py`
    - Known complement pairs, ambiguous base preservation, single-char sequences, palindromic sequences
    - _Requirements: 4.1, 4.2_

- [x] 7. Implement Analyzer — six-frame translation
  - [x] 7.1 Implement `translate_frame()` in `Analyzer`
    - Define full 64-codon NCBI Table 1 lookup dict at module level; ambiguous codons → `X`; stop codons → `*`
    - Accept `sequence` and `offset` (0, 1, or 2), iterate codons, return amino acid string
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ]* 7.2 Write property test for six-frame translation (Property 10)
    - **Property 10: Six-Frame Translation Completeness** — `iupac_sequence` (min_size=6), assert `translations` dict has exactly 6 keys and all values contain only valid amino acid characters
    - **Validates: Requirements 5.1, 5.2, 5.3**

  - [ ]* 7.3 Write unit tests for `translate_frame()` in `tests/test_analyzer.py`
    - `ATG` → `M`, `TAA`/`TAG`/`TGA` → `*`, `NNN` → `X`, known protein sequences, offset 0/1/2 correctness
    - _Requirements: 5.3, 5.4, 5.5_

- [x] 8. Implement Analyzer — ORF detection
  - [x] 8.1 Implement `find_longest_orf()` in `Analyzer`
    - Scan the given sequence for ATG…stop codon pairs in the specified frame; report 1-based coordinates relative to the forward strand; return `None` if no ORF found; for reverse frames, translate reverse complement then map coordinates back to forward strand
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [x] 8.2 Implement `analyze()` orchestrator in `Analyzer`
    - Call `compute_stats`, `reverse_complement`, `translate_frame` for all 6 frames, `find_longest_orf` for all 6 frames; assemble and return `AnalysisResult`
    - _Requirements: 3.1–3.8, 4.1, 5.1–5.5, 6.1–6.5_

  - [ ]* 8.3 Write property tests for ORF detection (Properties 11, 12)
    - **Property 11: ORF Structural Invariant** — `iupac_sequence` (min_size=6), for every detected ORF assert `length_nt == end - start + 1`, `start >= 1`, `end <= len(sequence)`
    - **Validates: Requirements 6.1, 6.3, 6.5**
    - **Property 12: Longest ORF Maximality** — sequences with known ORFs, assert no other valid ORF in the same frame is longer than the reported one
    - **Validates: Requirements 6.2**

  - [ ]* 8.4 Write unit tests for ORF detection in `tests/test_analyzer.py`
    - Known ORF positions in all 6 frames, sequence with no ORF, sequence shorter than 6 nt, multiple ORFs (longest selected), reverse-frame coordinate mapping
    - _Requirements: 6.1–6.5_

- [ ] 9. Checkpoint — Ensure all tests pass
  - Run `pytest tests/test_analyzer.py tests/test_properties.py` and confirm all pass. Ask the user if questions arise.

- [ ] 10. Implement Exporter
  - [ ] 10.1 Implement `export_csv()` in `components/exporter.py`
    - Use `csv.writer` with `StringIO`; columns in schema order: `sequence_name, length, a_count, t_count, g_count, c_count, ambiguous_count, gc_pct, at_pct, reverse_complement, orf_+1_start, …, orf_-3_aa, timestamp`; return UTF-8 bytes
    - _Requirements: 9.1, 9.2, 9.3_

  - [ ]* 10.2 Write property test for CSV round-trip (Property 13)
    - **Property 13: CSV Numeric Round-Trip Precision** — generated `AnalysisResult` objects, export to CSV and re-parse, assert `gc_content` and `at_content` differ by ≤ 0.01
    - **Validates: Requirements 9.4**

  - [ ] 10.3 Implement `export_annotated_fasta()` in `Exporter`
    - Append `|len=N|gc=X.XX|at=X.XX|orf_coords=start-end` to each header; preserve original sequence data unchanged
    - _Requirements: 11.1, 11.2_

  - [ ]* 10.4 Write property test for annotated FASTA preservation (Property 14)
    - **Property 14: Annotated FASTA Sequence Preservation** — `iupac_sequence`, export to annotated FASTA then parse, assert extracted sequence equals original
    - **Validates: Requirements 11.2, 11.3**

  - [ ] 10.5 Implement `export_pdf()` in `Exporter`
    - Use ReportLab `SimpleDocTemplate`; include title, generation timestamp, tool version on first page; one section per sequence with all stats, reverse complement, translations, ORF results; embed nucleotide bar chart and GC/AT pie chart as PNG via Plotly `write_image`; graceful fallback if kaleido unavailable
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [ ]* 10.6 Write unit tests for Exporter in `tests/test_exporter.py`
    - CSV column order, CSV filename format, annotated FASTA header format, PDF smoke test (generates bytes without error), kaleido-absent fallback
    - _Requirements: 9.1–9.3, 10.1–10.5, 11.1–11.2_

- [ ] 11. Implement Visualizer
  - [ ] 11.1 Implement `Visualizer` class in `components/visualizer.py`
    - Define `COLORS` dict: `{"purple": "#a855f7", "cyan": "#06b6d4", "teal": "#14b8a6"}`
    - `nucleotide_bar_chart()`: bar chart of A/T/G/C counts using neon accent colors, `template="plotly_dark"`, background `#0a0a0f`
    - `gc_at_pie_chart()`: pie chart of GC vs AT proportions using purple/cyan
    - `sequence_length_histogram()`: histogram of sequence lengths across all results using teal
    - All figures apply dark background and neon axis labels
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 15.2, 15.8_

- [ ] 12. Implement PrettyPrinter
  - [ ] 12.1 Implement `PrettyPrinter` class in `components/pretty_printer.py`
    - `render_summary()`: display sequence name/header, length, A/T/G/C counts, ambiguous count, GC%, AT%, GC content warning (if <30% or >70%), reverse complement, six-frame translations, longest ORF per frame using `st.metric`, `st.expander`, and `st.markdown`
    - `render_multi_sequence_table()`: display summary table with name, length, GC%, AT%, longest ORF length using `st.dataframe`; support row selection to trigger full detail view
    - Prefix each stat row with a colored dot indicator from the neon accent palette
    - _Requirements: 8.1, 8.2, 8.3, 15.4, 15.5_

- [ ] 13. Implement CSS theme and inject_css
  - [ ] 13.1 Implement `styles/theme.py`
    - Define `CSS` string constant with: near-black background `#0a0a0f`, neon accent palette (purple `#a855f7`, cyan `#06b6d4`, teal `#14b8a6`), glass-morphism card styles (semi-transparent dark background, subtle border, no opaque white fill), purple-to-cyan gradient for primary buttons, dark Streamlit sidebar and header overrides, responsive layout rules for ≥375px and ≥1024px
    - Implement `inject_css()` that calls `st.markdown(f"<style>{CSS}</style>", unsafe_allow_html=True)`
    - _Requirements: 15.1, 15.2, 15.6, 15.7, 15.9, 15.10_

- [ ] 14. Implement Streamlit app entry point
  - [ ] 14.1 Implement `app.py` — layout and input section
    - Call `inject_css()` at startup
    - Render DNA double helix SVG/HTML graphic in the hero/header area
    - Render two input tabs: "Paste Sequence" (text area) and "Upload FASTA" (file uploader accepting `.fasta`, `.fa`, `.txt`)
    - Render "Analyze" button with purple-to-cyan gradient (applied via CSS class)
    - _Requirements: 1.1, 2.1, 14.1, 15.3, 15.7_

  - [ ] 14.2 Implement `app.py` — analysis orchestration and results display
    - On "Analyze" click: validate raw paste via `Validator` or parse FASTA via `Parser`; display descriptive errors for invalid input; show progress bar during batch analysis; call `Analyzer.analyze()` for each valid record
    - For single sequence: call `PrettyPrinter.render_summary()` and render nucleotide bar chart + GC/AT pie chart via `Visualizer`
    - For multiple sequences: call `PrettyPrinter.render_multi_sequence_table()`; on row selection render full detail + all three chart types
    - Display GC content warnings (< 30% or > 70%) using `st.warning()`
    - Wrap all analysis in try/except; display `st.error()` with actionable guidance; log full traceback to `dsa_errors.log`
    - _Requirements: 1.4, 1.5, 2.3, 2.4, 2.6, 2.7, 3.6, 3.7, 7.1, 7.2, 7.3, 8.1, 8.2, 8.3, 14.2, 14.3_

  - [ ] 14.3 Implement `app.py` — export buttons
    - Render "Export CSV", "Export PDF", and "Export Annotated FASTA" download buttons using `st.download_button`
    - Generate filenames with `datetime.now().strftime("dsa_report_%Y%m%d_%H%M%S")` suffix
    - Apply gradient button styling via CSS class
    - _Requirements: 9.1, 9.3, 10.5, 11.1, 15.7_

- [ ] 15. Implement CLI entry point
  - [ ] 15.1 Implement `cli.py` using Click
    - `analyze` command: accepts `--sequence` (raw string) or `--file` (FASTA path), runs full analysis pipeline, prints formatted summary to stdout, supports `--output-csv` and `--output-fasta` flags
    - _Requirements: 13.2_

- [ ] 16. Implement performance test
  - [ ] 16.1 Write `tests/test_performance.py`
    - Generate 50 sequences of 10,000 bases each, time full analysis pipeline, assert completion within 10 seconds
    - _Requirements: 13.1_

- [ ] 17. Final checkpoint — Ensure all tests pass
  - Run `pytest tests/ --tb=short` and confirm all tests pass. Ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests in `tests/test_properties.py` use `@settings(max_examples=100)` and are annotated with `# Feature: dna-sequence-analyzer, Property N: <property_text>`
- Checkpoints ensure incremental validation before building on top of each layer
- The `kaleido` package is required for chart embedding in PDF; the exporter degrades gracefully if absent
