"""Parser component for reading and formatting FASTA files and sequence records."""

from dataclasses import dataclass, field

from dna_sequence_analyzer.components.validator import Validator


@dataclass(frozen=True)
class SequenceRecord:
    header: str    # full header line, excluding leading '>'
    sequence: str  # normalized uppercase nucleotide string


@dataclass
class ParseResult:
    records: list[SequenceRecord] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    error: str | None = None


class Parser:
    def __init__(self) -> None:
        self._validator = Validator()

    def parse_fasta(self, content: str) -> ParseResult:
        """Parse FASTA-formatted content into a list of SequenceRecord objects.

        Returns a ParseResult with valid records, per-entry warnings for skipped
        invalid entries, and a fatal error message if the file is malformed.
        """
        lines = content.splitlines()

        # Check for sequence data before the first header
        for line in lines:
            stripped = line.strip()
            if stripped.startswith(">"):
                break
            if stripped:
                return ParseResult(
                    records=[],
                    warnings=[],
                    error="Malformed FASTA: sequence data found before first header line.",
                )

        records: list[SequenceRecord] = []
        warnings: list[str] = []

        current_header: str | None = None
        current_seq_lines: list[str] = []

        def _flush(header: str, seq_lines: list[str]) -> None:
            raw_seq = "".join(line.strip() for line in seq_lines)
            result = self._validator.validate(raw_seq)
            if result.is_valid:
                records.append(SequenceRecord(header=header, sequence=result.normalized_sequence))
            else:
                warnings.append(f"Skipped entry '{header}': {result.error_message}")

        for line in lines:
            if line.startswith(">"):
                if current_header is not None:
                    _flush(current_header, current_seq_lines)
                current_header = line[1:]  # strip leading '>'
                current_seq_lines = []
            else:
                if current_header is not None:
                    current_seq_lines.append(line)

        # Flush the last entry
        if current_header is not None:
            _flush(current_header, current_seq_lines)

        return ParseResult(records=records, warnings=warnings, error=None)

    def format_fasta(self, records: list[SequenceRecord]) -> str:
        """Format a list of SequenceRecord objects into a FASTA string.

        Sequences are wrapped at 60 characters per line.
        """
        parts: list[str] = []
        for record in records:
            parts.append(f">{record.header}")
            seq = record.sequence
            for i in range(0, len(seq), 60):
                parts.append(seq[i:i + 60])
        return "\n".join(parts) + "\n" if parts else ""
