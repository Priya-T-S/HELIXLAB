"""Checkpoint 2 smoke tests — Analyzer implementation."""

import pytest

from dna_sequence_analyzer.components.analyzer import Analyzer, AnalysisResult
from dna_sequence_analyzer.components.parser import SequenceRecord


@pytest.fixture
def analyzer():
    return Analyzer()


# ---------------------------------------------------------------------------
# compute_stats
# ---------------------------------------------------------------------------

class TestComputeStats:
    def test_all_gc_is_100_percent(self, analyzer):
        stats = analyzer.compute_stats("GGCC")
        assert stats.gc_content == 100.0
        assert stats.at_content == 0.0

    def test_all_at_is_0_gc(self, analyzer):
        stats = analyzer.compute_stats("AATT")
        assert stats.gc_content == 0.0
        assert stats.at_content == 100.0

    def test_equal_gc_at_is_50_percent(self, analyzer):
        stats = analyzer.compute_stats("ATGC")
        assert stats.gc_content == 50.0
        assert stats.at_content == 50.0

    def test_counts_are_correct(self, analyzer):
        stats = analyzer.compute_stats("AATGC")
        assert stats.a_count == 2
        assert stats.t_count == 1
        assert stats.g_count == 1
        assert stats.c_count == 1
        assert stats.length == 5

    def test_ambiguous_bases_counted(self, analyzer):
        stats = analyzer.compute_stats("ATGCN")
        assert stats.ambiguous_count == 1
        assert stats.length == 5


# ---------------------------------------------------------------------------
# reverse_complement
# ---------------------------------------------------------------------------

class TestReverseComplement:
    def test_known_result(self, analyzer):
        assert analyzer.reverse_complement("ATGC") == "GCAT"

    def test_involution_standard_bases(self, analyzer):
        seq = "ATGCNR"
        assert analyzer.reverse_complement(analyzer.reverse_complement(seq)) == seq

    def test_single_base(self, analyzer):
        assert analyzer.reverse_complement("A") == "T"
        assert analyzer.reverse_complement("T") == "A"
        assert analyzer.reverse_complement("G") == "C"
        assert analyzer.reverse_complement("C") == "G"


# ---------------------------------------------------------------------------
# translate_frame
# ---------------------------------------------------------------------------

class TestTranslateFrame:
    def test_atgtaa_offset_0_gives_m_stop(self, analyzer):
        assert analyzer.translate_frame("ATGTAA", 0) == "M*"

    def test_nnn_codon_gives_x(self, analyzer):
        assert analyzer.translate_frame("NNN", 0) == "X"

    def test_offset_1_on_aatgtaa(self, analyzer):
        # AATGTAA, offset 1 → ATG TAA → "M*"
        assert analyzer.translate_frame("AATGTAA", 1) == "M*"

    def test_incomplete_trailing_codon_ignored(self, analyzer):
        # ATGC → only ATG is a full codon
        assert analyzer.translate_frame("ATGC", 0) == "M"


# ---------------------------------------------------------------------------
# find_longest_orf
# ---------------------------------------------------------------------------

class TestFindLongestOrf:
    def test_finds_orf_in_frame_plus1(self, analyzer):
        # ATG ATG TAA — nested ORFs; longest from first ATG
        result = analyzer.find_longest_orf("ATGATGTAA", "+1")
        assert result is not None
        assert result.frame == "+1"
        assert "M" in result.amino_acid_sequence
        assert "*" in result.amino_acid_sequence

    def test_no_atg_returns_none(self, analyzer):
        result = analyzer.find_longest_orf("TTTTTTAAA", "+1")
        assert result is None

    def test_orf_length_is_multiple_of_3(self, analyzer):
        result = analyzer.find_longest_orf("ATGATGTAA", "+1")
        assert result is not None
        assert result.length_nt % 3 == 0

    def test_orf_result_has_correct_frame(self, analyzer):
        result = analyzer.find_longest_orf("ATGTAA", "+1")
        assert result is not None
        assert result.frame == "+1"


# ---------------------------------------------------------------------------
# analyze
# ---------------------------------------------------------------------------

class TestAnalyze:
    def test_returns_analysis_result(self, analyzer):
        record = SequenceRecord(header="test", sequence="ATGATGTAA")
        result = analyzer.analyze(record)
        assert isinstance(result, AnalysisResult)

    def test_translations_has_all_six_frames(self, analyzer):
        record = SequenceRecord(header="test", sequence="ATGATGTAA")
        result = analyzer.analyze(record)
        assert set(result.translations.keys()) == {"+1", "+2", "+3", "-1", "-2", "-3"}

    def test_orfs_has_all_six_frames(self, analyzer):
        record = SequenceRecord(header="test", sequence="ATGATGTAA")
        result = analyzer.analyze(record)
        assert set(result.orfs.keys()) == {"+1", "+2", "+3", "-1", "-2", "-3"}

    def test_record_preserved_in_result(self, analyzer):
        record = SequenceRecord(header="myseq", sequence="ATGCATGC")
        result = analyzer.analyze(record)
        assert result.record is record

    def test_stats_computed(self, analyzer):
        record = SequenceRecord(header="test", sequence="ATGC")
        result = analyzer.analyze(record)
        assert result.stats.length == 4
        assert result.stats.gc_content == 50.0

    def test_reverse_complement_computed(self, analyzer):
        record = SequenceRecord(header="test", sequence="ATGC")
        result = analyzer.analyze(record)
        assert result.reverse_complement == "GCAT"
