"""Analyzer component for computing nucleotide statistics, reverse complements, translations, and ORFs."""

from __future__ import annotations

from dataclasses import dataclass

from dna_sequence_analyzer.components.parser import SequenceRecord

IUPAC_COMPLEMENT = {
    'A': 'T', 'T': 'A', 'G': 'C', 'C': 'G',
    'N': 'N', 'R': 'Y', 'Y': 'R', 'S': 'S',
    'W': 'W', 'K': 'M', 'M': 'K', 'B': 'V',
    'D': 'H', 'H': 'D', 'V': 'B'
}

CODON_TABLE = {
    'TTT': 'F', 'TTC': 'F', 'TTA': 'L', 'TTG': 'L',
    'CTT': 'L', 'CTC': 'L', 'CTA': 'L', 'CTG': 'L',
    'ATT': 'I', 'ATC': 'I', 'ATA': 'I', 'ATG': 'M',
    'GTT': 'V', 'GTC': 'V', 'GTA': 'V', 'GTG': 'V',
    'TCT': 'S', 'TCC': 'S', 'TCA': 'S', 'TCG': 'S',
    'CCT': 'P', 'CCC': 'P', 'CCA': 'P', 'CCG': 'P',
    'ACT': 'T', 'ACC': 'T', 'ACA': 'T', 'ACG': 'T',
    'GCT': 'A', 'GCC': 'A', 'GCA': 'A', 'GCG': 'A',
    'TAT': 'Y', 'TAC': 'Y', 'TAA': '*', 'TAG': '*',
    'CAT': 'H', 'CAC': 'H', 'CAA': 'Q', 'CAG': 'Q',
    'AAT': 'N', 'AAC': 'N', 'AAA': 'K', 'AAG': 'K',
    'GAT': 'D', 'GAC': 'D', 'GAA': 'E', 'GAG': 'E',
    'TGT': 'C', 'TGC': 'C', 'TGA': '*', 'TGG': 'W',
    'CGT': 'R', 'CGC': 'R', 'CGA': 'R', 'CGG': 'R',
    'AGT': 'S', 'AGC': 'S', 'AGA': 'R', 'AGG': 'R',
    'GGT': 'G', 'GGC': 'G', 'GGA': 'G', 'GGG': 'G',
}

_ACGT = frozenset('ACGT')


@dataclass(frozen=True)
class NucleotideStats:
    length: int
    a_count: int
    t_count: int
    g_count: int
    c_count: int
    ambiguous_count: int
    gc_content: float   # percentage, rounded to 2 decimal places
    at_content: float   # percentage, rounded to 2 decimal places


@dataclass(frozen=True)
class ORFResult:
    frame: str          # "+1", "+2", "+3", "-1", "-2", "-3"
    start: int          # 1-based, relative to forward sequence
    end: int            # 1-based, relative to forward sequence
    length_nt: int
    amino_acid_sequence: str


@dataclass(frozen=True)
class AnalysisResult:
    record: SequenceRecord
    stats: NucleotideStats
    reverse_complement: str
    translations: dict[str, str]            # frame_id -> amino acid string
    orfs: dict[str, ORFResult | None]       # frame_id -> longest ORF or None
    all_orfs: dict[str, list[ORFResult]]    # frame_id -> list of all ORFs


class Analyzer:
    def compute_stats(self, sequence: str) -> NucleotideStats:
        """Compute nucleotide statistics for a normalized uppercase DNA sequence."""
        length = len(sequence)
        a = sequence.count("A")
        t = sequence.count("T")
        g = sequence.count("G")
        c = sequence.count("C")
        ambiguous = length - a - t - g - c

        unambiguous = a + t + g + c
        if length == 0 or unambiguous == 0:
            gc_content = 0.00
            at_content = 0.00
        else:
            gc_content = round((g + c) / length * 100, 2)
            at_content = round((a + t) / length * 100, 2)

        return NucleotideStats(
            length=length,
            a_count=a,
            t_count=t,
            g_count=g,
            c_count=c,
            ambiguous_count=ambiguous,
            gc_content=gc_content,
            at_content=at_content,
        )

    def reverse_complement(self, sequence: str) -> str:
        """Return the reverse complement of a normalized uppercase IUPAC DNA sequence."""
        complemented = [IUPAC_COMPLEMENT[base] for base in sequence]
        return ''.join(reversed(complemented))

    def translate_frame(self, sequence: str, offset: int) -> str:
        """Translate a DNA sequence starting at the given offset, in steps of 3."""
        amino_acids = []
        seq = sequence[offset:]
        for i in range(0, len(seq) - 2, 3):
            codon = seq[i:i + 3]
            if all(c in _ACGT for c in codon):
                amino_acids.append(CODON_TABLE[codon])
            else:
                amino_acids.append('X')
        return ''.join(amino_acids)

    def find_longest_orf(self, sequence: str, frame: str) -> ORFResult | None:
        """Find the longest ORF in the given reading frame."""
        frame_num = int(frame)
        is_reverse = frame_num < 0

        if is_reverse:
            scan_seq = self.reverse_complement(sequence)
            offset = abs(frame_num) - 1
        else:
            scan_seq = sequence
            offset = frame_num - 1

        best: ORFResult | None = None

        codons = []
        for i in range(offset, len(scan_seq) - 2, 3):
            codons.append((i, scan_seq[i:i + 3]))

        i = 0
        while i < len(codons):
            pos, codon = codons[i]
            if codon == 'ATG':
                # found start — scan for stop
                for j in range(i, len(codons)):
                    _, c = codons[j]
                    if c in ('TAA', 'TAG', 'TGA'):
                        # complete ORF: from codons[i] to codons[j] inclusive
                        rc_start = pos          # 0-based on scan_seq
                        rc_end = codons[j][0] + 2  # 0-based last nt on scan_seq
                        orf_len = rc_end - rc_start + 1

                        if is_reverse:
                            fwd_start = len(sequence) - rc_end - 1 + 1   # 1-based
                            fwd_end = len(sequence) - rc_start            # 1-based
                        else:
                            fwd_start = rc_start + 1   # 1-based
                            fwd_end = rc_end + 1        # 1-based

                        aa_seq = self.translate_frame(scan_seq, rc_start)
                        # trim to just this ORF (up to and including stop)
                        orf_codon_count = (j - i) + 1
                        aa_seq = aa_seq[:orf_codon_count]

                        if best is None or orf_len > best.length_nt:
                            best = ORFResult(
                                frame=frame,
                                start=fwd_start,
                                end=fwd_end,
                                length_nt=orf_len,
                                amino_acid_sequence=aa_seq,
                            )
                        break
            i += 1

        return best

    def find_all_orfs(self, sequence: str, frame: str, min_length: int = 90) -> list[ORFResult]:
        """Find all ORFs in the given reading frame with minimum length."""
        frame_num = int(frame)
        is_reverse = frame_num < 0

        if is_reverse:
            scan_seq = self.reverse_complement(sequence)
            offset = abs(frame_num) - 1
        else:
            scan_seq = sequence
            offset = frame_num - 1

        orfs: list[ORFResult] = []

        codons = []
        for i in range(offset, len(scan_seq) - 2, 3):
            codons.append((i, scan_seq[i:i + 3]))

        i = 0
        while i < len(codons):
            pos, codon = codons[i]
            if codon == 'ATG':
                # found start — scan for stop
                for j in range(i, len(codons)):
                    _, c = codons[j]
                    if c in ('TAA', 'TAG', 'TGA'):
                        # complete ORF: from codons[i] to codons[j] inclusive
                        rc_start = pos          # 0-based on scan_seq
                        rc_end = codons[j][0] + 2  # 0-based last nt on scan_seq
                        orf_len = rc_end - rc_start + 1

                        if orf_len >= min_length:
                            if is_reverse:
                                fwd_start = len(sequence) - rc_end - 1 + 1   # 1-based
                                fwd_end = len(sequence) - rc_start            # 1-based
                            else:
                                fwd_start = rc_start + 1   # 1-based
                                fwd_end = rc_end + 1        # 1-based

                            aa_seq = self.translate_frame(scan_seq, rc_start)
                            # trim to just this ORF (up to and including stop)
                            orf_codon_count = (j - i) + 1
                            aa_seq = aa_seq[:orf_codon_count]

                            orfs.append(ORFResult(
                                frame=frame,
                                start=fwd_start,
                                end=fwd_end,
                                length_nt=orf_len,
                                amino_acid_sequence=aa_seq,
                            ))
                        break
            i += 1

        return orfs

    def analyze(self, record: SequenceRecord) -> AnalysisResult:
        """Run full analysis on a SequenceRecord."""
        sequence = record.sequence
        stats = self.compute_stats(sequence)
        rc = self.reverse_complement(sequence)

        translations = {
            '+1': self.translate_frame(sequence, 0),
            '+2': self.translate_frame(sequence, 1),
            '+3': self.translate_frame(sequence, 2),
            '-1': self.translate_frame(rc, 0),
            '-2': self.translate_frame(rc, 1),
            '-3': self.translate_frame(rc, 2),
        }

        orfs = {
            '+1': self.find_longest_orf(sequence, '+1'),
            '+2': self.find_longest_orf(sequence, '+2'),
            '+3': self.find_longest_orf(sequence, '+3'),
            '-1': self.find_longest_orf(sequence, '-1'),
            '-2': self.find_longest_orf(sequence, '-2'),
            '-3': self.find_longest_orf(sequence, '-3'),
        }

        all_orfs = {
            '+1': self.find_all_orfs(sequence, '+1'),
            '+2': self.find_all_orfs(sequence, '+2'),
            '+3': self.find_all_orfs(sequence, '+3'),
            '-1': self.find_all_orfs(sequence, '-1'),
            '-2': self.find_all_orfs(sequence, '-2'),
            '-3': self.find_all_orfs(sequence, '-3'),
        }

        return AnalysisResult(
            record=record,
            stats=stats,
            reverse_complement=rc,
            translations=translations,
            orfs=orfs,
            all_orfs=all_orfs,
        )
