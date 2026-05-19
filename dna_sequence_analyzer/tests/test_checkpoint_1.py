"""Checkpoint 1 smoke tests — Validator and Parser implementations."""

import pytest

from dna_sequence_analyzer.components.validator import Validator
from dna_sequence_analyzer.components.parser import Parser, SequenceRecord


# ---------------------------------------------------------------------------
# Validator tests
# ---------------------------------------------------------------------------

class TestValidator:
    def setup_method(self):
        self.v = Validator()

    def test_valid_iupac_sequence(self):
        result = self.v.validate("ATGCNRYSWKMBDHV")
        assert result.is_valid is True
        assert result.normalized_sequence == "ATGCNRYSWKMBDHV"
        assert result.invalid_characters == []

    def test_empty_string_is_invalid(self):
        result = self.v.validate("")
        assert result.is_valid is False
        assert result.error_message is not None

    def test_whitespace_only_is_invalid(self):
        result = self.v.validate("   ")
        assert result.is_valid is False

    def test_invalid_chars_populates_list(self):
        result = self.v.validate("ATGX1Z")
        assert result.is_valid is False
        assert set(result.invalid_characters) == {"X", "1", "Z"}

    def test_mixed_case_normalized_to_uppercase(self):
        result = self.v.validate("atgcATGC")
        assert result.is_valid is True
        assert result.normalized_sequence == "ATGCATGC"


# ---------------------------------------------------------------------------
# Parser tests
# ---------------------------------------------------------------------------

SINGLE_FASTA = """>seq1 description
ATGCATGC
"""

MULTI_FASTA = """>seq1
ATGC
>seq2
TTTT
>seq3
GGGG
"""

MALFORMED_FASTA = """ATGC
>seq1
ATGC
"""

INVALID_SEQ_FASTA = """>good_seq
ATGC
>bad_seq
ATGX123
>another_good
TTTT
"""


class TestParser:
    def setup_method(self):
        self.p = Parser()

    def test_single_sequence_fasta(self):
        result = self.p.parse_fasta(SINGLE_FASTA)
        assert result.error is None
        assert len(result.records) == 1
        assert result.records[0].header == "seq1 description"
        assert result.records[0].sequence == "ATGCATGC"

    def test_multi_sequence_fasta_count(self):
        result = self.p.parse_fasta(MULTI_FASTA)
        assert result.error is None
        assert len(result.records) == 3

    def test_malformed_fasta_returns_error(self):
        result = self.p.parse_fasta(MALFORMED_FASTA)
        assert result.error is not None
        assert len(result.records) == 0

    def test_invalid_sequence_skipped_with_warning(self):
        result = self.p.parse_fasta(INVALID_SEQ_FASTA)
        assert result.error is None
        # Only the two valid entries should be kept
        assert len(result.records) == 2
        assert any("bad_seq" in w for w in result.warnings)

    def test_round_trip_parse_format_parse(self):
        result1 = self.p.parse_fasta(MULTI_FASTA)
        assert result1.error is None

        formatted = self.p.format_fasta(result1.records)
        result2 = self.p.parse_fasta(formatted)

        assert result2.error is None
        assert len(result2.records) == len(result1.records)
        for r1, r2 in zip(result1.records, result2.records):
            assert r1.header == r2.header
            assert r1.sequence == r2.sequence
